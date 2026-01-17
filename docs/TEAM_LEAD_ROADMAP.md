# Team Lead Strategic Roadmap

> **For:** Dhruv Vakharia (Integration Developer / Team Lead)  
> **Role:** System Design + Frontend Architecture  
> **Time:** January 17, 2026, ~4:45 PM onwards

---

## 🎯 Your Mission (As Per Problem Statement)

You are responsible for **the backbone** that ties everything together:

| Deliverable | Your Responsibility |
|-------------|---------------------|
| Service Registry/Platform | ✅ You build this |
| Authentication System | ✅ You build this |
| API Gateway | ✅ You build this |
| Frontend Layout/Navigation | ✅ You build this |
| Monitoring Dashboard | Vedant builds, you coordinate |
| Healthcare/Agriculture/Urban | Team builds, you review |

---

## 📋 Immediate Action Items (Next 2 Hours)

### 1. 🚀 Start Infrastructure (10 min)
```bash
cd d:\CODES\hackathon\service-delivery-platform
docker-compose up -d mongodb redis rabbitmq
```
This starts your databases. Verify with:
```bash
docker-compose ps
```

### 2. 🏗️ Build API Gateway Core (45 min)

Your API Gateway is the **single entry point**. Focus on:

**Priority 1: Service Registry**
```
POST /api/registry/register     → Services register themselves
GET  /api/registry/services     → List all registered services
GET  /api/registry/health       → Overall platform health
```

**Priority 2: Authentication**
```
POST /api/auth/register         → User signup
POST /api/auth/login            → User login → JWT token
POST /api/auth/refresh          → Refresh token
GET  /api/auth/me               → Current user
```

**Priority 3: Proxy Routing**
```
/api/healthcare/*   → Route to Healthcare Service (port 3001)
/api/agriculture/*  → Route to Agriculture Service (port 3002)
/api/urban/*        → Route to Urban Service (port 3003)
```

### 3. 🎨 Build Frontend Layout (30 min)

Create the main navigation that all services will use:

**Main Layout Components:**
- `Header.tsx` - Logo + Navigation tabs
- `TabBar.tsx` - Healthcare | Agriculture | Urban tabs
- `Footer.tsx` - Simple footer
- `AuthLayout.tsx` - Login/Register wrapper

**Pages to Create:**
- `/` - Landing page with 3 service cards
- `/login` - Login form
- `/register` - Registration form

### 4. 📞 Team Briefing (15 min)

Quick sync with each developer:
- Share this document and TEAM_WORKFLOW.md
- Confirm they understand their service scope
- Tell them to start with basic CRUD endpoints
- Set next check-in time

---

## 📊 System Design Decisions You Need to Make

### Decision 1: User Model
```javascript
// Shared across all services via API Gateway
User {
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,
  role: 'citizen' | 'provider' | 'admin',
  createdAt: Date
}
```

### Decision 2: JWT Token Structure
```javascript
{
  userId: "...",
  email: "...",
  role: "citizen",
  exp: 1234567890  // 24h expiry
}
```

### Decision 3: Service Registration Format
```javascript
// When a service starts, it calls:
POST /api/registry/register
{
  name: "healthcare",
  version: "1.0.0",
  url: "http://localhost:3001",
  healthEndpoint: "/health",
  endpoints: ["/patients", "/appointments", "/doctors"]
}
```

### Decision 4: Inter-Service Events (RabbitMQ)
```
Exchange: sdp.events (topic)

Events:
- healthcare.appointment.created
- agriculture.advisory.requested
- urban.complaint.filed
- system.service.registered
- system.service.unhealthy
```

---

## 🔍 Judging Criteria Mapping

| Criterion | How You Address It |
|-----------|-------------------|
| **Working Code** | All services start with `docker-compose up` |
| **Code Quality** | Folder structure + standards in TEAM_WORKFLOW.md |
| **Scalability** | Redis caching + 2 Healthcare instances in docker-compose |
| **Modularity** | Each service is independent, connects via Gateway |
| **Data Flow** | API Gateway routes + RabbitMQ events |
| **Error Handling** | Standard error response format |
| **User Experience** | Minimalist design, clear navigation |
| **Real-world Potential** | Multi-language ready, offline-capable |

---

## 🔧 Quick Wins for Demo

### Scalability Demo (5 min setup)
Your docker-compose already has `healthcare-service-2`. Show load balancing:
1. Make request to Healthcare Service
2. Check logs - see which instance handled it
3. Kill one instance, show system still works

### Caching Demo (5 min setup)
```javascript
// In any route that fetches data frequently
const cached = await redis.get('key');
if (cached) return JSON.parse(cached); // Fast!
const data = await db.find();          // Slow
await redis.set('key', JSON.stringify(data), 'EX', 300);
```

### Health Dashboard Demo
Show monitoring page with:
- Service status cards (green/red)
- Request count per service
- Response time graph

---

## 📁 Files You Need to Create/Modify

### API Gateway (Priority)
```
services/api-gateway/src/
├── index.js                 ← Main entry (modify)
├── config/
│   ├── database.js          ← Already created
│   ├── redis.js             ← Already created
│   └── rabbitmq.js          ← Already created
├── middleware/
│   ├── auth.js              ← JWT verification (CREATE)
│   ├── rateLimiter.js       ← Rate limiting (CREATE)
│   └── errorHandler.js      ← Error handling (CREATE)
├── models/
│   └── User.js              ← User schema (CREATE)
├── routes/
│   ├── auth.js              ← Auth endpoints (CREATE)
│   ├── registry.js          ← Service registry (CREATE)
│   ├── proxy.js             ← Route to services (CREATE)
│   └── health.js            ← Health check (CREATE)
└── services/
    ├── ServiceRegistry.js   ← Registry logic (CREATE)
    └── LoadBalancer.js      ← Load balancing (CREATE)
```

### Frontend (Priority)
```
frontend/src/
├── app/
│   ├── layout.tsx           ← Main layout (CREATE)
│   ├── page.tsx             ← Landing page (CREATE)
│   └── (auth)/
│       ├── login/page.tsx   ← Login page (CREATE)
│       └── register/page.tsx← Register page (CREATE)
├── components/
│   └── common/
│       ├── Header.tsx       ← Navigation (CREATE)
│       ├── TabBar.tsx       ← Service tabs (CREATE)
│       └── Footer.tsx       ← Footer (CREATE)
└── services/
    └── api.ts               ← API client (CREATE)
```

---

## ⏰ Suggested Timeline

| Time | Activity |
|------|----------|
| Now - 5:00 PM | Start infrastructure, brief team |
| 5:00 - 6:00 PM | API Gateway: Auth + Registry |
| 6:00 - 7:00 PM | API Gateway: Proxy routing + health |
| 7:00 - 8:00 PM | Frontend: Layout + Auth pages |
| 8:00 - 9:00 PM | Frontend: Landing + Service tabs |
| 9:00 - 10:00 PM | Integration testing, bug fixes |
| 10:00 - 11:00 PM | Demo preparation, documentation |
| 11:00 PM+ | Practice demo, final polish |

---

## 🆘 If Short on Time - Minimum Viable Demo

Focus on these **bare minimum** items:

1. ✅ **Gateway starts** and shows health status
2. ✅ **User can login** and get JWT token
3. ✅ **3 services registered** in service registry
4. ✅ **Frontend shows** 3 tabs, one page each
5. ✅ **One full flow** (e.g., book appointment end-to-end)
6. ✅ **Monitoring shows** service status (green/red cards)

---

## 🚀 Ready to Start?

**Command 1:** Start databases
```bash
docker-compose up -d mongodb redis rabbitmq
```

**Command 2:** Install dependencies
```bash
npm install
```

**Command 3:** Tell me what to build first:
- "Help me build the API Gateway auth system"
- "Help me create the frontend layout"
- "Help me set up the service registry"

---

*Let's win this hackathon! 🏆*
