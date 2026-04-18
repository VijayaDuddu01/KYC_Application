# Auth Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "reviewer"}).pretty()
db.users.findOne({role: "reviewer"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, indexes exist on users.email (unique).

## Step 2: API Testing
```
curl -c cookies.txt -X POST https://ai-identity-verify-2.preview.emergentagent.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@idverify.com","password":"Admin@123"}'
cat cookies.txt
curl -b cookies.txt https://ai-identity-verify-2.preview.emergentagent.com/api/auth/me
```

Login should return the user object and set JWT token. The `/me` call should return the same user using those cookies.

## Step 3: Frontend Testing
- Test registration flow
- Test login flow
- Test protected routes
- Test logout
- Verify error handling for invalid credentials
