import requests
import sys
import json
import base64
from datetime import datetime
import time

class IDVerifyAPITester:
    def __init__(self, base_url="https://ai-identity-verify-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.request_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
    def run_api_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for file uploads
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_test(name, True)
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:200]}"
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_register(self):
        """Test user registration"""
        test_email = f"test_user_{int(time.time())}@idverify.com"
        success, response = self.run_api_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test User",
                "role": "reviewer"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_auth_login(self):
        """Test login with test credentials"""
        success, response = self.run_api_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "admin@idverify.com",
                "password": "Admin@123"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        success, response = self.run_api_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        if success:
            required_fields = ['total_scans', 'pending_review', 'tamper_alerts', 'approval_rate']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Dashboard Stats - Missing {field}", False, f"Field {field} not in response")
                    return False
            return True
        return False

    def create_sample_image_base64(self):
        """Create a simple test image in base64 format"""
        # Create a simple 100x100 pixel image with some pattern
        from PIL import Image, ImageDraw
        import io
        
        try:
            # Create a simple test document image
            img = Image.new('RGB', (400, 300), color='white')
            draw = ImageDraw.Draw(img)
            
            # Add some text-like patterns to simulate a document
            draw.rectangle([50, 50, 350, 100], outline='black', width=2)
            draw.rectangle([50, 120, 350, 170], outline='black', width=2)
            draw.rectangle([50, 190, 350, 240], outline='black', width=2)
            
            # Add some text simulation
            for i in range(5):
                y = 60 + i * 10
                draw.rectangle([60, y, 200, y+5], fill='black')
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return img_str
        except ImportError:
            # Fallback: create a minimal base64 image if PIL is not available
            # This is a 1x1 pixel JPEG image
            return "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"

    def test_document_upload(self):
        """Test document upload"""
        image_base64 = self.create_sample_image_base64()
        
        success, response = self.run_api_test(
            "Document Upload",
            "POST",
            "verify/upload",
            200,
            data={
                "document_type": "Aadhaar",
                "image_base64": image_base64
            }
        )
        if success and 'request_id' in response:
            self.request_id = response['request_id']
            print(f"   Created request ID: {self.request_id}")
            return True
        return False

    def test_get_verification_requests(self):
        """Test getting verification requests"""
        success, response = self.run_api_test(
            "Get Verification Requests",
            "GET",
            "verify/requests",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} verification requests")
            return True
        return False

    def test_get_verification_details(self):
        """Test getting specific verification request details"""
        if not self.request_id:
            self.log_test("Get Verification Details", False, "No request ID available")
            return False
            
        success, response = self.run_api_test(
            "Get Verification Details",
            "GET",
            f"verify/requests/{self.request_id}",
            200
        )
        if success and 'request' in response:
            print(f"   Request status: {response['request'].get('status', 'unknown')}")
            return True
        return False

    def test_review_request(self):
        """Test human review functionality"""
        if not self.request_id:
            self.log_test("Review Request", False, "No request ID available")
            return False
            
        success, response = self.run_api_test(
            "Review Request - Approve",
            "POST",
            f"verify/requests/{self.request_id}/review",
            200,
            data={
                "decision": "approve",
                "notes": "Test approval from automated testing"
            }
        )
        return success

    def test_audit_logs(self):
        """Test audit logs endpoint"""
        success, response = self.run_api_test(
            "Get Audit Logs",
            "GET",
            "audit/logs",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} audit log entries")
            return True
        return False

    def wait_for_processing(self, max_wait=30):
        """Wait for document processing to complete"""
        if not self.request_id:
            return False
            
        print(f"\n⏳ Waiting for document processing (max {max_wait}s)...")
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            success, response = self.run_api_test(
                "Check Processing Status",
                "GET",
                f"verify/requests/{self.request_id}",
                200
            )
            
            if success and 'request' in response:
                status = response['request'].get('status', 'unknown')
                print(f"   Current status: {status}")
                
                if status in ['validated', 'needs_review', 'approved', 'rejected', 'error']:
                    print(f"   Processing completed with status: {status}")
                    return True
                    
            time.sleep(2)
        
        print(f"   Processing did not complete within {max_wait}s")
        return False

def main():
    print("🚀 Starting AI Identity Verification System API Tests")
    print("=" * 60)
    
    tester = IDVerifyAPITester()
    
    # Test authentication first
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    
    if not tester.test_auth_login():
        print("❌ Login failed, trying registration...")
        if not tester.test_auth_register():
            print("❌ Both login and registration failed, stopping tests")
            return 1
    
    # Test dashboard and stats
    print("\n📊 DASHBOARD TESTS")
    print("-" * 30)
    tester.test_dashboard_stats()
    
    # Test verification workflow
    print("\n📄 VERIFICATION WORKFLOW TESTS")
    print("-" * 30)
    
    # Upload document
    if tester.test_document_upload():
        # Wait for processing
        tester.wait_for_processing()
        
        # Test getting requests
        tester.test_get_verification_requests()
        
        # Test getting specific request details
        tester.test_get_verification_details()
        
        # Test review functionality
        tester.test_review_request()
    
    # Test audit logs
    print("\n📝 AUDIT TESTS")
    print("-" * 30)
    tester.test_audit_logs()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())