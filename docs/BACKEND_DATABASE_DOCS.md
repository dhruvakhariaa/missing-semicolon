# Backend Database & Architecture Documentation

## Overview
The **Jan Sewa Portal** employs a **Microservices Architecture**, where each core domain (Urban, Healthcare, Agriculture) operates as an independent service with its own dedicated database. This ensures loose coupling, scalability, and fault tolerance.

A centralized **API Gateway** manages all incoming traffic, handling routing, aggregation, and service discovery.

---

## 1. Architecture Diagram

```mermaid
graph TD
    Client[Client (Frontend)] --> Gateway[API Gateway :3000]
    
    subgraph Infrastructure
        Registry[Service Registry]
        Redis[Redis (Cache)]
        RabbitMQ[RabbitMQ (Events)]
    end
    
    Gateway --> Registry
    Gateway -->|/api/urban| Urban[Urban Service :5003]
    Gateway -->|/api/healthcare| Health[Healthcare Service :3001]
    Gateway -->|/api/agriculture| Agri[Agriculture Service :5002]
    
    Urban --> MongoDB_Urban[(Urban DB)]
    Health --> MongoDB_Health[(Healthcare DB)]
    Agri --> MongoDB_Agri[(Agriculture DB)]
    
    Urban -.-> RabbitMQ
    Health -.-> RabbitMQ
    Agri -.-> RabbitMQ
```

---

## 2. Database Schema (MongoDB)

Each microservice utilizes a dedicated MongoDB database with specific collections and schemas.

### 🏙️ Urban Service
**Database:** `sdp_urban` (or configured via env)

| Collection | Description | Key Fields |
|:--- |:--- |:--- |
| **Complaints** | Citizen filed complaints | `id`, `citizenId`, `title`, `description`, `category` (Water, Electricity, etc.), `location`, `status` (Pending, In Progress, Resolved), `priority`, `images`, `history` |
| **ServiceRequests** | Requests for new services | `id`, `citizenId`, `serviceType` (New Connection, Certificate), `details` (Address, Name), `status`, `documents` |
| **Notifications** | Alerts for citizens | `id`, `userId`, `message`, `type` (Info, Success, Warning), `isRead` |
| **Feedbacks** | User feedback & ratings | `id`, `userId`, `context`, `rating`, `comment` |

### 🏥 Healthcare Service
**Database:** `sdp_healthcare`

| Collection | Description | Key Fields |
|:--- |:--- |:--- |
| **Patients** | Registered patients | `id`, `userId`, `name`, `dob`, `gender`, `contact`, `medicalHistory` |
| **Doctors** | Medical professionals | `id`, `name`, `specialization`, `departmentId`, `qualification`, `experience`, `availability`, `consultationFee` |
| **Departments** | Hospital departments | `id`, `name` (Cardiology, etc.), `code`, `description`, `location`, `headDoctorId` |
| **Appointments** | Scheduled visits | `id`, `patientId`, `doctorId`, `departmentId`, `dateTime`, `status` (Scheduled, Completed, Cancelled), `type` (In-Person, Video), `symptoms` |

### 🌾 Agriculture Service
**Database:** `agriculture_db`

| Collection | Description | Key Fields |
|:--- |:--- |:--- |
| **Farmers** | Farmer profiles | `id`, `name`, `phone`, `aadharNumber`, `village`, `landParcels` (Array of survey numbers, area, crops), `enrolledSchemes` |
| **Schemes** | Govt agriculture schemes | `id`, `name`, `description`, `eligibility`, `benefits`, `isActive` |
| **Advisories** | Expert crop advice | `id`, `crop`, `stage`, `advice`, `type` (Disease, Weather), `validFrom`, `validUntil` |

---

## 3. Data Flow & CRUD Operations

### General Flow
1. **Client Request**: Frontend sends HTTP request to `http://localhost:3000/api/<service>/<resource>`.
2. **API Gateway**:
   - Authenticates request (if protected).
   - Looks up service URL from **Service Registry**.
   - Proxies request to the appropriate microservice.
3. **Microservice**: receives request, validates data, performs DB operation.
4. **Database**: MongoDB executes query (Insert, Find, Update, Delete).
5. **Response**: Data flows back through Microservice -> Gateway -> Client.

### Key CRUD Operations

#### **Creating a Complaint (Urban)**
- **Endpoint**: `POST /api/urban/complaints`
- **Body**: `{ title, category, description, location, citizenId }`
- **Logic**: 
  1. Validates input.
  2. Creates new `Complaint` document with status `Pending`.
  3. Initializes `history` array.
  4. (Optional) Publishes `COMPLAINT_CREATED` event to RabbitMQ.

#### **Booking an Appointment (Healthcare)**
- **Endpoint**: `POST /api/healthcare/appointments`
- **Body**: `{ doctorId, patientId, slotDate, slotTime, type }`
- **Logic**:
  1. Checks if Doctor is available at requested time.
  2. Creates `Appointment` document.
  3. Updates Doctor's schedule (if needed).
  4. Sends confirmation notification.

#### **Registering a Farmer (Agriculture)**
- **Endpoint**: `POST /api/agriculture/farmers`
- **Body**: `{ name, aadhar, landDetails: [ ... ] }`
- **Logic**:
  1. Verifies unique Aadhar/Phone.
  2. Saves `Farmer` profile with embedded `landParcels`.

---

## 4. Service Discovery (API Gateway)
The system uses a **Client-Side Discovery** pattern (implemented via Gateway):

1. **Self-Registration**: On startup, each service sends a `POST /api/registry/register` to the Gateway with its IP, Port, and Name.
2. **Health Checks**: The Gateway periodically pings services (`/health`) to ensure they are alive.
3. **Routing**: When a request comes to `/api/urban/*`, the Gateway queries the registry for an active `urban-service` instance and forwards the traffic.

## 5. Event-Driven Communication (RabbitMQ)
Services exchange asynchronous messages for decoupling:

- **Exchange**: `sdp-events` (Topic Exchange)
- **Queues**: Service-specific queues bound to relevant topics.
- **Example**: 
  - Urban service publishes `complaint.resolved`.
  - Notification service listens to `complaint.*` and sends SMS/Email to citizen.

---

## 6. Schema Validation Rules

### Urban Service Validation

#### Complaint Model
| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `citizenId` | String | ✓ | Any non-empty string |
| `title` | String | ✓ | Trimmed, non-empty |
| `description` | String | ✓ | Any non-empty string |
| `category` | Enum | ✓ | One of: `Water`, `Electricity`, `Road`, `Waste Management`, `Sanitation`, `Other` |
| `location` | String | ✓ | Any non-empty string |
| `status` | Enum | | Default: `Pending`. Values: `Pending`, `In Progress`, `Resolved`, `Rejected` |
| `priority` | Enum | | Default: `Medium`. Values: `Low`, `Medium`, `High`, `Urgent` |
| `images` | Array[String] | | Base64 encoded images |
| `history` | Array[Object] | | Auto-initialized on creation |

### Healthcare Service Validation

#### Patient Model
| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `userId` | String | ✓ | Unique, indexed |
| `name` | String | ✓ | Non-empty, trimmed |
| `email` | String | ✓ | Lowercase, trimmed, indexed |
| `phone` | String | ✓ | Indexed |
| `gender` | Enum | | Values: `male`, `female`, `other` (lowercase) |
| `bloodGroup` | Enum | | Values: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, empty string |
| `dateOfBirth` | Date | | Valid date |
| `isActive` | Boolean | | Default: `true` |

#### Doctor Model
| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `name` | String | ✓ | Non-empty, trimmed |
| `email` | String | ✓ | Unique, lowercase, trimmed |
| `phone` | String | ✓ | Non-empty |
| `department` | ObjectId | ✓ | Valid Department reference |
| `specialization` | String | ✓ | Non-empty, trimmed |
| `qualification` | String | ✓ | Non-empty |
| `experience` | Number | | Min: 0 |
| `consultationFee` | Number | | Default: 500, Min: 0 |
| `availability.days` | Array[String] | | Enum: `Monday`-`Sunday`, Default: Mon-Fri |
| `rating` | Number | | Default: 0, Min: 0, Max: 5 |
| `isActive` | Boolean | | Default: `true` |

#### Appointment Model
| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `appointmentNumber` | String | | Auto-generated: `APT{YYYYMMDD}{0000}` |
| `patient` | ObjectId | ✓ | Valid Patient reference |
| `doctor` | ObjectId | ✓ | Valid Doctor reference |
| `department` | ObjectId | ✓ | Valid Department reference |
| `appointmentDate` | Date | ✓ | Valid date |
| `timeSlot.startTime` | String | ✓ | Time format (HH:MM) |
| `timeSlot.endTime` | String | ✓ | Time format (HH:MM) |
| `status` | Enum | | Default: `scheduled`. Values: `scheduled`, `confirmed`, `in-progress`, `completed`, `cancelled`, `no-show` |
| `type` | Enum | | Default: `in-person`. Values: `in-person`, `telemedicine` |
| `paymentStatus` | Enum | | Default: `pending`. Values: `pending`, `paid`, `refunded` |

### Agriculture Service Validation

#### Farmer Model
| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `name` | String | ✓ | Non-empty, trimmed |
| `phone` | String | ✓ | Unique, 10 digits: `/^[0-9]{10}$/` |
| `aadharNumber` | String | ✓ | Unique |
| `village` | String | ✓ | Non-empty |
| `taluka` | String | ✓ | Non-empty |
| `district` | String | ✓ | Non-empty |
| `state` | String | ✓ | Non-empty |
| `landParcels` | Array[Object] | | Embedded land parcel documents |
| `landParcels.irrigationType` | Enum | | Values: `Irrigated`, `Rainfed`, `Drip`, `Sprinkler` |

---

## 7. Edge Cases & Error Handling

### Common Validation Errors

1. **Duplicate Key Violations (E11000)**
   ```javascript
   // Example: Duplicate email in Patient
   { code: 11000, keyPattern: { email: 1 } }
   ```
   **Handling**: Check if user/record already exists before creating

2. **Validation Errors**
   ```javascript
   // Example: Invalid enum value
   {
     name: 'ValidationError',
     errors: {
       category: {
         message: 'category is not a valid enum value'
       }
     }
   }
   ```
   **Handling**: Validate input on frontend before submission

3. **Cast Errors**
   ```javascript
   // Example: Invalid ObjectId format
   { name: 'CastError', kind: 'ObjectId' }
   ```
   **Handling**: Validate ID format before querying

### Edge Cases Handled in Tests

| Scenario | Test Coverage | Expected Behavior |
|:---|:---|:---|
| Missing required fields | ✓ | ValidationError thrown |
| Invalid enum values | ✓ | ValidationError thrown |
| Duplicate unique fields | ✓ | E11000 error thrown |
| Invalid phone format | ✓ | ValidationError for regex match |
| Invalid date ranges | ✓ | Comparison operations work correctly |
| Empty arrays | ✓ | Allowed, default to `[]` |
| Missing referenced documents | ✓ | Null on populate |
| Update non-existent document | ✓ | Returns null |
| Concurrent updates | Partial | Last write wins (default MongoDB behavior) |

---

## 8. Local MongoDB Setup & Visualization

### Quick Start

1. **Ensure MongoDB is running:**
   ```bash
   docker-compose up -d mongodb
   ```

2. **Verify connection:**
   ```bash
   docker ps | findstr mongodb
   # Should show: sdp-mongodb ... Up ... 0.0.0.0:27017->27017/tcp
   ```

3. **Connect using MongoDB Compass:**
   - Download from: https://www.mongodb.com/try/download/compass
   - Connection String: `mongodb://localhost:27017`
   - Browse databases: `sdp_urban`, `sdp_healthcare`, `sdp_agriculture`

4. **Or use mongosh CLI:**
   ```bash
   docker exec -it sdp-mongodb mongosh
   ```

**For detailed setup instructions**, see [mongodb-local-setup.md](file:///d:/CODES/hackathon/missing-semicolon/docs/mongodb-local-setup.md)

---

## 9. Common Database Queries

### Urban Service Queries

```javascript
// Find all pending complaints
db.complaints.find({ status: "Pending" })

// Find urgent road complaints
db.complaints.find({ 
  category: "Road", 
  priority: "Urgent" 
})

// Count complaints by status
db.complaints.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Find recently resolved complaints
db.complaints.find({
  status: "Resolved",
  resolvedAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
})
```

### Healthcare Service Queries

```javascript
// Find all active doctors in a department
db.doctors.find({ 
  department: ObjectId("..."), 
  isActive: true 
})

// Find upcoming appointments for a patient
db.appointments.find({
  patient: ObjectId("..."),
  appointmentDate: { $gte: new Date() },
  status: { $in: ["scheduled", "confirmed"] }
}).sort({ appointmentDate: 1 })

// Find patients with specific blood group
db.patients.find({ bloodGroup: "O+", isActive: true })

// Populate appointment with all references
db.appointments.findOne({ _id: ObjectId("...") })
  .populate('patient')
  .populate('doctor')
  .populate('department')
```

### Agriculture Service Queries

```javascript
// Find farmers in a district
db.farmers.find({ district: "Pune" })

// Find farmers growing a specific crop
db.farmers.find({ "landParcels.currentCrop": "Wheat" })

// Calculate total land area for a farmer
db.farmers.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $unwind: "$landParcels" },
  { $group: { 
      _id: "$_id", 
      totalArea: { $sum: "$landParcels.area" } 
  }}
])

// Find active schemes
db.schemes.find({ isActive: true })

// Find current advisories for a crop
db.advisories.find({
  crop: "Rice",
  validFrom: { $lte: new Date() },
  validUntil: { $gte: new Date() }
})
```

---

## 10. Performance & Indexing

### Existing Indexes

#### Healthcare Service
- **Patient**: `userId` (unique), `email`, `phone`, `name` (text)
- **Doctor**: `email` (unique), `department`, `specialization`, `isActive`, `name + specialization` (text)
- **Appointment**: `patient`, `doctor`, `appointmentDate`, `status`, `appointmentNumber`, compound: `(doctor, appointmentDate, timeSlot.startTime)`

#### Agriculture Service
- **Farmer**: `phone` (unique), `aadharNumber` (unique)

#### Urban Service
- Default `_id` index on all collections

### Performance Tips

1. **Use indexes for frequent queries**
   ```javascript
   // If you frequently query complaints by category
   db.complaints.createIndex({ category: 1 })
   ```

2. **Limit large result sets**
   ```javascript
   db.patients.find({}).limit(100)
   ```

3. **Use projections to reduce data transfer**
   ```javascript
   db.doctors.find(
     { department: ObjectId("...") },
     { name: 1, specialization: 1, consultationFee: 1 }
   )
   ```

4. **Avoid loading large embedded arrays**
   - Use `$slice` for pagination within arrays
   - Consider moving large embeddings to separate collections

5. **Monitor slow queries**
   ```javascript
   db.setProfilingLevel(1, { slowms: 100 })
   ```

### Connection Pooling

The microservices use connection pooling for efficiency:
```javascript
mongoose.connect(mongoUri, {
  maxPoolSize: 10,  // Max connections
  minPoolSize: 2,   // Min connections
  serverSelectionTimeoutMS: 10000
})
```

---

## 11. Testing Your Databases

### Run Connection Tests
```bash
node scripts/test-db-connection.js
```
Verifies all 5 MongoDB databases are accessible and shows connection stats.

### Run CRUD Tests

**Urban Service:**
```bash
node scripts/test-urban-crud.js
```

**Healthcare Service:**
```bash
node scripts/test-healthcare-crud.js
```

**Agriculture Service:**
```bash
node scripts/test-agriculture-crud.js
```

Each test suite:
- ✅ Creates test data
- ✅ Tests all CRUD operations
- ✅ Validates constraints and edge cases
- ✅ Cleans up test data automatically

---

## 12. Troubleshooting

### MongoDB Connection Failed

**Error**: `MongoServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Start MongoDB: `docker-compose up -d mongodb`
2. Check container: `docker ps | findstr mongodb`
3. View logs: `docker-compose logs mongodb`

### Validation Errors

**Error**: `ValidationError: category: Path 'category' is required`

**Solution**: Ensure all required fields are provided in request body

### Duplicate Key Error

**Error**: `E11000 duplicate key error collection: sdp_healthcare.patients index: email_1`

**Solution**: User with this email already exists. Use update instead of create, or check before creating

---

## Next Steps

1. **Seed test data**: Run `node scripts/seed-test-data.js` (when created)
2. **View in MongoDB Compass**: See [mongodb-local-setup.md](file:///d:/CODES/hackathon/missing-semicolon/docs/mongodb-local-setup.md)
3. **Monitor performance**: Use Compass Performance tab or enable profiling
4. **Add custom indexes**: Based on your query patterns

