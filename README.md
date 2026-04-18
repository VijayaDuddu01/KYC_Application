<div align="center">

# 🛡️ AI-Orchestrated Identity Verification System

### Real-time ID Verification with OCR, AI Validation & Human-in-the-Loop Review

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5.2_Vision-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)]()

**A production-grade KYC platform that extracts, validates, and verifies Aadhaar, PAN, and Passport documents using a multi-agent AI pipeline.**

[Live Demo](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [Screenshots](#-screenshots)

</div>

---

## 🎯 Problem Statement

Manual identity verification is slow, error-prone, and doesn't scale. This project solves that by building an **AI-orchestrated verification engine** that:

- Accepts document images (Aadhaar, PAN, Passport)
- Extracts structured data using **GPT-5.2 Vision OCR**
- Runs an automated tamper-detection & validation agent
- Routes low-confidence or flagged documents to a **human-in-the-loop** reviewer
- Logs every action to an immutable audit trail

**Result**: Verification happens in under 4 seconds with transparent decision-making.

---

## ✨ Features

### 🤖 Agentic AI Workflow (ReAct Pattern)
The system uses a true **agentic architecture** — not a fixed pipeline. An **Orchestrator Agent** reasons about intermediate state and dynamically chooses the next action:

- **ORCHESTRATOR** — Meta-agent that plans, reasons, and delegates
- **OCR_AGENT** — Extracts structured data via GPT-5.2 Vision
- **VALIDATION_AGENT** — Runs tamper detection & consistency checks
- **HITL_AGENT** — Routes flagged docs to human reviewers
- **DECISION_AGENT** — Finalizes approve/reject decisions

**Dynamic decision paths** the Orchestrator chooses between:
- **Fast-Track (A)**: OCR confidence > 0.95 & no tamper → skip validation, auto-approve (saves latency & cost)
- **Direct-to-Human (B)**: OCR detects tamper → skip validation, straight to HITL
- **Retry (C)**: OCR confidence < 0.60 → retry extraction with enhanced prompt before escalating
- **Standard (D)**: Uncertain confidence → delegate to VALIDATION_AGENT for second opinion

Every decision is logged with **natural-language reasoning** — full observability into the agent's thought process, visible in the UI as an "Agent Reasoning Trace".

### 📊 Live Control Room Dashboard
- Real-time stat counters (Total Scans, Pending Review, Tamper Alerts, Approval Rate)
- 3 interactive charts: Status Distribution, Document Types, Verification Timeline
- Live audit activity feed
- One-click demo data seeding

### 🔍 Verification Details View
- Split-screen layout: Document image (with pan/zoom) + extracted data
- **Live AI Agent Console** showing streaming processing logs
- Visual 5-stage pipeline with green neon glow for active stages
- Confidence score gradient bars per extracted field
- Signal Red tamper alerts with glitch animation

### 🔐 Security & Compliance
- JWT-based authentication with bcrypt password hashing
- Role-based access (admin / reviewer)
- Complete audit trail for every action
- Auto-seeded admin accounts on startup

### 🎨 Design
- **Aesthetic**: Dark AI Control Room + Swiss High-Contrast hybrid
- **Typography**: Chivo (headings) + IBM Plex Sans (body) + IBM Plex Mono (data)
- **Animations**: Scan lines, pulse rings, flowing pipelines, count-up counters, glitch effects
- **No AI slop**: Sharp corners, 1px borders, intentional color palette (#002FA7 IKB Blue, #00c477 Neon Green, #E63946 Signal Red)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  (Dashboard · Upload · Review Queue · Audit · Details)     │
└────────────────────────┬────────────────────────────────────┘
                         │ REST + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                           │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Auth     │  │  Verification│  │   Audit Logs     │   │
│  │  Endpoints  │  │   Endpoints  │  │    Endpoints     │   │
│  └─────────────┘  └──────┬───────┘  └──────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           AI Orchestration Pipeline                 │   │
│  │  INGESTION → OCR → VALIDATION → HITL → DECISION     │   │
│  └────────────────────┬────────────────────────────────┘   │
└───────────────────────┼──────────────────────────────────────┘
                        │
            ┌───────────┴────────────┐
            ▼                        ▼
    ┌──────────────┐        ┌─────────────────┐
    │   MongoDB    │        │  OpenAI GPT-5.2 │
    │  (Storage)   │        │    Vision API   │
    └──────────────┘        └─────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + React Router
- Tailwind CSS + Shadcn UI primitives
- Recharts (data visualization)
- Phosphor Icons (duotone style)
- react-zoom-pan-pinch (document viewer)
- Axios (HTTP client)

**Backend**
- FastAPI (async Python web framework)
- Motor (async MongoDB driver)
- PyJWT + bcrypt (authentication)
- Pydantic v2 (data validation)
- emergentintegrations (LLM integration layer)

**AI/ML**
- OpenAI GPT-5.2 Vision (OCR + validation)
- Structured JSON output parsing
- Confidence scoring per field

**Infrastructure**
- MongoDB (NoSQL storage)
- Kubernetes-ready (supervisor-managed services)
- Environment-based config (.env)

---

## 📸 Screenshots

> Run the project locally to see:
> - **Login Hero** — Dramatic dark split-screen with "Identity, verified in 3.2 seconds"
> - **Control Room Dashboard** — Dark hero panel with live clock & animated counters
> - **AI Orchestration Engine** — 5-stage pipeline with green neon glow
> - **AI Agent Console** — Streaming terminal logs of agent activity
> - **Verification Details** — Split view with confidence bars and validation results

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or cloud)
- OpenAI API key OR Emergent LLM key

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/KYC_Application.git
cd KYC_Application
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `backend/.env` file:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="kyc_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=your_emergent_key_here
JWT_SECRET=your_random_secret_here
ADMIN_EMAIL=admin@idverify.com
ADMIN_PASSWORD=Admin@123
```

Start the backend:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup
```bash
cd frontend
yarn install
```

Create a `frontend/.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the frontend:
```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

Use these to instantly explore the system:

| Role      | Email                    | Password    |
|-----------|--------------------------|-------------|
| Admin     | admin@idverify.com       | Admin@123   |
| Reviewer  | reviewer@idverify.com    | Review@123  |

**Pro tip**: Click the **"ONE-CLICK DEMO LOGIN"** button on the login page for instant access, then click **"LOAD DEMO DATA"** on the dashboard to see all features populated.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/auth/register`  | Register new user        |
| POST   | `/api/auth/login`     | Login & get JWT token    |

### Verification
| Method | Endpoint                              | Description                         |
|--------|---------------------------------------|-------------------------------------|
| POST   | `/api/verify/upload`                  | Upload a document for verification  |
| GET    | `/api/verify/requests`                | List all verification requests      |
| GET    | `/api/verify/requests/{id}`           | Get a single request + AI results   |
| POST   | `/api/verify/requests/{id}/review`    | Human approve/reject decision       |

### Dashboard & Audit
| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/api/dashboard/stats`       | Top-level metrics        |
| GET    | `/api/dashboard/analytics`   | Chart data               |
| GET    | `/api/audit/logs`            | Complete audit trail     |
| POST   | `/api/demo/seed`             | Seed demo data           |

---

## 🧪 Testing

Backend tests: **11/11 passed ✅**
Frontend tests: **14/14 passed ✅**

Coverage includes:
- Authentication flows (register, login, JWT validation)
- OCR extraction pipeline
- AI validation & tamper detection
- Human review workflow
- Audit logging
- Dashboard analytics
- End-to-end UI flows

---

## 🎬 How the Agentic Workflow Works

This is **not a fixed pipeline** — it's an agentic system where an Orchestrator agent reasons about each intermediate result and dynamically chooses the next action.

### The Orchestrator's Decision Logic

```
User uploads document
         ↓
   [ORCHESTRATOR]
   "Plan: call OCR, then decide"
         ↓
   [OCR_AGENT extracts]
         ↓
   [ORCHESTRATOR decides]  ← KEY AGENTIC DECISION POINT
         │
   ┌─────┼──────┬────────────┬─────────────┐
   ▼     ▼      ▼            ▼             ▼
FAST    HUMAN  RETRY OCR   STANDARD     (auto-recover
TRACK   (tamper (low conf) (uncertain    if error)
(>0.95) in OCR) <0.60)     0.60-0.95)
         ↓                      ↓
     Human Review          [VALIDATION_AGENT]
                                ↓
                          [ORCHESTRATOR decides again]
                                ↓
                      Approve / Human Review
```

### Why This is "Agentic" (Not Just a Pipeline)

1. **Plans before acting** — Orchestrator creates an initial plan, logs it, then executes
2. **Reasons about intermediate state** — Each decision references OCR confidence, tamper signals, validation outcome
3. **Chooses dynamically** — 4 different execution paths based on what it finds
4. **Self-corrects** — Retries OCR with enhanced prompt if confidence is low
5. **Cost-aware** — Fast-tracks high-confidence docs to save LLM calls
6. **Fully observable** — Every decision logged with natural-language reasoning

### Example Reasoning Trace

When you upload a document, the UI shows exactly what the agent thought:

```
[ORCHESTRATOR] plan_created
→ "Received Aadhaar document. Initial plan: call OCR_AGENT first,
   then decide next step based on extraction confidence."

[OCR_AGENT] extraction_complete
→ "Extracted 7 fields. Overall confidence: 0.85. Tamper signals: False."

[ORCHESTRATOR] delegating_to_validation_agent
→ "OCR confidence is 0.85 (in uncertain range). Delegating to
   VALIDATION_AGENT for tamper detection and cross-field consistency checks."

[VALIDATION_AGENT] validation_complete
→ "Validation complete. is_valid=True, tamper=False. Recommendation: auto-decide."

[ORCHESTRATOR] auto_approving
→ "All checks passed. No tamper. Confidence meets threshold.
   Agent auto-approves without human intervention."
```

This is the **ReAct pattern** applied to document verification — reasoning + action traces that give full transparency into AI decision-making.

---

## 🔮 Future Enhancements

- [ ] Face matching between document photo and selfie
- [ ] Pixel-level tamper heatmap overlay on document images
- [ ] Batch document upload
- [ ] Email notifications on review decisions
- [ ] Export audit logs to CSV
- [ ] Webhook integrations for external systems
- [ ] PDF document support
- [ ] Multi-language OCR (regional Indian languages)

---

## 📝 Project Highlights

- ⚡ **Sub-4-second verification** using GPT-5.2 Vision
- 🤖 **Multi-agent orchestration** with clear separation of concerns
- 🎨 **Production-grade UI** with Swiss/Control Room design language
- 🔒 **Security-first**: JWT + bcrypt + audit logging
- 📊 **Observable**: Live AI agent console + real-time dashboard
- 🧩 **Modular**: Easy to swap OCR/validation models

---

## 👤 Author

Built with ❤️ for real-world KYC use cases.

**Tech Focus**: AI/ML Engineering, Full-Stack Development, Production AI Systems

---

<div align="center">

**⭐ If you find this project useful, consider starring the repo!**

</div>
