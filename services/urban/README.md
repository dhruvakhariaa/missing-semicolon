# Urban Microservice

## Purpose
City complaint management, utility coordination, transportation info.

## Key Functions (Modular - can be extended)
- Complaint registration with category and location
- Complaint tracking and status updates
- Priority assignment based on severity and type
- Department routing for resolution
- Citizen feedback after resolution

## Data Sensitivity: LOW to MEDIUM
- Public complaints but personal info included

## Scaling Consideration
- Peak during commute hours (8-9 AM, 5-7 PM)

## Structure
```
urban/
├── src/
│   ├── config/           # Database, Redis, RabbitMQ connections
│   ├── controllers/      # complaintController, departmentController, feedbackController
│   ├── middleware/       # auth, validation, upload (for images)
│   ├── models/           # Complaint, Department, Category, Feedback
│   ├── routes/           # API route definitions
│   ├── services/         # Complaint service, priority engine, department router
│   ├── events/           # RabbitMQ event publishers/subscribers
│   └── utils/            # Helpers, geolocation
├── Dockerfile
└── package.json
```

## Events Published
- `complaint.created`
- `complaint.highPriority`
- `complaint.resolved`
- `feedback.received`
