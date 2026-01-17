# Monitoring and Analytics Microservice

## Purpose
System health tracking, performance metrics, usage analytics.

## Key Functions (Modular - can be extended)
- Real-time service health status monitoring
- Request volume and latency tracking
- Error rate and failure detection
- User activity analytics
- Predictive load forecasting using historical data (AI/ML - future)

## Data Sensitivity: LOW
- Aggregated metrics, no personal data

## Scaling Consideration
- Constant load, minimal scaling needed

## Structure
```
monitoring/
├── src/
│   ├── config/           # Database, Redis, RabbitMQ connections
│   ├── controllers/      # metricsController, healthController, analyticsController
│   ├── middleware/       # auth, validation
│   ├── models/           # Metric, ServiceHealth, AuditLog, Alert
│   ├── routes/           # API route definitions
│   ├── services/         # MetricsCollector, HealthAggregator, AlertService
│   ├── events/           # Subscribe to all service events for analytics
│   ├── collectors/       # Data collectors for different metric types
│   └── utils/            # Helpers, time-series utilities
├── Dockerfile
└── package.json
```

## Events Subscribed
- `appointment.created`
- `advisory.requested`
- `complaint.highPriority`
- `system.maintenance`

## Dashboard Data Provided
- Service Status (green/yellow/red)
- Request Rates
- Latency Charts
- Error Counts
- User Analytics
- Security Events
