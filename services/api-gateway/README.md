# API Gateway Service

## Purpose
Single entry point for all client requests with the following responsibilities:
- Authentication and authorization enforcement (JWT)
- Rate limiting to prevent abuse and DDoS attacks
- Request routing to appropriate microservices
- Load balancing across multiple service instances
- Service discovery and health monitoring
- Request/response logging for audit trails

## Structure
```
api-gateway/
├── src/
│   ├── config/           # Database, Redis, RabbitMQ connections
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, rate limiting, error handling
│   ├── models/           # User, Session models
│   ├── routes/           # API route definitions
│   ├── services/         # ServiceRegistry, LoadBalancer, HealthChecker
│   └── utils/            # Logger, helpers
├── Dockerfile
└── package.json
```

## Key Patterns
- Circuit Breaker: Prevent cascading failures
- Service Registry: Dynamic discovery of service instances
- Load Balancer: Round-robin distribution to healthy instances
