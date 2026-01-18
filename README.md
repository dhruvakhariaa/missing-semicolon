# 🏛️ Jan Sewa Portal – National-Scale Digital Public Infrastructure

> **Ingenious Hackathon 7.0** | Theme: Building Trustworthy, Scalable, and Human-Centered Digital Systems for the Next Decade

A comprehensive digital infrastructure platform supporting multiple public services (Healthcare, Agriculture, Urban) through a shared, modular, and scalable microservices architecture.

![Jan Sewa Portal - Landing Page](docs/diagrams/landing_page.png)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [AI-Powered Health Checker](#-ai-powered-health-checker)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
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
- AI-powered disease prediction for healthcare
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
- **AI-Powered Disease Prediction** (see below)
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

## 🏗️ System Architecture

Our platform is built on a robust microservices architecture that ensures scalability, fault tolerance, and independent deployment of services.

![System Architecture](docs/diagrams/system_architecture.png)

### Architecture Highlights

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

### Key Design Patterns
- **Database per Service**: Each microservice owns its data
- **Event-Driven Communication**: Services communicate via RabbitMQ
- **Circuit Breaker**: Prevents cascading failures
- **Service Discovery**: Dynamic registration with health checks

---

## 🤖 AI-Powered Health Checker

One of our innovative features is an **AI-powered disease prediction system** integrated into the Healthcare service. This intelligent bot helps citizens get preliminary health assessments based on their symptoms.

![AI Health Checker](docs/diagrams/ai_health_checker.png)

### How It Works

1. **Symptom Input**: Users describe their symptoms through an intuitive chat interface
2. **AI Analysis**: Our ML model analyzes the symptoms against a trained dataset of diseases
3. **Disease Prediction**: The system provides potential diagnoses with confidence scores
4. **Recommendations**: Users receive guidance on next steps and specialist referrals

### Features
- 🔍 **Symptom-based Analysis**: Input multiple symptoms for accurate prediction
- 📊 **Confidence Scores**: Each prediction includes a reliability percentage
- 🏥 **Doctor Recommendations**: Get matched with relevant specialists
- 🌐 **Multi-language Support**: Available in English, Hindi, and Gujarati
- ⚡ **Real-time Results**: Instant predictions powered by optimized ML models

### Use Cases
- Preliminary health screening before hospital visits
- Rural healthcare accessibility
- Reducing burden on healthcare facilities
- Emergency symptom assessment

---

## �️ Tech Stack

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

## �📁 Project Structure

```
service-delivery-platform/
├── services/                   # Backend Microservices
│   ├── api-gateway/           # Central entry point, auth, routing, load balancing
│   ├── healthcare/            # Appointments, patients, doctors, AI health checker
│   ├── agriculture/           # Farmers, schemes, advisories
│   ├── urban/                 # Complaints, departments, tracking
│   └── monitoring/            # System metrics, health, analytics
├── frontend/                   # Next.js React Application
│   ├── public/                # Static assets, locales (i18n)
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks
│       ├── services/          # API service layer
│       └── lib/               # Utilities
├── packages/                   # Shared Code
│   ├── common/                # Shared utilities, types
│   └── events/                # Event definitions
├── scripts/                    # Utility scripts (seeding, etc.)
├── nginx/                      # Nginx configuration
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture docs
│   └── diagrams/              # Visual diagrams
├── docker-compose.yml          # All services orchestration
├── package.json                # Root package (workspaces)
└── .env.example                # Environment template
```

---

## � Setup & Installation

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | 18.0.0+ |
| Docker | Latest |
| Docker Compose | Latest |
| Git | Latest |

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-team/jan-sewa-portal.git
cd jan-sewa-portal
```

### Step 2: Copy Environment File

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell) / macOS / Linux
cp .env.example .env
```

### Step 3: Install Dependencies

```bash
npm run install:all
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# Node Environment
NODE_ENV=development

# API Gateway
API_GATEWAY_PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_PREFIX=sdp_

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CACHE_TTL=300

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Microservices Ports
HEALTHCARE_SERVICE_PORT=3001
AGRICULTURE_SERVICE_PORT=3002
URBAN_SERVICE_PORT=3003
MONITORING_SERVICE_PORT=3004

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api

# CORS
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Important**: Never commit `.env` files with real secrets to version control!

---

## 🏃 Running Locally

### Option 1: Using Docker (Recommended)

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Option 2: Manual Development Mode

```bash
# Step 1: Start Infrastructure
docker-compose up -d mongodb redis rabbitmq minio

# Step 2: Start All Services
npm run dev

# Step 3: Seed Database (Optional)
npm run seed
```

### Service Ports

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
| RabbitMQ | 5672 | amqp://localhost:5672 |
| RabbitMQ UI | 15672 | http://localhost:15672 |
| MinIO Console | 9001 | http://localhost:9001 |

---

## 🔑 Test Credentials

### Pre-seeded Users (after `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jansewa.gov.in | Admin@123 |
| Sector Manager | manager@jansewa.gov.in | Manager@123 |
| Service Provider | provider@jansewa.gov.in | Provider@123 |
| Citizen | citizen@example.com | Citizen@123 |

### Service Credentials

| Service | Username | Password |
|---------|----------|----------|
| RabbitMQ | guest | guest |
| MinIO | minioadmin | minioadmin123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |

### Healthcare
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthcare/appointments` | Get appointments |
| POST | `/api/healthcare/appointments` | Book appointment |
| POST | `/api/healthcare/ai/predict` | AI disease prediction |

### Agriculture
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agriculture/schemes` | Get schemes |
| POST | `/api/agriculture/farmers` | Register farmer |

### Urban
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/urban/complaints` | Get complaints |
| POST | `/api/urban/complaints` | Submit complaint |

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Handling Features
- ✅ Input validation with `express-validator`
- ✅ Graceful degradation when services fail
- ✅ Circuit breaker for fault tolerance
- ✅ Structured logging with Winston

---

## 🔒 Security & Secrets

### ✅ Confirmation: No secrets are committed to this repository

- All sensitive data stored in `.env` files (gitignored)
- `.env.example` contains only placeholder values
- Passwords are hashed with bcrypt
- JWT tokens for stateless authentication
- Rate limiting prevents abuse

### Security Features

| Feature | Implementation |
|---------|----------------|
| Authentication | JWT with HS256 signing |
| Password Hashing | bcrypt (10 salt rounds) |
| Input Validation | express-validator |
| Rate Limiting | Redis-backed |
| CORS | Configurable origins |
| Headers | Helmet middleware |

### Gitignored Files
```
.env
.env.local
.env.*.local
data/mongodb/
data/redis/
```

---

## 👥 Team

**Team Missing Semicolon** – Ingenious Hackathon 7.0

| Member | Role |
|--------|------|
| Developer 1 | Infrastructure & API Gateway |
| Developer 2 | Healthcare Service & AI Integration |
| Developer 3 | Agriculture Service |
| Developer 4 | Urban Service & Monitoring |
| Developer 5 | Frontend UI/UX |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <b>Team Missing Semicolon</b> for Ingenious Hackathon 7.0
</p>
