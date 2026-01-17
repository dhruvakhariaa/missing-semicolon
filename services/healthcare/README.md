# Healthcare Microservice

## Purpose
Medical appointment booking, patient records, telemedicine coordination.

## Key Functions (Modular - can be extended)
- Patient registration and profile management
- Appointment scheduling with availability checking
- Doctor/department assignment based on specialization
- Medical history storage with encryption
- Appointment reminders and notifications

## Data Sensitivity: HIGH
- Requires encryption at rest and in transit
- HIPAA-like compliance considerations

## Scaling Consideration
- High morning peak (9-11 AM), scale up during these hours

## Structure
```
healthcare/
├── src/
│   ├── config/           # Database, Redis, RabbitMQ connections
│   ├── controllers/      # appointmentController, patientController, doctorController
│   ├── middleware/       # auth, validation, encryption
│   ├── models/           # Patient, Appointment, Doctor, Department
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic, notification service
│   ├── events/           # RabbitMQ event publishers/subscribers
│   └── utils/            # Helpers, encryption utils
├── Dockerfile
└── package.json
```

## Events Published
- `appointment.created`
- `appointment.cancelled`
- `patient.registered`
