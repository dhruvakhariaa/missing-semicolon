# Agriculture Microservice

## Purpose
Farmer support, crop advisory, market prices, weather information.

## Key Functions (Modular - can be extended)
- Farmer registration with land and crop details
- Crop disease diagnosis and treatment recommendations
- Weather forecast integration for planning
- Market price information for informed selling
- Government scheme notifications and applications

## Data Sensitivity: MEDIUM
- Farmer personal info needs protection

## Scaling Consideration
- Peak usage early morning (6-8 AM) and evening (6-8 PM)

## Structure
```
agriculture/
├── src/
│   ├── config/           # Database, Redis, RabbitMQ connections
│   ├── controllers/      # farmerController, advisoryController, marketController
│   ├── middleware/       # auth, validation
│   ├── models/           # Farmer, Advisory, Crop, MarketPrice, Scheme
│   ├── routes/           # API route definitions
│   ├── services/         # Advisory service, weather integration, price fetcher
│   ├── events/           # RabbitMQ event publishers/subscribers
│   └── utils/            # Helpers
├── Dockerfile
└── package.json
```

## Events Published
- `advisory.requested`
- `farmer.registered`
- `scheme.applied`
