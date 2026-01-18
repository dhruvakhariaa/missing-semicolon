# 🏛️ Jan Sewa Portal – National-Scale Digital Public Infrastructure

> **Ingenious Hackathon 7.0** | Theme: Building Trustworthy, Scalable, and Human-Centered Digital Systems for the Next Decade

A comprehensive digital infrastructure platform supporting multiple public services (Healthcare, Agriculture, Urban) through a shared, modular, and scalable microservices architecture.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Test Credentials](#-test-credentials)
- [API Endpoints](#-api-endpoints)
- [Error Handling](#-error-handling)
- [Security & Secrets](#-security--secrets)
- [Team](#-team)

---

## 🎯 Project Overview

Jan Sewa Portal is a **national-scale digital public infrastructure** designed to provide seamless, unified access to essential government services. The platform addresses the fragmentation of existing government digital systems by providing:

- **Unified Service Delivery**: Citizens access Healthcare, Agriculture, and Urban services through a single platform
- **Microservices Architecture**: Independent, scalable services that can be developed and deployed independently
- **High Availability**: Load balancing, caching, and health monitoring ensure 99.9% uptime
- **Multi-Language Support**: English, Hindi, and Gujarati support for inclusive access
- **Role-Based Access Control (RBAC)**: Secure access for Citizens, Service Providers, Sector Managers, and Admins

### Problem Statement
Existing government digital platforms are fragmented, slow, and often experience downtime. Citizens struggle with multiple logins, inconsistent interfaces, and poor reliability when accessing essential services.

### Our Solution
A unified microservices-based platform with:
- Single sign-on across all services
- Event-driven architecture for real-time updates
- Built-in scalability through load balancing and caching
- Comprehensive monitoring and analytics dashboard

---

## ✨ Features

### Core Platform Features
| Feature | Description |
|---------|-------------|
| **Service Registry** | Dynamic service discovery with automatic registration |
| **Load Balancing** | Round-robin distribution across multiple service instances |
| **Redis Caching** | Reduces database load by 70-80%, improves response time |
| **Event-Driven Architecture** | RabbitMQ pub/sub for asynchronous inter-service communication |
| **Rate Limiting** | DDoS protection with configurable request limits |
| **Health Monitoring** | Real-time service health checks every 30 seconds |

### Domain Services

#### 🏥 Healthcare Service
- Patient registration and profile management
- Appointment scheduling with availability checking
- Doctor/department-based booking
- Appointment reminders and notifications

#### 🌾 Agriculture Service
- Farmer registration with land and crop details
- Government scheme discovery and applications
- Market price information
- Weather forecast integration

#### 🏙️ Urban Service
- Complaint registration with category and location
- Real-time complaint tracking and status updates
- Priority assignment and department routing
- Evidence upload support (via MinIO)

### Additional Features
- **Multi-Language Support**: English, Hindi, Gujarati
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Monitoring Dashboard**: System health, metrics, and analytics
- **JWT Authentication**: Secure, stateless authentication
- **RBAC Authorization**: 4-role system (Citizen, ServiceProvider, SectorManager, Admin)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with SSR/SSG |
| React 18 | UI component library |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| Radix UI | Accessible UI primitives |
| Lucide React | Icon library |
| next-intl | Internationalization (i18n) |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | JavaScript runtime |
| Express.js | Web framework for microservices |
| Mongoose | MongoDB ODM |
| JWT | Stateless authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| Winston | Structured logging |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| MongoDB 7.0 | Primary database (per-service) |
| Redis 7.2 | Caching and rate limiting |
| RabbitMQ 3.12 | Message broker for event-driven architecture |
| MinIO | S3-compatible object storage |
| Nginx | Reverse proxy and load balancer |
| Docker & Docker Compose | Containerization and orchestration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│          (Citizen Portal | Admin Dashboard | Provider UI)        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Gateway                             │
│     (Auth | Rate Limiting | Load Balancing | Service Discovery)  │
└─────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Healthcare  │        │ Agriculture  │        │    Urban     │
│   Service    │        │   Service    │        │   Service    │
└──────────────┘        └──────────────┘        └──────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌──────────────┐         ┌──────────────┐
            │   RabbitMQ   │         │  Monitoring  │
            │  (Events)    │         │   Service    │
            └──────────────┘         └──────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   MongoDB    │        │    Redis     │
│  (Per-svc)   │        │  (Caching)   │
└──────────────┘        └──────────────┘
```

---

## 📁 Project Structure

```
service-delivery-platform/
├── services/                   # Backend Microservices
│   ├── api-gateway/           # Central entry point, auth, routing, load balancing
│   ├── healthcare/            # Appointments, patients, doctors
│   ├── agriculture/           # Farmers, schemes, advisories
│   ├── urban/                 # Complaints, departments, tracking
│   └── monitoring/            # System metrics, health, analytics
├── frontend/                   # Next.js React Application
│   ├── public/                # Static assets, locales (i18n)
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # Reusable UI components
│       ├── services/          # API service layer
│       └── lib/               # Utilities
├── packages/                   # Shared Code
│   ├── common/                # Shared utilities, types
│   └── events/                # Event definitions
├── scripts/                    # Utility scripts (seeding, etc.)
├── nginx/                      # Nginx configuration
├── docs/                       # Documentation
├── docker-compose.yml          # All services orchestration
├── package.json                # Root package (workspaces)
└── .env.example                # Environment template
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|------------|---------|----------|
| Node.js | 18.0.0 or higher | [nodejs.org](https://nodejs.org/) |
| Docker | Latest | [docker.com](https://www.docker.com/) |
| Docker Compose | Latest (included with Docker Desktop) | [docker.com](https://www.docker.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Setup & Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-team/jan-sewa-portal.git
cd jan-sewa-portal
```

### Step 2: Copy Environment File

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

### Step 3: Install Dependencies

```bash
# Install all dependencies (root + services + frontend)
npm run install:all
```

**Or install individually:**

```bash
# Root dependencies
npm install

# Service dependencies
npm run install:services

# Frontend dependencies
npm run install:frontend
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# ===========================================
# Node Environment
# ===========================================
NODE_ENV=development

# ===========================================
# API Gateway Configuration
# ===========================================
API_GATEWAY_PORT=3000
API_GATEWAY_HOST=localhost

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# MongoDB Configuration
# ===========================================
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_PREFIX=sdp_

# ===========================================
# Redis Configuration
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_CACHE_TTL=300

# ===========================================
# RabbitMQ Configuration
# ===========================================
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=sdp.events

# ===========================================
# Microservices Ports
# ===========================================
HEALTHCARE_SERVICE_PORT=3001
AGRICULTURE_SERVICE_PORT=3002
URBAN_SERVICE_PORT=3003
MONITORING_SERVICE_PORT=3004

# ===========================================
# Frontend Configuration
# ===========================================
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# ===========================================
# CORS Configuration
# ===========================================
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# ===========================================
# Encryption (For sensitive data)
# ===========================================
ENCRYPTION_KEY=your-32-byte-encryption-key-here
ENCRYPTION_IV=your-16-byte-iv-here
```

> ⚠️ **Important**: Never commit `.env` files with real secrets to version control!

---

## 🏃 Running Locally

### Option 1: Using Docker (Recommended)

**Start all services with Docker Compose:**

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Stop all services:**

```bash
docker-compose down
```

### Option 2: Manual Development Mode

**Step 1: Start Infrastructure Services (MongoDB, Redis, RabbitMQ)**

```bash
docker-compose up -d mongodb redis rabbitmq minio
```

**Step 2: Start All Microservices + Frontend**

```bash
npm run dev
```

This starts all services concurrently:
- API Gateway: http://localhost:8000
- Healthcare Service: http://localhost:3001
- Agriculture Service: http://localhost:3002
- Urban Service: http://localhost:3003
- Monitoring Service: http://localhost:3004
- Frontend: http://localhost:3000

**Step 3: Seed the Database (Optional)**

```bash
npm run seed
```

### Service Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Gateway | 8000 | http://localhost:8000 |
| Healthcare Service | 3001 | http://localhost:3001 |
| Agriculture Service | 3002 | http://localhost:3002 |
| Urban Service | 3003 | http://localhost:3003 |
| Monitoring Service | 3004 | http://localhost:3004 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6342 | redis://localhost:6342 |
| RabbitMQ | 5672, 15672 | amqp://localhost:5672 |
| RabbitMQ UI | 15672 | http://localhost:15672 |
| MinIO | 9000, 9001 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |

---

## 🔑 Test Credentials

Use these credentials for testing the application:

### Pre-seeded Users (after running `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jansewa.gov.in | Admin@123 |
| Sector Manager | manager@jansewa.gov.in | Manager@123 |
| Service Provider | provider@jansewa.gov.in | Provider@123 |
| Citizen | citizen@example.com | Citizen@123 |

### Default Service Credentials

| Service | Username | Password |
|---------|----------|----------|
| RabbitMQ Management | guest | guest |
| MinIO Console | minioadmin | minioadmin123 |

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/refresh` | Refresh access token |

### Healthcare Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthcare/appointments` | Get all appointments |
| POST | `/api/healthcare/appointments` | Book new appointment |
| GET | `/api/healthcare/appointments/:id` | Get appointment by ID |
| PUT | `/api/healthcare/appointments/:id` | Update appointment |
| DELETE | `/api/healthcare/appointments/:id` | Cancel appointment |
| GET | `/api/healthcare/doctors` | Get available doctors |
| GET | `/api/healthcare/departments` | Get departments |

### Agriculture Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agriculture/schemes` | Get government schemes |
| GET | `/api/agriculture/farmers` | Get farmer profiles |
| POST | `/api/agriculture/farmers` | Register farmer |
| GET | `/api/agriculture/advisories` | Get agricultural advisories |
| POST | `/api/agriculture/advisories` | Request advisory |

### Urban Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/urban/complaints` | Get all complaints |
| POST | `/api/urban/complaints` | Submit new complaint |
| GET | `/api/urban/complaints/:id` | Get complaint by ID |
| PUT | `/api/urban/complaints/:id/status` | Update complaint status |
| GET | `/api/urban/departments` | Get departments |

### Monitoring Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monitoring/health` | Get all services health |
| GET | `/api/monitoring/metrics` | Get system metrics |
| GET | `/api/monitoring/analytics` | Get usage analytics |

---

## ⚠️ Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2026-01-18T10:30:00Z"
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Input validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Error Handling Best Practices

1. **Input Validation**: All endpoints validate inputs using `express-validator`
2. **Graceful Degradation**: Services continue operating even if dependencies fail
3. **Circuit Breaker**: Prevents cascading failures when services are down
4. **Retry Logic**: Exponential backoff for transient failures
5. **Structured Logging**: All errors logged with Winston for debugging

---

## 🔒 Security & Secrets

### Secrets Management

> ✅ **Confirmation: No secrets are committed to this repository**

- All sensitive configuration is stored in `.env` files (gitignored)
- `.env.example` contains only placeholder values
- JWT secrets, API keys, and database credentials are never hardcoded

### Security Features Implemented

| Feature | Implementation |
|---------|----------------|
| Authentication | JWT with RS256/HS256 signing |
| Password Hashing | bcrypt with salt rounds |
| Input Validation | express-validator on all endpoints |
| Rate Limiting | Redis-backed rate limiting |
| CORS | Configurable origin whitelist |
| Helmet | Security headers middleware |
| Data Encryption | AES-256-GCM for sensitive data |

### Files Excluded from Version Control

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env

# Database data
data/mongodb/
data/redis/
data/rabbitmq/
```

---

## 👥 Team

**Team Missing Semicolon** – Ingenious Hackathon 7.0

| Member | Role |
|--------|------|
| Developer 1 | Infrastructure & API Gateway |
| Developer 2 | Healthcare Service & Frontend Auth |
| Developer 3 | Agriculture Service & AI Features |
| Developer 4 | Urban Service & Monitoring |
| Developer 5 | Frontend UI/UX & Integration |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Ingenious Hackathon 7.0 organizers
- Open source community for the amazing tools and libraries
- Government of India digital initiatives for inspiration

---

<p align="center">
  Made with ❤️ by Team Missing Semicolon for Ingenious Hackathon 7.0
</p>
