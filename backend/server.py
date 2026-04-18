from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    role: str = "reviewer"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "reviewer"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class VerificationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_type: str
    image_base64: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None

class ExtractedData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str
    raw_text: str
    structured_data: Dict[str, Any]
    confidence_scores: Dict[str, float]
    extraction_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValidationResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str
    is_valid: bool
    tamper_detected: bool
    validation_checks: Dict[str, Any]
    ai_reasoning: str
    validation_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    action: str
    user_email: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    details: Dict[str, Any]

class VerificationUpload(BaseModel):
    document_type: str
    image_base64: str

class ReviewDecision(BaseModel):
    decision: str
    notes: Optional[str] = ""

class DashboardStats(BaseModel):
    total_scans: int
    pending_review: int
    tamper_alerts: int
    approval_rate: float

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = User(
        email=user_data.email,
        password_hash=password_hash,
        name=user_data.name,
        role=user_data.role or "reviewer"
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email)
    
    return TokenResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    
    return TokenResponse(
        token=token,
        user={
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    )

@api_router.post("/verify/upload")
async def upload_document(data: VerificationUpload, user: dict = Depends(verify_token)):
    request = VerificationRequest(
        document_type=data.document_type,
        image_base64=data.image_base64,
        created_by=user['email']
    )
    
    request_dict = request.model_dump()
    request_dict['created_at'] = request_dict['created_at'].isoformat()
    request_dict['updated_at'] = request_dict['updated_at'].isoformat()
    
    await db.verification_requests.insert_one(request_dict)
    
    audit = AuditLog(
        request_id=request.id,
        action="document_uploaded",
        user_email=user['email'],
        details={"document_type": data.document_type}
    )
    audit_dict = audit.model_dump()
    audit_dict['timestamp'] = audit_dict['timestamp'].isoformat()
    await db.audit_logs.insert_one(audit_dict)
    
    asyncio.create_task(process_ocr_extraction(request.id, data.image_base64, data.document_type))
    
    return {"request_id": request.id, "status": "processing"}

async def process_ocr_extraction(request_id: str, image_base64: str, document_type: str):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ocr_{request_id}",
            system_message="You are an expert OCR system for identity documents. Extract all text and data accurately."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Extract all information from this {document_type} document. 
        Provide structured data in JSON format with these fields:
        - document_type
        - document_number
        - name
        - date_of_birth
        - address (if present)
        - issue_date (if present)
        - expiry_date (if present)
        - confidence_score (0-1 for each field)
        
        Also assess if there are any signs of tampering or manipulation."""
        
        image_content = ImageContent(image_base64=image_base64)
        user_message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        import json
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                structured_data = json.loads(json_str)
            else:
                structured_data = {"raw_extraction": response}
        except:
            structured_data = {"raw_extraction": response}
        
        confidence_scores = structured_data.get('confidence_score', {})
        if not isinstance(confidence_scores, dict):
            confidence_scores = {"overall": 0.85}
        
        extracted = ExtractedData(
            request_id=request_id,
            raw_text=response,
            structured_data=structured_data,
            confidence_scores=confidence_scores
        )
        
        extracted_dict = extracted.model_dump()
        extracted_dict['extraction_timestamp'] = extracted_dict['extraction_timestamp'].isoformat()
        await db.extracted_data.insert_one(extracted_dict)
        
        await db.verification_requests.update_one(
            {"id": request_id},
            {"$set": {"status": "extracted", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        asyncio.create_task(process_ai_validation(request_id, structured_data, document_type))
        
    except Exception as e:
        logging.error(f"OCR extraction failed: {str(e)}")
        await db.verification_requests.update_one(
            {"id": request_id},
            {"$set": {"status": "error", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

async def process_ai_validation(request_id: str, extracted_data: Dict[str, Any], document_type: str):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"validate_{request_id}",
            system_message="You are an AI validation agent for identity verification. Check for tampering and data consistency."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Analyze this extracted {document_type} data for validation:
        {extracted_data}
        
        Check for:
        1. Data consistency (dates, format, patterns)
        2. Potential tampering signs
        3. Completeness of required fields
        4. Format validation
        
        Respond in JSON format:
        {{
            "is_valid": true/false,
            "tamper_detected": true/false,
            "tamper_confidence": 0-1,
            "validation_checks": {{
                "date_consistency": "pass/fail",
                "format_valid": "pass/fail",
                "completeness": "pass/fail"
            }},
            "reasoning": "explanation",
            "requires_human_review": true/false
        }}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                validation_data = json.loads(json_str)
            else:
                validation_data = {"is_valid": False, "tamper_detected": False, "reasoning": response}
        except:
            validation_data = {"is_valid": False, "tamper_detected": False, "reasoning": response}
        
        validation = ValidationResult(
            request_id=request_id,
            is_valid=validation_data.get('is_valid', False),
            tamper_detected=validation_data.get('tamper_detected', False),
            validation_checks=validation_data.get('validation_checks', {}),
            ai_reasoning=validation_data.get('reasoning', '')
        )
        
        validation_dict = validation.model_dump()
        validation_dict['validation_timestamp'] = validation_dict['validation_timestamp'].isoformat()
        await db.validation_results.insert_one(validation_dict)
        
        if validation.tamper_detected or validation_data.get('requires_human_review', False):
            new_status = "needs_review"
        else:
            new_status = "validated"
        
        await db.verification_requests.update_one(
            {"id": request_id},
            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
    except Exception as e:
        logging.error(f"AI validation failed: {str(e)}")
        await db.verification_requests.update_one(
            {"id": request_id},
            {"$set": {"status": "needs_review", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

@api_router.get("/verify/requests")
async def get_verification_requests(user: dict = Depends(verify_token)):
    requests = await db.verification_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
        if isinstance(req.get('updated_at'), str):
            req['updated_at'] = datetime.fromisoformat(req['updated_at'])
    
    return requests

@api_router.get("/verify/requests/{request_id}")
async def get_verification_request(request_id: str, user: dict = Depends(verify_token)):
    request = await db.verification_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    extracted = await db.extracted_data.find_one({"request_id": request_id}, {"_id": 0})
    validation = await db.validation_results.find_one({"request_id": request_id}, {"_id": 0})
    
    if isinstance(request.get('created_at'), str):
        request['created_at'] = datetime.fromisoformat(request['created_at'])
    if isinstance(request.get('updated_at'), str):
        request['updated_at'] = datetime.fromisoformat(request['updated_at'])
    
    return {
        "request": request,
        "extracted_data": extracted,
        "validation": validation
    }

@api_router.post("/verify/requests/{request_id}/review")
async def review_request(request_id: str, decision: ReviewDecision, user: dict = Depends(verify_token)):
    request = await db.verification_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    new_status = "approved" if decision.decision == "approve" else "rejected"
    
    await db.verification_requests.update_one(
        {"id": request_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    audit = AuditLog(
        request_id=request_id,
        action=f"human_review_{decision.decision}",
        user_email=user['email'],
        details={"notes": decision.notes}
    )
    audit_dict = audit.model_dump()
    audit_dict['timestamp'] = audit_dict['timestamp'].isoformat()
    await db.audit_logs.insert_one(audit_dict)
    
    return {"status": "success", "new_status": new_status}

@api_router.get("/audit/logs")
async def get_audit_logs(user: dict = Depends(verify_token)):
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    
    return logs

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user: dict = Depends(verify_token)):
    total = await db.verification_requests.count_documents({})
    pending = await db.verification_requests.count_documents({"status": "needs_review"})
    tamper_count = await db.validation_results.count_documents({"tamper_detected": True})
    approved = await db.verification_requests.count_documents({"status": "approved"})
    
    approval_rate = (approved / total * 100) if total > 0 else 0.0
    
    return DashboardStats(
        total_scans=total,
        pending_review=pending,
        tamper_alerts=tamper_count,
        approval_rate=round(approval_rate, 2)
    )

@api_router.get("/dashboard/analytics")
async def get_analytics(user: dict = Depends(verify_token)):
    """Get detailed analytics for charts visualization"""
    all_requests = await db.verification_requests.find({}, {"_id": 0}).to_list(1000)
    
    status_counts = {}
    doc_type_counts = {}
    
    for req in all_requests:
        status = req.get('status', 'pending')
        status_counts[status] = status_counts.get(status, 0) + 1
        
        doc_type = req.get('document_type', 'Unknown')
        doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1
    
    status_data = [{"name": k.replace('_', ' ').title(), "value": v} for k, v in status_counts.items()]
    doc_type_data = [{"name": k, "count": v} for k, v in doc_type_counts.items()]
    
    from collections import defaultdict
    timeline = defaultdict(lambda: {"uploads": 0, "approved": 0, "rejected": 0})
    
    for req in all_requests:
        created = req.get('created_at', '')
        if isinstance(created, str):
            try:
                date_key = created[:10]
                timeline[date_key]['uploads'] += 1
                if req.get('status') == 'approved':
                    timeline[date_key]['approved'] += 1
                elif req.get('status') == 'rejected':
                    timeline[date_key]['rejected'] += 1
            except:
                pass
    
    timeline_data = [
        {"date": date, **counts}
        for date, counts in sorted(timeline.items())[-7:]
    ]
    
    return {
        "status_distribution": status_data,
        "document_types": doc_type_data,
        "timeline": timeline_data
    }

@api_router.post("/demo/seed")
async def seed_demo_data(user: dict = Depends(verify_token)):
    """Seed demo verification data for instant showcase"""
    import random
    
    demo_count = await db.verification_requests.count_documents({"created_by": "demo@system"})
    if demo_count > 0:
        return {"status": "already_seeded", "count": demo_count}
    
    demo_data = [
        {"type": "Aadhaar", "status": "approved", "tamper": False, "name": "Rahul Sharma"},
        {"type": "PAN", "status": "approved", "tamper": False, "name": "Priya Patel"},
        {"type": "Passport", "status": "validated", "tamper": False, "name": "Arjun Kumar"},
        {"type": "Aadhaar", "status": "needs_review", "tamper": True, "name": "Suspicious Doc"},
        {"type": "PAN", "status": "rejected", "tamper": True, "name": "Tampered PAN"},
        {"type": "Aadhaar", "status": "approved", "tamper": False, "name": "Sneha Reddy"},
        {"type": "Passport", "status": "needs_review", "tamper": False, "name": "Low Confidence Doc"},
        {"type": "PAN", "status": "approved", "tamper": False, "name": "Vikash Singh"},
    ]
    
    import base64 as b64
    dummy_image = b64.b64encode(b"demo_image_data_placeholder").decode('utf-8')
    
    created_ids = []
    for i, demo in enumerate(demo_data):
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 6), hours=random.randint(0, 23))
        
        request = VerificationRequest(
            document_type=demo["type"],
            image_base64=dummy_image,
            status=demo["status"],
            created_by="demo@system"
        )
        request_dict = request.model_dump()
        request_dict['created_at'] = created_at.isoformat()
        request_dict['updated_at'] = created_at.isoformat()
        await db.verification_requests.insert_one(request_dict)
        created_ids.append(request.id)
        
        extracted = ExtractedData(
            request_id=request.id,
            raw_text=f"Demo extraction for {demo['type']}",
            structured_data={
                "document_type": demo["type"],
                "name": demo["name"],
                "document_number": f"DEMO-{i:04d}-{random.randint(1000, 9999)}",
                "date_of_birth": "1990-01-15",
                "address": "Demo Address, Sample City"
            },
            confidence_scores={"overall": random.uniform(0.7, 0.98)}
        )
        ext_dict = extracted.model_dump()
        ext_dict['extraction_timestamp'] = created_at.isoformat()
        await db.extracted_data.insert_one(ext_dict)
        
        validation = ValidationResult(
            request_id=request.id,
            is_valid=not demo["tamper"],
            tamper_detected=demo["tamper"],
            validation_checks={
                "date_consistency": "pass" if not demo["tamper"] else "fail",
                "format_valid": "pass",
                "completeness": "pass" if not demo["tamper"] else "fail"
            },
            ai_reasoning=f"{'Tamper signals detected in document metadata and pixel inconsistencies.' if demo['tamper'] else 'All validation checks passed. Document appears authentic with high confidence.'}"
        )
        val_dict = validation.model_dump()
        val_dict['validation_timestamp'] = created_at.isoformat()
        await db.validation_results.insert_one(val_dict)
        
        audit = AuditLog(
            request_id=request.id,
            action=f"document_uploaded",
            user_email="demo@system",
            details={"document_type": demo["type"], "demo": True}
        )
        audit_dict = audit.model_dump()
        audit_dict['timestamp'] = created_at.isoformat()
        await db.audit_logs.insert_one(audit_dict)
    
    return {"status": "seeded", "count": len(created_ids), "ids": created_ids}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def seed_admin_users():
    """Seed default admin and reviewer accounts on startup"""
    try:
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@idverify.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
        
        existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
        if not existing_admin:
            password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin_user = User(
                email=admin_email,
                password_hash=password_hash,
                name="Admin User",
                role="admin"
            )
            admin_dict = admin_user.model_dump()
            admin_dict['created_at'] = admin_dict['created_at'].isoformat()
            await db.users.insert_one(admin_dict)
            logger.info(f"Seeded admin user: {admin_email}")
        
        reviewer_email = "reviewer@idverify.com"
        existing_reviewer = await db.users.find_one({"email": reviewer_email}, {"_id": 0})
        if not existing_reviewer:
            password_hash = bcrypt.hashpw("Review@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            reviewer_user = User(
                email=reviewer_email,
                password_hash=password_hash,
                name="Review Agent",
                role="reviewer"
            )
            reviewer_dict = reviewer_user.model_dump()
            reviewer_dict['created_at'] = reviewer_dict['created_at'].isoformat()
            await db.users.insert_one(reviewer_dict)
            logger.info(f"Seeded reviewer user: {reviewer_email}")
        
        await db.users.create_index("email", unique=True)
    except Exception as e:
        logger.error(f"Error seeding users: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()