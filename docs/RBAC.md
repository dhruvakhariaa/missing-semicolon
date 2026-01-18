# MASTER PROMPT: Complete 4-Role RBAC Secured Registration System Implementation

---

## CONTEXT & BACKGROUND

You are building a **Government-Grade Secure Registration System** for a Service Delivery Platform. This system must support **4 distinct user roles** with different registration flows, permissions, and data access levels.

### Current System State
- **Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Security Score:** 100% (154/154 attacks blocked)
- **Existing Protection:** OWASP Top 10 + Advanced Attack Vectors (SQLi, XSS, NoSQL, Command Injection, XXE, etc.)

### Your Mission
Extend this system to support 4 roles while **NEVER compromising the existing security shield**. Every new endpoint must be protected by the same middleware that achieved 100% security score.

---

## SECTION 1: THE 4 ROLES - COMPLETE SPECIFICATION

### Role 1: CITIZEN (Level 1 - Public)

**Description:** Regular users who access government services.

**Registration Method:** 
- Public self-service via `/api/auth/register`
- Anyone can register

**Registration Flow:**
```
Step 1: User visits public registration page
Step 2: User enters: name, email, phone, password
Step 3: System validates input format
Step 4: System sends OTP to email
Step 5: User enters OTP
Step 6: System creates account with role='citizen' (HARDCODED)
Step 7: User can optionally complete KYC (PAN/Aadhaar)
```

**Input Fields:**
| Field | Type | Required | Validation | Storage |
|-------|------|----------|------------|---------|
| name | String | Yes | 2-100 chars, no special chars | Plain |
| email | String | Yes | Valid email format | Plain (indexed) |
| phone | String | Yes | 10 digits | Plain |
| password | String | Yes | Min 8 chars, 1 upper, 1 number, 1 special | Argon2id Hash |
| panNumber | String | No | XXXXX1234X format | AES-256-GCM Encrypted |
| aadhaarNumber | String | No | 12 digits | AES-256-GCM Encrypted |

**Permissions:**
- View own profile
- Update own profile
- File complaints
- Book appointments
- View service status

**Restrictions:**
- CANNOT see other users' data
- CANNOT access admin panels
- CANNOT approve requests

---

### Role 2: SECTOR MANAGER (Level 2 - Invite Only)

**Description:** Department staff who manage specific sectors (Health, Agriculture, Urban, Education).

**Registration Method:**
- INVITE ONLY via secure token link
- Invited by Government Officials

**Registration Flow:**
```
Step 1: Government Official logs in
Step 2: Official goes to "Staff Management" 
Step 3: Official enters manager's email + selects sector
Step 4: System generates cryptographically signed token (JWT)
Step 5: System emails invite link to manager
Step 6: Manager clicks link within 24 hours
Step 7: System verifies token signature and expiry
Step 8: Manager sets password + enters employee details
Step 9: System creates account with role='sector_manager' + assignedSector (LOCKED)
```

**Input Fields (During Invite by Official):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | String | Yes | Must be valid government email |
| sector | String | Yes | Must be one of: healthcare, agriculture, urban, education |

**Input Fields (During Setup by Manager):**
| Field | Type | Required | Validation | Storage |
|-------|------|----------|------------|---------|
| password | String | Yes | Min 8 chars, complex | Argon2id Hash |
| name | String | Yes | 2-100 chars | Plain |
| phone | String | Yes | 10 digits | Plain |
| employeeCode | String | Yes | Alphanumeric | Plain |

**Token Structure (Signed with JWT_SECRET):**
```json
{
  "email": "manager@health.gov.in",
  "role": "sector_manager",
  "sector": "healthcare",
  "invitedBy": "official_user_id",
  "exp": "24 hours from creation"
}
```

**Permissions:**
- View data ONLY in assigned sector
- Create service requests
- Update service requests
- Request data changes (PENDING approval)

**Restrictions:**
- CANNOT approve own requests
- CANNOT access other sectors
- CANNOT invite other users
- CANNOT see system health/metrics

---

### Role 3: GOVERNMENT OFFICIAL (Level 3 - VIP Invite Only)

**Description:** Senior officials who can access all sectors and approve requests.

**Registration Method:**
- VIP INVITE ONLY via secure token link
- Invited by System Administrators

**Registration Flow:**
```
Step 1: System Admin logs in
Step 2: Admin goes to "Official Management"
Step 3: Admin enters official's government email
Step 4: System validates email domain (MUST be @gov.in or whitelisted)
Step 5: System generates VIP token (JWT with extended payload)
Step 6: System emails VIP invite link
Step 7: Official clicks link within 48 hours
Step 8: System verifies token + email domain
Step 9: Official sets password + enters Employee ID
Step 10: System encrypts Employee ID
Step 11: System creates account with role='government_official'
```

**Input Fields (During Invite by Admin):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | String | Yes | MUST end with @gov.in or whitelisted domain |

**Input Fields (During Setup by Official):**
| Field | Type | Required | Validation | Storage |
|-------|------|----------|------------|---------|
| password | String | Yes | Min 12 chars, complex | Argon2id Hash |
| name | String | Yes | 2-100 chars | Plain |
| phone | String | Yes | 10 digits | Plain |
| employeeId | String | Yes | Government ID format | AES-256-GCM Encrypted |
| designation | String | Yes | Official title | Plain |

**Token Structure:**
```json
{
  "email": "minister@health.gov.in",
  "role": "government_official",
  "invitedBy": "admin_user_id",
  "vipLevel": true,
  "exp": "48 hours from creation"
}
```

**Permissions:**
- View ALL sectors' data
- Approve/Reject manager requests
- Create Sector Manager invites
- Add new sectors/services
- View audit logs

**Restrictions:**
- CANNOT create Admin accounts
- CANNOT view system metrics/health
- CANNOT access technical infrastructure

---

### Role 4: SYSTEM ADMINISTRATOR (Level 4 - Database Seeded Only)

**Description:** Technical administrators who manage system health but CANNOT see user data.

**Registration Method:**
- NO REGISTRATION ENDPOINT EXISTS
- Created via secure database seed script
- Requires physical/SSH access to server

**Registration Flow:**
```
Step 1: Developer with server access runs: node scripts/seed-admin.js
Step 2: Script prompts for admin email and password
Step 3: Script hashes password with Argon2id
Step 4: Script directly inserts into MongoDB
Step 5: Admin account exists with role='system_admin'
```

**Input Fields (During Seed Script):**
| Field | Type | Required | Validation | Storage |
|-------|------|----------|------------|---------|
| email | String | Yes | Valid email | Plain |
| password | String | Yes | Min 16 chars, ultra-complex | Argon2id Hash |

**Permissions:**
- View system health/metrics
- View traffic analytics
- View error logs
- Restart services
- Create Government Official invites

**Restrictions:**
- CANNOT view citizen data (Privacy firewall)
- CANNOT view sector data
- CANNOT approve service requests
- CANNOT modify user accounts

---

## SECTION 2: DATABASE SCHEMA SPECIFICATIONS

### Schema 1: User Schema (`models/User.js`)

```javascript
const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    // ========== IDENTITY FIELDS ==========
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
    },

    // ========== SECURITY FIELDS ==========
    passwordHash: {
        type: String,
        required: true,
        select: false // Never return in queries by default
    },
    
    // ========== ROLE BASED ACCESS CONTROL ==========
    role: {
        type: String,
        enum: {
            values: ['citizen', 'sector_manager', 'government_official', 'system_admin'],
            message: '{VALUE} is not a valid role'
        },
        default: 'citizen',
        required: true,
        immutable: true // Cannot be changed after creation
    },
    
    // For Sector Managers ONLY
    assignedSector: {
        type: String,
        enum: {
            values: ['healthcare', 'agriculture', 'urban', 'education', null],
            message: '{VALUE} is not a valid sector'
        },
        default: null,
        validate: {
            validator: function(value) {
                // Sector Manager MUST have a sector
                if (this.role === 'sector_manager' && !value) {
                    return false;
                }
                // Citizens CANNOT have a sector
                if (this.role === 'citizen' && value) {
                    return false;
                }
                return true;
            },
            message: 'Invalid sector assignment for this role'
        }
    },
    
    // For Officials ONLY (Encrypted)
    employeeId: {
        type: String, // Format: iv:authTag:encryptedData
        required: function() {
            return this.role === 'government_official';
        }
    },
    
    employeeCode: {
        type: String,
        required: function() {
            return this.role === 'sector_manager';
        }
    },
    
    designation: {
        type: String,
        required: function() {
            return this.role === 'government_official';
        }
    },
    
    // ========== INVITATION TRACKING ==========
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    invitationToken: {
        type: String,
        select: false
    },
    
    invitationExpires: {
        type: Date,
        select: false
    },
    
    // ========== KYC FIELDS (Citizens & Managers) ==========
    panNumber: {
        type: String, // AES-256-GCM Encrypted
        select: false
    },
    
    aadhaarNumber: {
        type: String, // AES-256-GCM Encrypted
        select: false
    },
    
    kycLevel: {
        type: Number,
        enum: [0, 1, 2], // 0=None, 1=PAN, 2=Aadhaar+PAN
        default: 0
    },
    
    // ========== 2FA & OTP ==========
    loginOtp: {
        type: String, // Hashed OTP
        select: false
    },
    
    loginOtpExpires: {
        type: Date,
        select: false
    },
    
    loginOtpAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    
    lastOtpResend: {
        type: Date,
        select: false
    },
    
    otpResendCount: {
        type: Number,
        default: 0,
        select: false
    },
    
    // ========== ACCOUNT SECURITY ==========
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    
    lockUntil: {
        type: Date,
        select: false
    },
    
    refreshTokens: [{
        token: String,
        expires: Date,
        userAgent: String,
        ip: String
    }],
    
    // ========== STATUS ==========
    isActive: {
        type: Boolean,
        default: true
    },
    
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    
    lastLogin: {
        type: Date
    }
    
}, {
    timestamps: true // createdAt, updatedAt
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
```

---

### Schema 2: Invitation Schema (`models/Invitation.js`)

```javascript
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    
    targetRole: {
        type: String,
        enum: ['sector_manager', 'government_official'],
        required: true
    },
    
    sector: {
        type: String,
        enum: ['healthcare', 'agriculture', 'urban', 'education', null],
        default: null
    },
    
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    tokenExpires: {
        type: Date,
        required: true
    },
    
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired', 'revoked'],
        default: 'pending'
    },
    
    acceptedAt: {
        type: Date
    },
    
    acceptedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    
}, {
    timestamps: true
});

// Auto-expire invitations
invitationSchema.index({ tokenExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invitation', invitationSchema);
```

---

## SECTION 3: API ENDPOINTS SPECIFICATION

### A. Public Authentication Endpoints

#### POST `/api/auth/register` (Citizens Only)
**Access:** Public
**Middleware Chain:** `rateLimiter` → `inputSanitizer` → `validateRegistration`

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePass123!"
}
```

**Controller Logic:**
```javascript
// CRITICAL: Force role to citizen - ignore any role in request body
const userData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    role: 'citizen' // HARDCODED - NEVER from request body
};
```

**Response (Success 201):**
```json
{
    "success": true,
    "message": "Registration successful. Please verify your email.",
    "data": {
        "userId": "64abc...",
        "email": "john@example.com",
        "pendingEmailVerification": true
    }
}
```

---

#### POST `/api/auth/login` (All Roles)
**Access:** Public
**Middleware Chain:** `rateLimiter` → `inputSanitizer` → `validateLogin`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

**Controller Logic:**
1. Find user by email
2. Check if account is locked
3. Verify password with Argon2id
4. Generate 6-digit OTP
5. Hash OTP and store with 5-minute expiry
6. Send OTP to email
7. Return pending OTP status

**Response (Success 200):**
```json
{
    "success": true,
    "message": "OTP sent to your email",
    "data": {
        "pendingOtp": true,
        "email": "jo***@example.com",
        "expiresIn": 300
    }
}
```

---

#### POST `/api/auth/verify-login-otp` (All Roles)
**Access:** Public
**Middleware Chain:** `rateLimiter` → `inputSanitizer`

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**Controller Logic:**
1. Find user with OTP fields
2. Check OTP attempts (max 3)
3. Verify OTP hash matches
4. Check OTP not expired
5. Generate JWT access token (15 min)
6. Generate JWT refresh token (7 days)
7. Store refresh token in user document
8. Clear OTP fields
9. Update lastLogin
10. Return tokens + user info (with role)

**Response (Success 200):**
```json
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGc...",
        "refreshToken": "eyJhbGc...",
        "user": {
            "id": "64abc...",
            "email": "user@example.com",
            "name": "John Doe",
            "role": "citizen",
            "assignedSector": null
        }
    }
}
```

---

### B. Invitation-Based Registration Endpoints

#### POST `/api/auth/setup-account` (Invited Users Only)
**Access:** Public (but requires valid token)
**Middleware Chain:** `rateLimiter` → `inputSanitizer` → `validateSetup`

**Request Body (Sector Manager):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "password": "SecurePass123!",
    "name": "Manager Name",
    "phone": "9876543210",
    "employeeCode": "EMP001"
}
```

**Request Body (Government Official):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "password": "VerySecurePass123!@#",
    "name": "Official Name",
    "phone": "9876543210",
    "employeeId": "GOV123456",
    "designation": "District Collector"
}
```

**Controller Logic:**
```javascript
exports.setupAccount = async (req, res) => {
    try {
        const { token, password, name, phone, employeeCode, employeeId, designation } = req.body;
        
        // 1. Verify token signature and expiry
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Invalid or expired invitation link' }
            });
        }
        
        // 2. Check invitation exists and is pending
        const invitation = await Invitation.findOne({
            token: token,
            status: 'pending',
            tokenExpires: { $gt: new Date() }
        });
        
        if (!invitation) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INVITATION', message: 'Invitation not found or already used' }
            });
        }
        
        // 3. Check email not already registered
        const existingUser = await User.findOne({ email: decoded.email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
            });
        }
        
        // 4. Prepare user data with LOCKED fields from token
        const userData = {
            email: decoded.email,           // LOCKED from token
            role: decoded.role,             // LOCKED from token
            assignedSector: decoded.sector, // LOCKED from token (for managers)
            invitedBy: decoded.invitedBy,   // LOCKED from token
            name: name,
            phone: phone,
            isEmailVerified: true           // Invite = trusted email
        };
        
        // 5. Role-specific fields
        if (decoded.role === 'sector_manager') {
            if (!employeeCode) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_EMPLOYEE_CODE', message: 'Employee code is required' }
                });
            }
            userData.employeeCode = employeeCode;
        }
        
        if (decoded.role === 'government_official') {
            if (!employeeId || !designation) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_OFFICIAL_DETAILS', message: 'Employee ID and designation required' }
                });
            }
            // ENCRYPT employee ID
            userData.employeeId = encryptField(employeeId);
            userData.designation = designation;
        }
        
        // 6. Hash password
        userData.passwordHash = await hashPassword(password);
        
        // 7. Create user
        const user = await User.create(userData);
        
        // 8. Mark invitation as accepted
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date();
        invitation.acceptedUserId = user._id;
        await invitation.save();
        
        // 9. Log the event
        logger.info(`Account setup complete: ${user.email} as ${user.role}`);
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully. You can now login.',
            data: {
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        logger.error('Setup account error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SETUP_FAILED', message: 'Failed to setup account' }
        });
    }
};
```

---

### C. Protected Admin Endpoints

#### POST `/api/admin/invite` (Officials Only - Invite Managers)
**Access:** Authenticated + Role = government_official
**Middleware Chain:** `authenticate` → `rbac.permit('government_official')` → `inputSanitizer` → `validateInvite`

**Request Body:**
```json
{
    "email": "manager@health.gov.in",
    "sector": "healthcare"
}
```

**Controller Logic:**
```javascript
exports.inviteManager = async (req, res) => {
    try {
        const { email, sector } = req.body;
        
        // 1. Validate sector exists
        const validSectors = ['healthcare', 'agriculture', 'urban', 'education'];
        if (!validSectors.includes(sector)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid sector' }
            });
        }
        
        // 2. Check email not already registered
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { message: 'Email already registered' }
            });
        }
        
        // 3. Check no pending invitation
        const pendingInvite = await Invitation.findOne({
            email: email.toLowerCase(),
            status: 'pending',
            tokenExpires: { $gt: new Date() }
        });
        if (pendingInvite) {
            return res.status(409).json({
                success: false,
                error: { message: 'Pending invitation already exists' }
            });
        }
        
        // 4. Generate signed token (24 hour expiry)
        const tokenPayload = {
            email: email.toLowerCase(),
            role: 'sector_manager',
            sector: sector,
            invitedBy: req.user._id
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // 5. Create invitation record
        const invitation = await Invitation.create({
            email: email.toLowerCase(),
            targetRole: 'sector_manager',
            sector: sector,
            token: token,
            tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            invitedBy: req.user._id
        });
        
        // 6. Send email
        const inviteLink = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;
        await sendInvitationEmail(email, {
            inviterName: req.user.name,
            role: 'Sector Manager',
            sector: sector,
            link: inviteLink,
            expiresIn: '24 hours'
        });
        
        // 7. Log
        logger.info(`Invitation sent: ${email} for ${sector} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                email: email,
                sector: sector,
                expiresAt: invitation.tokenExpires
            }
        });
        
    } catch (error) {
        logger.error('Invite manager error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to send invitation' }
        });
    }
};
```

---

#### POST `/api/admin/invite-vip` (Admins Only - Invite Officials)
**Access:** Authenticated + Role = system_admin
**Middleware Chain:** `authenticate` → `rbac.permit('system_admin')` → `inputSanitizer` → `validateVipInvite`

**Request Body:**
```json
{
    "email": "minister@health.gov.in"
}
```

**Controller Logic:**
```javascript
exports.inviteOfficial = async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. STRICT domain validation
        const allowedDomains = ['gov.in', 'nic.in', 'govt.in'];
        const emailDomain = email.split('@')[1];
        const isDomainAllowed = allowedDomains.some(d => emailDomain.endsWith(d));
        
        if (!isDomainAllowed) {
            return res.status(400).json({
                success: false,
                error: { message: 'Only government email domains are allowed' }
            });
        }
        
        // 2. Generate VIP token (48 hour expiry)
        const tokenPayload = {
            email: email.toLowerCase(),
            role: 'government_official',
            invitedBy: req.user._id,
            vipLevel: true
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '48h' });
        
        // 3. Create invitation
        const invitation = await Invitation.create({
            email: email.toLowerCase(),
            targetRole: 'government_official',
            token: token,
            tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
            invitedBy: req.user._id
        });
        
        // 4. Send VIP email
        const inviteLink = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;
        await sendVipInvitationEmail(email, {
            link: inviteLink,
            expiresIn: '48 hours'
        });
        
        logger.info(`VIP Invitation sent: ${email} by ${req.user.email}`);
        
        res.status(201).json({
            success: true,
            message: 'VIP invitation sent successfully'
        });
        
    } catch (error) {
        logger.error('Invite official error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to send VIP invitation' }
        });
    }
};
```

---

## SECTION 4: MIDDLEWARE SPECIFICATIONS

### A. RBAC Middleware (`middleware/rbac.js`)

```javascript
const logger = require('../utils/logger');

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has one of the allowed roles
 */
exports.permit = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Check user is authenticated (from previous auth middleware)
        if (!req.user) {
            logger.warn('RBAC: No user object found');
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Authentication required' }
            });
        }
        
        // 2. Check user has a role
        if (!req.user.role) {
            logger.warn('RBAC: User has no role assigned');
            return res.status(403).json({
                success: false,
                error: { code: 'NO_ROLE', message: 'User role not defined' }
            });
        }
        
        // 3. Check if role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`RBAC: Access denied for ${req.user.email} (${req.user.role}) to ${req.path}`);
            return res.status(403).json({
                success: false,
                error: { 
                    code: 'ACCESS_DENIED', 
                    message: 'You do not have permission to access this resource' 
                }
            });
        }
        
        // 4. Role allowed - proceed
        next();
    };
};

/**
 * Sector Access Middleware
 * For sector managers, restricts access to their assigned sector only
 */
exports.checkSectorAccess = (req, res, next) => {
    // Government officials can access all sectors
    if (req.user.role === 'government_official' || req.user.role === 'system_admin') {
        return next();
    }
    
    // Sector managers can only access their sector
    if (req.user.role === 'sector_manager') {
        const requestedSector = req.params.sector || req.body.sector || req.query.sector;
        
        if (requestedSector && requestedSector !== req.user.assignedSector) {
            logger.warn(`Sector access denied: ${req.user.email} tried to access ${requestedSector}`);
            return res.status(403).json({
                success: false,
                error: { 
                    code: 'SECTOR_ACCESS_DENIED', 
                    message: 'You can only access your assigned sector' 
                }
            });
        }
    }
    
    next();
};

/**
 * Privacy Firewall for System Admins
 * Prevents system admins from accessing user data
 */
exports.privacyFirewall = (req, res, next) => {
    if (req.user.role === 'system_admin') {
        // List of routes admins CANNOT access
        const restrictedPaths = ['/api/users', '/api/citizens', '/api/kyc', '/api/sector'];
        const isRestricted = restrictedPaths.some(path => req.path.startsWith(path));
        
        if (isRestricted) {
            logger.warn(`Privacy firewall: Admin ${req.user.email} blocked from ${req.path}`);
            return res.status(403).json({
                success: false,
                error: { 
                    code: 'PRIVACY_VIOLATION', 
                    message: 'System administrators cannot access user data' 
                }
            });
        }
    }
    
    next();
};
```

---

### B. Input Sanitizer Integration (EXISTING - MUST NOT MODIFY)

**CRITICAL REQUIREMENT:** The existing `inputSanitizer.js` MUST be applied to ALL new routes.

**Route Registration Pattern:**
```javascript
const { strictInputValidation, blockNoSqlInjection, sanitizeOutput } = require('../middleware/inputSanitizer');
const { authenticate } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Public route with full security
router.post('/register',
    strictInputValidation,    // Blocks SQLi, XSS, etc.
    blockNoSqlInjection,      // Blocks MongoDB operators
    authController.register
);

// Protected route with RBAC
router.post('/invite',
    authenticate,             // JWT verification
    rbac.permit('government_official'), // Role check
    strictInputValidation,    // STILL REQUIRED - even for officials!
    blockNoSqlInjection,
    adminController.inviteManager
);
```

---

## SECTION 5: SEED ADMIN SCRIPT

### Script: `scripts/seed-admin.js`

```javascript
#!/usr/bin/env node
/**
 * Admin Seed Script
 * Creates the first system administrator account
 * 
 * Usage: node scripts/seed-admin.js
 * 
 * SECURITY: This script requires direct terminal access.
 * There is NO API endpoint to create system admins.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const { hashPassword } = require('../src/utils/password');
const User = require('../src/models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

async function seedAdmin() {
    console.log('\n==============================================');
    console.log('   SYSTEM ADMINISTRATOR CREATION SCRIPT');
    console.log('==============================================');
    console.log('\n⚠️  This creates the highest privilege account.');
    console.log('⚠️  This script should only be run ONCE during initial setup.\n');
    
    try {
        // 1. Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // 2. Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'system_admin' });
        if (existingAdmin) {
            console.log('❌ A system administrator already exists.');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log('   To create another, use the existing admin to send an invite.\n');
            process.exit(1);
        }
        
        // 3. Get admin details
        const email = await prompt('Enter admin email: ');
        const name = await prompt('Enter admin name: ');
        const password = await prompt('Enter password (min 16 chars): ');
        const confirmPassword = await prompt('Confirm password: ');
        
        // 4. Validate
        if (password !== confirmPassword) {
            console.log('\n❌ Passwords do not match');
            process.exit(1);
        }
        
        if (password.length < 16) {
            console.log('\n❌ Password must be at least 16 characters');
            process.exit(1);
        }
        
        // 5. Create admin
        const passwordHash = await hashPassword(password);
        
        const admin = await User.create({
            email: email.toLowerCase(),
            name: name,
            phone: '0000000000', // Placeholder for admin
            passwordHash: passwordHash,
            role: 'system_admin',
            isEmailVerified: true,
            isActive: true
        });
        
        console.log('\n==============================================');
        console.log('   ✅ SYSTEM ADMINISTRATOR CREATED');
        console.log('==============================================');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin._id}`);
        console.log('\n   You can now login at /admin/login');
        console.log('==============================================\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        rl.close();
    }
}

seedAdmin();
```

---

## SECTION 6: EMAIL TEMPLATES

### Template 1: Manager Invitation Email

```javascript
exports.sendInvitationEmail = async (email, data) => {
    const subject = `You've been invited to join the KYC Portal as ${data.role}`;
    
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🏛️ Government KYC Portal</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
            <h2>You've Been Invited!</h2>
            
            <p>Hello,</p>
            
            <p><strong>${data.inviterName}</strong> has invited you to join the Government KYC Portal as a <strong>${data.role}</strong>.</p>
            
            ${data.sector ? `<p>You will be assigned to the <strong>${data.sector.toUpperCase()}</strong> sector.</p>` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.link}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Accept Invitation
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                ⏰ This invitation expires in <strong>${data.expiresIn}</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
                If you did not expect this invitation, please ignore this email.<br>
                For security, do not share this link with anyone.
            </p>
        </div>
    </div>
    `;
    
    await sendEmail(email, subject, html);
};
```

---

## SECTION 7: ROUTE REGISTRATION

### File: `routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { strictInputValidation, blockNoSqlInjection } = require('../middleware/inputSanitizer');
const rateLimiter = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin, validateSetup } = require('../middleware/validators');

// Public Routes (All protected by security middleware)
router.post('/register',
    rateLimiter.register,
    strictInputValidation,
    blockNoSqlInjection,
    validateRegistration,
    authController.register
);

router.post('/login',
    rateLimiter.login,
    strictInputValidation,
    blockNoSqlInjection,
    validateLogin,
    authController.login
);

router.post('/verify-login-otp',
    rateLimiter.otp,
    strictInputValidation,
    authController.verifyLoginOtp
);

router.post('/setup-account',
    rateLimiter.setup,
    strictInputValidation,
    blockNoSqlInjection,
    validateSetup,
    authController.setupAccount
);

module.exports = router;
```

### File: `routes/admin.js`

```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { strictInputValidation, blockNoSqlInjection } = require('../middleware/inputSanitizer');

// All admin routes require authentication + role check + security
router.use(authenticate);

// System Admin Only Routes
router.post('/invite-vip',
    rbac.permit('system_admin'),
    strictInputValidation,
    blockNoSqlInjection,
    adminController.inviteOfficial
);

router.get('/metrics',
    rbac.permit('system_admin'),
    rbac.privacyFirewall,
    adminController.getMetrics
);

// Government Official Only Routes
router.post('/invite',
    rbac.permit('government_official'),
    strictInputValidation,
    blockNoSqlInjection,
    adminController.inviteManager
);

router.get('/invitations',
    rbac.permit('government_official', 'system_admin'),
    adminController.getInvitations
);

module.exports = router;
```

---

## SECTION 8: SECURITY VERIFICATION CHECKLIST

After implementation, verify these security requirements:

### A. Attack Protection
- [ ] SQL Injection blocked on /api/auth/register
- [ ] SQL Injection blocked on /api/auth/setup-account
- [ ] SQL Injection blocked on /api/admin/invite
- [ ] XSS blocked on all endpoints
- [ ] NoSQL Injection blocked ($gt, $ne operators)
- [ ] Command Injection blocked

### B. Role Protection
- [ ] Citizen cannot access /api/admin/*
- [ ] Sector Manager cannot access other sectors
- [ ] Sector Manager cannot invite users
- [ ] System Admin cannot access /api/citizens/*
- [ ] Unauthenticated users cannot access protected routes

### C. Registration Protection
- [ ] Public registration ALWAYS creates citizen role
- [ ] Token required for manager/official creation
- [ ] Expired tokens are rejected
- [ ] Tampered tokens are rejected
- [ ] Domain validation works for .gov.in emails

### D. Data Protection
- [ ] Passwords hashed with Argon2id
- [ ] Employee IDs encrypted with AES-256-GCM
- [ ] OTPs hashed before storage
- [ ] Sensitive fields not returned in responses

---

## SECTION 9: ENVIRONMENT VARIABLES

Add these to `.env`:

```env
# Existing variables (keep as-is)
MONGODB_URI=mongodb://localhost:27017/sdp_registry
JWT_SECRET=your-super-secret-jwt-key-32chars
JWT_REFRESH_SECRET=your-refresh-secret-key-32chars
ENCRYPTION_KEY=32-character-hex-key-for-aes256

# New variables for RBAC
FRONTEND_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAINS=gov.in,nic.in,govt.in

# Email alerts
SECURITY_ALERTS_ENABLED=true
ADMIN_EMAIL=admin@system.gov.in
```

---

## FINAL NOTES

1. **DO NOT REMOVE** any existing security middleware
2. **DO NOT BYPASS** input sanitization for any role
3. **ALWAYS HARDCODE** the role for public registration
4. **NEVER TRUST** role data from request body
5. **ALWAYS LOG** privilege-related actions
6. **TEST ATTACKS** against all new endpoints

This prompt contains the complete A-Z specification for implementing the 4-Role RBAC Secured Registration System while maintaining 100% security coverage.