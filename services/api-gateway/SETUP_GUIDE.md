# 🔐 Secured Registration System - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Copy the Files
Copy the `api-gateway` folder to your project:
```
your-project/
└── services/
    └── api-gateway/    ← Copy this entire folder
```

### Step 2: Install Dependencies
```bash
cd services/api-gateway
npm install
```

### Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or update .env with your MongoDB Atlas URL
```

### Step 4: Start the Server
```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 📁 File Structure

```
api-gateway/
│
├── .env                    ← Environment variables (secrets)
├── .env.example            ← Template for reference
├── package.json            ← Dependencies
├── security-stress-test.js ← Security testing script
│
├── src/
│   ├── index.js            ← Main server entry
│   │
│   ├── config/
│   │   ├── database.js     ← MongoDB connection
│   │   ├── redis.js        ← Redis connection
│   │   └── rabbitmq.js     ← RabbitMQ (optional)
│   │
│   ├── controllers/
│   │   ├── authController.js   ← Register, Login, OTP logic
│   │   └── kycController.js    ← KYC verification
│   │
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/* endpoints
│   │   ├── kyc.js          ← /api/kyc/* endpoints
│   │   ├── security.js     ← /api/security/* endpoints
│   │   ├── health.js       ← Health check
│   │   ├── proxy.js        ← Service proxy
│   │   └── registry.js     ← Service registry
│   │
│   ├── middleware/
│   │   ├── inputSanitizer.js   ← ⭐ SECURITY (blocks attacks)
│   │   ├── auth.js             ← JWT verification
│   │   ├── rateLimiter.js      ← Rate limiting
│   │   ├── securityHeaders.js  ← Helmet headers
│   │   ├── errorHandler.js     ← Error handling
│   │   └── requestLogger.js    ← Request logging
│   │
│   ├── models/
│   │   └── User.js         ← MongoDB User schema
│   │
│   ├── services/
│   │   ├── emailService.js     ← OTP & Alert emails
│   │   ├── kycService.js       ← Aadhaar/PAN verification
│   │   ├── ServiceRegistry.js  ← Microservice registry
│   │   ├── LoadBalancer.js     ← Load balancing
│   │   └── HealthChecker.js    ← Health monitoring
│   │
│   └── utils/
│       ├── encryption.js       ← AES-256-GCM
│       ├── password.js         ← Argon2id hashing
│       ├── passwordChecker.js  ← Password strength
│       ├── jwt.js              ← JWT utilities
│       └── logger.js           ← Winston logger
│
└── public/                 ← Frontend files (optional)
    ├── kyc.html
    ├── live-monitor.html
    └── js/
        ├── kyc.js
        └── live-monitor.js
```

---

## 🔌 API Endpoints

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (sends OTP) |
| POST | `/api/auth/verify-login-otp` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### KYC Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kyc/initiate` | Start Aadhaar verification |
| POST | `/api/kyc/verify` | Verify Aadhaar OTP |
| GET | `/api/kyc/status` | Get KYC status |

### Security Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/security/alert` | Send attack alert |
| GET | `/api/security/status` | Get security status |

---

## 🔧 Environment Variables (.env)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sdp_registry

# JWT (Change these!)
JWT_SECRET=your-32-char-secret-key-here
JWT_REFRESH_SECRET=another-32-char-secret

# Encryption (32 hex chars)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_TEST_MODE=true

# Security Alerts
# Set to 'true' for production
SECURITY_ALERTS_ENABLED=false
```

---

## 🧪 Test Security

Run the security stress test:
```bash
node security-stress-test.js
```

Expected output:
```
🏆 SECURITY SCORE: 100.0%
🎉 EXCELLENT! All attacks blocked.
```

---

## 🚀 Production Checklist

Before deploying:
- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Change `ENCRYPTION_KEY`
- [ ] Set `EMAIL_TEST_MODE=false`
- [ ] Set `SECURITY_ALERTS_ENABLED=true`
- [ ] Update `MONGODB_URI` to production DB
- [ ] Run security test: `node security-stress-test.js`

---

## 📱 Frontend Integration

### Register a User
```javascript
fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
    })
});
```

### Login (Step 1: Get OTP)
```javascript
fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'SecurePass123!'
    })
});
// OTP sent to email
```

### Verify OTP (Step 2: Get Token)
```javascript
fetch('/api/auth/verify-login-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        otp: '123456'
    })
});
// Returns accessToken
```

### Authenticated Request
```javascript
fetch('/api/auth/me', {
    headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    }
});
```

---

## ❓ Need Help?

1. Check server logs for errors
2. Verify MongoDB is running
3. Check .env file has all required values
4. Run `npm install` to ensure all dependencies

Good luck! 🎉
