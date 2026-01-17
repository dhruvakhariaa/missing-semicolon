# National-Scale Digital Public Infrastructure

> **Ingenious Hackathon 7.0** - Building Trustworthy, Scalable, and Human-Centered Digital Systems for the Next Decade

A comprehensive digital infrastructure platform supporting multiple public services through a shared, modular, and scalable architecture.

## 🏗️ Architecture Overview

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

## 📁 Project Structure

```
service-delivery-platform/
├── services/                   # Backend Microservices
│   ├── api-gateway/           # Single entry point, auth, routing
│   ├── healthcare/            # Appointments, patients, doctors
│   ├── agriculture/           # Farmers, advisories, market prices
│   ├── urban/                 # Complaints, departments, tracking
│   └── monitoring/            # Metrics, health, analytics
├── frontend/                   # React + Next.js Application
│   ├── public/                # Static assets, locales
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks
│       ├── services/          # API service layer
│       └── store/             # State management
├── packages/                   # Shared Code
│   ├── common/                # Shared utilities, types
│   └── events/                # Event definitions
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture docs
│   └── diagrams/              # Visual diagrams
├── docker-compose.yml          # All services orchestration
├── package.json                # Root package (workspaces)
└── .env.example                # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

1. Clone and install dependencies:
```bash
git clone <repo>
cd service-delivery-platform
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start infrastructure (MongoDB, Redis, RabbitMQ):
```bash
docker-compose up -d mongodb redis rabbitmq
```

4. Start all services:
```bash
npm run dev
```

### With Docker (Full Stack)
```bash
docker-compose up --build
```

## 🔧 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Central entry point |
| Healthcare | 3001 | Appointment booking |
| Agriculture | 3002 | Farmer advisory |
| Urban | 3003 | Complaint management |
| Monitoring | 3004 | System analytics |
| Frontend | 5173 | User interface |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache |
| RabbitMQ | 5672, 15672 | Message queue |

## 🎯 Key Features

- **Service Registry**: Dynamic service discovery
- **Load Balancing**: Round-robin across instances
- **Caching**: Redis for reduced DB load
- **Event-Driven**: RabbitMQ pub/sub
- **Multi-Language**: English, Hindi, Gujarati
- **Monitoring Dashboard**: Real-time metrics

## 📚 Documentation

See `/docs` folder for:
- API Documentation
- Architecture Details
- Setup Guides

## 👥 Team

MERN Stack Development Team - Ingenious Hackathon 7.0
