# Team Workflow & Development Guidelines

> **Service Delivery Platform - Ingenious Hackathon 7.0**  
> Last Updated: January 17, 2026

---

## Table of Contents

1. [Team Structure](#team-structure)
2. [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
3. [Microservice Ownership](#microservice-ownership)
4. [Development Rules & Guidelines](#development-rules--guidelines)
5. [AI/LLM Coding Rules](#aillm-coding-rules)
6. [Frontend Integration Guidelines](#frontend-integration-guidelines)
7. [Communication & Coordination](#communication--coordination)

---

## Team Structure

### Team Composition (5 Full-Stack Developers)

| Role | Developer | Primary Responsibility | Branch Name |
|------|-----------|----------------------|-------------|
| **Integration Developer** | Developer 1 (You) | API Gateway, Overall Architecture, Code Review | `Dhruv Vakharia` |
| **Healthcare Dev** | Developer 2 | Healthcare Microservice (Full-stack) | `Neel shah` |
| **Agriculture Dev** | Developer 3 | Agriculture Microservice (Full-stack) | `Jinal Vasita` |
| **Urban Dev** | Developer 4 | Urban Microservice (Full-stack) | `Yashvi Patel` |
| **Frontend Lead** | Developer 5 | Monitoring Service + Frontend Integration | `Varun Patel` |

### Responsibility Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEAD DEVELOPER                            │
│  - API Gateway (auth, routing, load balancing)                  │
│  - Shared packages (packages/common, packages/events)           │
│  - Docker/Infrastructure setup                                   │
│  - Code reviews & merge approvals                                │
│  - Architecture decisions                                        │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──────────────────┬──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ HEALTHCARE   │   │ AGRICULTURE  │   │   URBAN      │   │  FRONTEND    │
│ DEVELOPER    │   │  DEVELOPER   │   │  DEVELOPER   │   │    LEAD      │
│              │   │              │   │              │   │              │
│ Backend:     │   │ Backend:     │   │ Backend:     │   │ Backend:     │
│ services/    │   │ services/    │   │ services/    │   │ services/    │
│ healthcare/  │   │ agriculture/ │   │ urban/       │   │ monitoring/  │
│              │   │              │   │              │   │              │
│ Frontend:    │   │ Frontend:    │   │ Frontend:    │   │ Frontend:    │
│ components/  │   │ components/  │   │ components/  │   │ Shared       │
│ healthcare/  │   │ agriculture/ │   │ urban/       │   │ components,  │
│              │   │              │   │              │   │ layout,      │
│ Pages:       │   │ Pages:       │   │ Pages:       │   │ dashboard    │
│ (citizen)/   │   │ (citizen)/   │   │ (citizen)/   │   │ components   │
│ healthcare/* │   │ agriculture/*│   │ urban/*      │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## Git Workflow & Branching Strategy

### Branch Structure

```
main                          # Production-ready code (protected)
├── develop                   # Integration branch (protected)
│   ├── dev/developer1-name   # Lead Developer's working branch
│   ├── dev/developer2-name   # Healthcare Developer's branch
│   ├── dev/developer3-name   # Agriculture Developer's branch
│   ├── dev/developer4-name   # Urban Developer's branch
│   └── dev/developer5-name   # Frontend Lead's branch
```

### Branch Rules

#### 🔴 STRICT RULES - NEVER VIOLATE

1. **You can ONLY commit to your own branch** (`dev/<your-name>`)
2. **NEVER commit directly to `main` or `develop`**
3. **NEVER force push to any shared branch**
4. **ALWAYS pull latest `develop` before starting work**

#### 🟡 WORKFLOW RULES

1. **Starting Work Each Session:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout dev/<your-name>
   git merge develop
   ```

2. **Committing Changes:**
   ```bash
   git add .
   git commit -m "[SERVICE] Brief description"
   # Examples:
   # [HEALTHCARE] Add appointment booking endpoint
   # [AGRICULTURE] Fix farmer registration validation
   # [FRONTEND] Create complaint form component
   ```

3. **Requesting Merge to Develop:**
   - Push your branch: `git push origin dev/<your-name>`
   - Create a Pull Request to `develop`
   - Request review from Lead Developer
   - Wait for approval before merge

4. **Commit Message Format:**
   ```
   [SERVICE_TAG] Short description (max 50 chars)
   
   - Detailed change 1
   - Detailed change 2
   
   Related: #issue_number (if applicable)
   ```
   
   **Service Tags:**
   - `[GATEWAY]` - API Gateway changes
   - `[HEALTHCARE]` - Healthcare service
   - `[AGRICULTURE]` - Agriculture service
   - `[URBAN]` - Urban service
   - `[MONITORING]` - Monitoring service
   - `[FRONTEND]` - Frontend changes
   - `[SHARED]` - Shared packages
   - `[DOCS]` - Documentation
   - `[CONFIG]` - Configuration/Docker

---

## Microservice Ownership

### Healthcare Developer (Developer 2)

#### Owned Files & Folders
```
✅ CAN MODIFY:
services/healthcare/           # Full ownership
frontend/src/components/healthcare/
frontend/src/app/(citizen)/healthcare/
frontend/src/app/(provider)/healthcare/
docs/api/healthcare.md

❌ CANNOT MODIFY:
services/api-gateway/
services/agriculture/
services/urban/
services/monitoring/
frontend/src/components/common/    # Request via Lead
frontend/src/app/layout.tsx        # Request via Lead
packages/*                         # Request via Lead
docker-compose.yml                 # Request via Lead
```

#### API Endpoints to Implement
```
POST   /api/healthcare/patients           # Register patient
GET    /api/healthcare/patients/:id       # Get patient details
POST   /api/healthcare/appointments       # Book appointment
GET    /api/healthcare/appointments       # List appointments
GET    /api/healthcare/appointments/:id   # Get appointment
PUT    /api/healthcare/appointments/:id   # Update appointment
DELETE /api/healthcare/appointments/:id   # Cancel appointment
GET    /api/healthcare/doctors            # List doctors
GET    /api/healthcare/departments        # List departments
GET    /api/healthcare/slots              # Available time slots
GET    /api/healthcare/health             # Service health check
```

#### Database Models (MongoDB)
```javascript
// Patient, Appointment, Doctor, Department, TimeSlot
// All schemas defined in services/healthcare/src/models/
```

#### Events to Publish (RabbitMQ)
```javascript
'appointment.created'   // When new appointment is booked
'appointment.cancelled' // When appointment is cancelled
'patient.registered'    // When new patient registers
```

---

### Agriculture Developer (Developer 3)

#### Owned Files & Folders
```
✅ CAN MODIFY:
services/agriculture/          # Full ownership
frontend/src/components/agriculture/
frontend/src/app/(citizen)/agriculture/
frontend/src/app/(provider)/agriculture/
docs/api/agriculture.md

❌ CANNOT MODIFY:
services/api-gateway/
services/healthcare/
services/urban/
services/monitoring/
frontend/src/components/common/    # Request via Lead
packages/*                         # Request via Lead
```

#### API Endpoints to Implement
```
POST   /api/agriculture/farmers          # Register farmer
GET    /api/agriculture/farmers/:id      # Get farmer details
PUT    /api/agriculture/farmers/:id      # Update farmer profile
POST   /api/agriculture/advisories       # Request advisory
GET    /api/agriculture/advisories       # List advisories
GET    /api/agriculture/advisories/:id   # Get advisory details
GET    /api/agriculture/crops            # List crop types
GET    /api/agriculture/market-prices    # Current market prices
GET    /api/agriculture/weather          # Weather forecast
GET    /api/agriculture/schemes          # Government schemes
GET    /api/agriculture/health           # Service health check
```

#### Database Models (MongoDB)
```javascript
// Farmer, Advisory, Crop, MarketPrice, Scheme
// All schemas defined in services/agriculture/src/models/
```

#### Events to Publish (RabbitMQ)
```javascript
'advisory.requested'   // When farmer requests advisory
'farmer.registered'    // When new farmer registers
'scheme.applied'       // When farmer applies for scheme
```

---

### Urban Developer (Developer 4)

#### Owned Files & Folders
```
✅ CAN MODIFY:
services/urban/                # Full ownership
frontend/src/components/urban/
frontend/src/app/(citizen)/urban/
frontend/src/app/(provider)/urban/
docs/api/urban.md

❌ CANNOT MODIFY:
services/api-gateway/
services/healthcare/
services/agriculture/
services/monitoring/
frontend/src/components/common/    # Request via Lead
packages/*                         # Request via Lead
```

#### API Endpoints to Implement
```
POST   /api/urban/complaints           # File complaint
GET    /api/urban/complaints           # List complaints
GET    /api/urban/complaints/:id       # Get complaint details
PUT    /api/urban/complaints/:id       # Update complaint
GET    /api/urban/complaints/:id/track # Track status
POST   /api/urban/complaints/:id/feedback # Submit feedback
GET    /api/urban/departments          # List departments
GET    /api/urban/categories           # Complaint categories
GET    /api/urban/health               # Service health check
```

#### Database Models (MongoDB)
```javascript
// Complaint, Department, Category, Feedback, StatusHistory
// All schemas defined in services/urban/src/models/
```

#### Events to Publish (RabbitMQ)
```javascript
'complaint.created'       // When new complaint is filed
'complaint.highPriority'  // When high priority complaint
'complaint.resolved'      // When complaint is resolved
'feedback.received'       // When citizen gives feedback
```

---

## Development Rules & Guidelines

### Code Standards

#### File Structure (Per Microservice)
```
services/<service>/
├── src/
│   ├── index.js              # Entry point
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   ├── redis.js          # Redis connection
│   │   └── rabbitmq.js       # RabbitMQ connection
│   ├── controllers/
│   │   └── <entity>Controller.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── validate.js       # Input validation
│   │   └── errorHandler.js   # Error handling
│   ├── models/
│   │   └── <Entity>.js       # Mongoose schema
│   ├── routes/
│   │   ├── index.js          # Route aggregator
│   │   └── <entity>.js       # Entity routes
│   ├── services/
│   │   └── <entity>Service.js # Business logic
│   ├── events/
│   │   ├── publishers.js     # Event publishing
│   │   └── subscribers.js    # Event handling
│   └── utils/
│       ├── logger.js         # Winston logger
│       └── helpers.js        # Utility functions
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `appointmentController.js` |
| Folders | lowercase | `controllers/` |
| Models | PascalCase | `Appointment.js` |
| Functions | camelCase | `createAppointment()` |
| Constants | UPPER_SNAKE | `MAX_APPOINTMENTS` |
| Routes | kebab-case | `/api/healthcare/time-slots` |
| React Components | PascalCase | `AppointmentCard.jsx` |
| CSS Classes | kebab-case | `.appointment-card` |

#### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ ... ]
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### Error Codes
```javascript
// Use consistent error codes across all services
const ErrorCodes = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
```

---

## AI/LLM Coding Rules

> **CRITICAL**: Copy this section to any AI/LLM assistant you use for code generation.

### 🤖 AI ASSISTANT RULES - SERVICE DELIVERY PLATFORM

```
=== CONTEXT ===
You are helping develop a National-Scale Digital Public Infrastructure platform.
This is a microservices architecture with:
- API Gateway (Express.js)
- Healthcare Service (Express.js + MongoDB)
- Agriculture Service (Express.js + MongoDB)
- Urban Service (Express.js + MongoDB)
- Monitoring Service (Express.js + MongoDB)
- Frontend (React + Next.js + Tailwind CSS)
- Infrastructure: MongoDB, Redis, RabbitMQ

=== OWNERSHIP RULES ===
Before writing ANY code, confirm which developer is asking:
- Healthcare Developer: ONLY modify files in services/healthcare/ and frontend/src/components/healthcare/
- Agriculture Developer: ONLY modify files in services/agriculture/ and frontend/src/components/agriculture/
- Urban Developer: ONLY modify files in services/urban/ and frontend/src/components/urban/
- Frontend Lead: ONLY modify files in frontend/src/components/common/, frontend/src/components/dashboard/, services/monitoring/
- Lead Developer: Can modify any file

=== FILE MODIFICATION RULES ===
1. NEVER modify files outside your ownership scope
2. NEVER modify docker-compose.yml without Lead approval
3. NEVER modify package.json at root level
4. NEVER modify packages/* without Lead approval
5. NEVER modify frontend/src/app/layout.tsx without Lead approval
6. NEVER modify .env files - create .env.example changes only

=== CODE STYLE RULES ===
1. Use Express.js for all backend routes
2. Use Mongoose for MongoDB schemas
3. Use async/await for all async operations
4. Use try-catch blocks for error handling
5. Always validate input using express-validator
6. Always return responses in standard format:
   { success: true/false, data: {...}, message: "...", error: {...} }
7. Use Winston for logging
8. Use environment variables for all configuration
9. Export functions/classes at the end of files
10. Comment complex logic

=== REACT/FRONTEND RULES ===
1. Use functional components with hooks
2. Use TypeScript for type safety
3. Use Tailwind CSS for styling (no inline styles)
4. Use shadcn/ui components when available
5. Component files: PascalCase (AppointmentCard.tsx)
6. Put API calls in services/ folder, not in components
7. Use React Query or SWR for data fetching
8. Handle loading and error states in every component

=== API ENDPOINT RULES ===
1. RESTful naming: /api/<service>/<resource>
2. Use proper HTTP methods (GET, POST, PUT, DELETE)
3. Include health check endpoint: GET /api/<service>/health
4. Validate all inputs before processing
5. Return appropriate HTTP status codes
6. Include pagination for list endpoints

=== MONGODB SCHEMA RULES ===
1. Include timestamps: { timestamps: true }
2. Add indexes for frequently queried fields
3. Use refs for relationships
4. Validate required fields in schema
5. Use virtuals for computed fields

=== RABBITMQ EVENT RULES ===
1. Event names: <entity>.<action> (e.g., appointment.created)
2. Include eventId (UUID) in all events
3. Include timestamp in all events
4. Include service name in events
5. Handle events idempotently (check if already processed)

=== SECURITY RULES ===
1. Never log sensitive data (passwords, tokens)
2. Validate and sanitize all user inputs
3. Use parameterized queries (Mongoose handles this)
4. Don't expose stack traces in production
5. Use helmet middleware for security headers
6. Rate limit sensitive endpoints

=== TESTING RULES ===
1. Write unit tests for services
2. Write integration tests for API endpoints
3. Mock external dependencies
4. Test error cases, not just happy paths

=== BEFORE GENERATING CODE ===
Ask these questions if not clear:
1. Which service is this for?
2. What is the exact file path?
3. Is this creating new file or modifying existing?
4. Does this require changes to other files?
```

### AI Prompt Templates

**When asking AI to create a new endpoint:**
```
I am the [HEALTHCARE/AGRICULTURE/URBAN] Developer.
Create a new API endpoint for [DESCRIPTION].

Service: services/[service-name]/
File to modify: src/routes/[file].js

Requirements:
- [Requirement 1]
- [Requirement 2]

Follow the AI/LLM Coding Rules from TEAM_WORKFLOW.md.
```

**When asking AI to create a component:**
```
I am the [HEALTHCARE/AGRICULTURE/URBAN] Developer.
Create a React component for [DESCRIPTION].

File path: frontend/src/components/[service]/[ComponentName].tsx

Requirements:
- [Requirement 1]
- [Requirement 2]
- Use Tailwind CSS
- Use shadcn/ui components

Follow the AI/LLM Coding Rules from TEAM_WORKFLOW.md.
```

---

## Frontend Integration Guidelines

### Design Philosophy

> **MINIMALIST DESIGN + HIGH UX** - Easy for users to understand at a glance.

#### Core Design Principles

1. **Clean & Minimal** - No clutter, ample whitespace, focus on content
2. **Intuitive Navigation** - Users should find what they need in ≤3 clicks
3. **Consistent Patterns** - Same UI patterns across all services
4. **Accessible** - WCAG 2.1 compliant, works on all devices
5. **Fast Loading** - Skeleton loaders, optimistic updates

#### Design Standards

```
┌────────────────────────────────────────────────────────────────────┐
│  DESIGN TOKENS (Use consistently across all services)              │
├────────────────────────────────────────────────────────────────────┤
│  Colors:    Primary (#2563EB), Success (#10B981), Warning (#F59E0B)│
│  Font:      DM Sans or system-ui (clean, readable)                 │
│  Spacing:   4px base unit (4, 8, 12, 16, 24, 32, 48)               │
│  Radius:    8px for cards, 4px for buttons                         │
│  Shadows:   Subtle only - shadow-sm for elevation                  │
└────────────────────────────────────────────────────────────────────┘
```

---

### Tab Bar Structure

Each **microservice gets its own main tab** in the navigation bar.  
Each main tab contains **sub-tabs/pages** for specific features within that service.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏛️ LOGO   │   Home   │  Healthcare  │  Agriculture  │  Urban  │  Profile  │
│            │          │              │               │         │           │
│            │  [TAB 0] │   [TAB 1]    │    [TAB 2]    │ [TAB 3] │  [TAB 4]  │
└─────────────────────────────────────────────────────────────────────────────┘
                              │                │              │
                              ▼                ▼              ▼
                    ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
                    │  SUB-TABS       │ │  SUB-TABS   │ │  SUB-TABS   │
                    │  • Book Appt    │ │  • Advisory │ │  • File     │
                    │  • Get Medicine │ │  • Prices   │ │    Complaint│
                    │  • My Records   │ │  • Weather  │ │  • Track    │
                    │  • Find Doctor  │ │  • Schemes  │ │  • History  │
                    └─────────────────┘ └─────────────┘ └─────────────┘
```

#### Main Tabs (Top-Level Navigation)

| Tab | Route | Owner | Description |
|-----|-------|-------|-------------|
| Home | `/` | Lead Developer | Landing page, service overview |
| Healthcare | `/healthcare` | Healthcare Developer | All healthcare services |
| Agriculture | `/agriculture` | Agriculture Developer | All agriculture services |
| Urban | `/urban` | Urban Developer | All urban/city services |
| Dashboard | `/dashboard` | Frontend Lead | Admin monitoring (role-based) |
| Profile | `/profile` | Lead Developer | User settings, account |

#### Sub-Tabs per Service

**Healthcare Tab Sub-Navigation** (Owner: Healthcare Developer)
```
/healthcare
├── /appointments      → "Book Appointment" - Schedule doctor visits
├── /medicines         → "Get Medicine" - Medicine delivery/pharmacy
├── /records           → "My Records" - View medical history
├── /doctors           → "Find Doctor" - Search doctors by specialty
└── /telemedicine      → "Video Consult" - Online consultation
```

**Agriculture Tab Sub-Navigation** (Owner: Agriculture Developer)
```
/agriculture
├── /advisory          → "Get Advisory" - Crop disease/pest help
├── /market-prices     → "Market Prices" - Current mandi rates
├── /weather           → "Weather" - Forecast for farming
├── /schemes           → "Gov Schemes" - Apply for farmer schemes
└── /my-farm           → "My Farm" - Manage farm profile
```

**Urban Tab Sub-Navigation** (Owner: Urban Developer)
```
/urban
├── /file-complaint    → "File Complaint" - Report city issues
├── /track             → "Track Status" - Check complaint progress
├── /history           → "My Complaints" - Past complaints
├── /departments       → "Departments" - Contact info
└── /feedback          → "Give Feedback" - Rate resolution
```

---

### Role-Based Views

Each service developer **decides their own role-based views**. The developer has full autonomy over UI/UX decisions within their service.

#### User Roles

| Role | Description | Can Access |
|------|-------------|------------|
| **Citizen** | General public user | All public features |
| **Provider** | Service provider (doctor, agri-expert, dept officer) | Provider dashboard + management |
| **Admin** | System administrator | Monitoring dashboard, analytics |

#### Route Groups by Role

```
frontend/src/app/
├── (auth)/                    # Login, Register (Lead Developer)
│   ├── login/
│   └── register/
│
├── (citizen)/                 # Citizen-facing pages
│   ├── healthcare/            # ← Healthcare Dev decides views
│   │   ├── page.tsx           # Main healthcare landing
│   │   ├── appointments/
│   │   ├── medicines/
│   │   └── ...
│   ├── agriculture/           # ← Agriculture Dev decides views
│   │   ├── page.tsx
│   │   ├── advisory/
│   │   └── ...
│   └── urban/                 # ← Urban Dev decides views
│       ├── page.tsx
│       ├── file-complaint/
│       └── ...
│
├── (provider)/                # Provider-facing dashboards
│   ├── healthcare/            # ← Healthcare Dev: Doctor dashboard
│   ├── agriculture/           # ← Agriculture Dev: Expert dashboard
│   └── urban/                 # ← Urban Dev: Officer dashboard
│
└── (admin)/                   # Admin monitoring (Frontend Lead)
    ├── dashboard/
    ├── analytics/
    └── users/
```

#### View Decision Ownership

| Service | Who Decides Views | Examples of Decisions |
|---------|-------------------|----------------------|
| Healthcare | Healthcare Developer | What cards show on booking page, form layouts, patient flow |
| Agriculture | Agriculture Developer | How weather widget looks, advisory form design, scheme cards |
| Urban | Urban Developer | Complaint form steps, status tracker design, map integration |
| Admin Dashboard | Frontend Lead | Metrics layout, charts, monitoring views |

---

### Sub-Tab Component Structure

Each service should implement consistent sub-tab navigation within their pages.

**Example: Healthcare Service Tabs**
```tsx
// frontend/src/components/healthcare/HealthcareLayout.tsx
// Healthcare Developer owns this completely

export function HealthcareLayout({ children }) {
  const tabs = [
    { name: 'Book Appointment', href: '/healthcare/appointments', icon: Calendar },
    { name: 'Get Medicine', href: '/healthcare/medicines', icon: Pill },
    { name: 'My Records', href: '/healthcare/records', icon: FileText },
    { name: 'Find Doctor', href: '/healthcare/doctors', icon: UserSearch },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-tab navigation */}
      <nav className="bg-white border-b">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <TabLink key={tab.href} {...tab} />
          ))}
        </div>
      </nav>
      
      {/* Page content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
```

---

### Minimalist UI Component Guidelines

#### Card Design
```tsx
// Clean, minimal card with subtle shadow
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-medium text-gray-900">Title</h3>
  <p className="mt-2 text-gray-600">Description</p>
</div>
```

#### Button Hierarchy
```tsx
// Primary action
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  Book Now
</button>

// Secondary action
<button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
  Cancel
</button>

// Text action
<button className="text-blue-600 hover:text-blue-700">
  Learn more →
</button>
```

#### Form Inputs
```tsx
// Clean input with label
<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input 
    type="email"
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="you@example.com"
  />
</div>
```

#### Empty States
```tsx
// When no data - friendly, helpful message
<div className="text-center py-12">
  <Icon className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
  <p className="mt-1 text-sm text-gray-500">Get started by booking your first appointment.</p>
  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
    Book Appointment
  </button>
</div>
```

#### Loading States
```tsx
// Skeleton loader - show shape of content
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Frontend Folder Ownership

```
frontend/src/
├── app/
│   ├── layout.tsx           # 🔒 Lead Developer ONLY
│   ├── page.tsx             # 🔒 Lead Developer ONLY
│   ├── (auth)/              # 🔒 Lead Developer ONLY
│   ├── (citizen)/
│   │   ├── healthcare/      # ✅ Healthcare Developer
│   │   ├── agriculture/     # ✅ Agriculture Developer
│   │   ├── urban/           # ✅ Urban Developer
│   │   └── dashboard/       # ✅ Frontend Lead
│   └── (admin)/             # ✅ Frontend Lead
├── components/
│   ├── ui/                  # 🔒 Lead Developer ONLY
│   ├── common/              # ✅ Frontend Lead (shared)
│   ├── healthcare/          # ✅ Healthcare Developer
│   ├── agriculture/         # ✅ Agriculture Developer
│   ├── urban/               # ✅ Urban Developer
│   └── dashboard/           # ✅ Frontend Lead
├── services/                # API service calls
│   ├── api.ts               # 🔒 Lead Developer ONLY
│   ├── healthcare.ts        # ✅ Healthcare Developer
│   ├── agriculture.ts       # ✅ Agriculture Developer
│   ├── urban.ts             # ✅ Urban Developer
│   └── monitoring.ts        # ✅ Frontend Lead
└── types/                   # TypeScript types
    ├── common.ts            # 🔒 Lead Developer ONLY
    ├── healthcare.ts        # ✅ Healthcare Developer
    ├── agriculture.ts       # ✅ Agriculture Developer
    └── urban.ts             # ✅ Urban Developer
```

### Component Communication Between Services

If your component needs data from another service:

1. **DO NOT** import from another service's folder
2. **DO** create an API call in your service file
3. **DO** request shared components from Frontend Lead

**Example - Healthcare needs user info:**
```typescript
// ❌ WRONG - Don't import from common directly
import { UserProfile } from '@/components/common/UserProfile';

// ✅ CORRECT - Use API and create local component
import { useAuth } from '@/hooks/useAuth';

export function HealthcareHeader() {
  const { user } = useAuth(); // Use shared hook
  return <div>{user.name}</div>;
}
```

---

## Communication & Coordination

### Daily Sync (During Hackathon)

- **Frequency:** Every 2 hours
- **Duration:** 5 minutes max
- **Format:** Quick standup
- **Questions:**
  1. What have you completed?
  2. What are you working on next?
  3. Any blockers?

### Requesting Changes to Shared Code

1. Message Lead Developer with:
   - What change is needed
   - Why it's needed
   - Proposed solution

2. Wait for approval before modifying

3. If urgent, Lead can make the change for you

### Merge Request Process

1. Push your branch
2. Create PR to `develop`
3. Add description of changes
4. Request review from Lead
5. Address feedback
6. Lead merges after approval

### Conflict Resolution

If you have merge conflicts:

1. **DO NOT** force push
2. Fetch latest develop: `git fetch origin develop`
3. Merge develop into your branch: `git merge origin/develop`
4. Resolve conflicts in YOUR files only
5. If conflict is in shared files, contact Lead

---

## Quick Reference Card

### Your Branch Commands
```bash
# Start of session
git checkout develop && git pull && git checkout dev/<your-name> && git merge develop

# Commit work
git add . && git commit -m "[SERVICE] Description" && git push origin dev/<your-name>

# Request merge
# Create PR on GitHub/GitLab to develop branch
```

### Your Service Port
| Service | Port |
|---------|------|
| API Gateway | 3000 |
| Healthcare | 3001 |
| Agriculture | 3002 |
| Urban | 3003 |
| Monitoring | 3004 |

### Your Database
| Service | Database Name |
|---------|---------------|
| Healthcare | sdp_healthcare |
| Agriculture | sdp_agriculture |
| Urban | sdp_urban |

---

## Appendix: Emergency Contacts & Procedures

### If Build Breaks
1. Check your recent commits
2. Don't push more changes
3. Notify Lead immediately
4. Revert if needed: `git revert <commit-hash>`

### If Database Issues
1. Check MongoDB connection in docker-compose
2. Run: `docker-compose restart mongodb`
3. Check logs: `docker-compose logs mongodb`

### If Service Won't Start
1. Check if port is already in use
2. Check environment variables
3. Check dependencies: `npm install`
4. Check logs for errors

---

*Document maintained by Lead Developer. Last updated: January 17, 2026*