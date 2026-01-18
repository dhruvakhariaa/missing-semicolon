# MongoDB Local Setup Guide

## Overview
This guide explains how to view and interact with your MongoDB databases locally for the Jan Sewa Portal project. You'll learn to use both MongoDB Compass (GUI) and mongosh (CLI) to inspect your data.

## Prerequisites
- Docker installed and running
- MongoDB container running (started via `docker-compose up -d mongodb`)
- MongoDB is exposed on `localhost:27017`

---

## Method 1: MongoDB Compass (GUI Tool) - Recommended for Beginners

### Step 1: Download and Install MongoDB Compass

1. Visit: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Download MongoDB Compass for Windows
3. Run the installer and follow the installation wizard
4. Launch MongoDB Compass after installation

### Step 2: Connect to Local MongoDB

1. **Open MongoDB Compass**
2. **Connection String**: In the connection dialog, you'll see a connection string field
3. **Enter**: `mongodb://localhost:27017`
4. **Click "Connect"**

![Connection Screen - enter mongodb://localhost:27017](

### Step 3: View Databases

Once connected, you'll see a list of databases in the left sidebar:

- **sdp_registry** - API Gateway service registry
- **sdp_urban** - Urban Service database
- **sdp_healthcare** - Healthcare Service database
- **sdp_agriculture** - Agriculture Service database (might shows as different name based on env)
- **sdp_analytics** - Monitoring/Analytics Service database

### Step 4: Browse Collections

1. **Click on a database** (e.g., `sdp_healthcare`) to expand it
2. You'll see **collections** (tables in SQL terms):
   - For Healthcare: `patients`, `doctors`, `departments`, `appointments`
   - For Urban: `complaints`, `servicerequests`, `notifications`, `feedbacks`
   - For Agriculture: `farmers`, `schemes`, `advisories`

3. **Click on a collection** to view its documents

### Step 5: View and Query Documents

#### Viewing Documents
- Documents (rows) are displayed in a readable JSON format
- Use the pagination controls to navigate through multiple documents
- Click on any document to expand and view all fields

#### Running Queries
1. In the **Filter** field, enter MongoDB query syntax:
   ```javascript
   { status: "Pending" }
   ```
2. Click **Find** to execute
3. Results will display below

#### Example Queries

**Find all pending complaints:**
```javascript
{ status: "Pending" }
```

**Find patients with specific blood group:**
```javascript
{ bloodGroup: "O+" }
```

**Find appointments on a specific date:**
```javascript
{ appointmentDate: { $gte: ISODate("2024-01-18") } }
```

**Find farmers in a specific district:**
```javascript
{ district: "Pune" }
```

### Step 6: Indexes and Schema

1. Click on **Indexes** tab to view database indexes
2. Click on **Schema** tab to see field distribution and data types
3. Click on **Explain Plan** to analyze query performance

---

## Method 2: mongosh (MongoDB Shell) - For Advanced Users

### Step 1: Access MongoDB Shell

#### Option A: Using Docker (Recommended)
```bash
docker exec -it sdp-mongodb mongosh
```

#### Option B: Install mongosh Locally
1. Download from: [https://www.mongodb.com/docs/mongodb-shell/install/](https://www.mongodb.com/docs/mongodb-shell/install/)
2. After installation, connect:
   ```bash
   mongosh mongodb://localhost:27017
   ```

### Step 2: Basic mongosh Commands

#### List all databases
```javascript
show dbs
```

#### Switch to a database
```javascript
use sdp_healthcare
```

#### List collections in current database
```javascript
show collections
```

#### Count documents in a collection
```javascript
db.patients.countDocuments()
```

#### View all documents (limit 20)
```javascript
db.patients.find().pretty()
```

#### Find specific documents
```javascript
// Find by ID
db.patients.findOne({ userId: "USR001" })

// Find with filter
db.complaints.find({ status: "Pending" }).pretty()

// Find with multiple conditions
db.appointments.find({ 
  status: "scheduled",
  appointmentDate: { $gte: new Date() }
}).pretty()
```

#### Count by criteria
```javascript
db.complaints.countDocuments({ status: "Resolved" })
```

#### Aggregation example
```javascript
db.complaints.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Step 3: Useful mongosh Commands

#### View database statistics
```javascript
db.stats()
```

#### View collection statistics
```javascript
db.patients.stats()
```

#### List indexes
```javascript
db.patients.getIndexes()
```

#### Sample random documents
```javascript
db.farmers.aggregate([{ $sample: { size: 5 } }])
```

### Step 4: Exit mongosh
```javascript
exit
```

---

## Common Tasks

### Task 1: Check if Data Exists

**Compass:**
1. Connect to MongoDB
2. Click on database → collection
3. View document count in the top bar

**mongosh:**
```javascript
use sdp_healthcare
db.patients.countDocuments()
db.doctors.countDocuments()
```

### Task 2: Search for Specific Records

**Compass:**
1. Open collection
2. Use Filter field: `{ name: { $regex: /John/i } }`
3. Click Find

**mongosh:**
```javascript
db.patients.find({ name: { $regex: /John/i } }).pretty()
```

### Task 3: View Related Data (Populate References)

In mongosh, you can use aggregation to join collections:

```javascript
db.appointments.aggregate([
  {
    $lookup: {
      from: "patients",
      localField: "patient",
      foreignField: "_id",
      as: "patientDetails"
    }
  },
  {
    $lookup: {
      from: "doctors",
      localField: "doctor",
      foreignField: "_id",
      as: "doctorDetails"
    }
  },
  { $limit: 5 }
]).pretty()
```

### Task 4: Export Data

**Compass:**
1. Open collection
2. Click **Export Collection** button (top right)
3. Choose format (JSON/CSV)
4. Select fields and export

**mongosh/CLI:**
```bash
# Export to JSON
docker exec sdp-mongodb mongoexport --db=sdp_healthcare --collection=patients --out=/data/patients.json

# Copy from container to local
docker cp sdp-mongodb:/data/patients.json ./patients.json
```

---

## Troubleshooting

### Cannot Connect to mongod://localhost:27017

**Check if MongoDB container is running:**
```bash
docker ps | findstr mongodb
```

**If not running, start it:**
```bash
cd d:\CODES\hackathon\missing-semicolon
docker-compose up -d mongodb
```

**Check container logs:**
```bash
docker-compose logs mongodb
```

### "Connection Refused" Error

1. Verify port 27017 is exposed:
   ```bash
   docker port sdp-mongodb
   ```
   Should show: `27017/tcp -> 0.0.0.0:27017`

2. Check if another service is using port 27017:
   ```bash
   netstat -ano | findstr 27017
   ```

### Empty Databases

If databases appear empty:
1. Run the test scripts to populate data
2. Ensure services have started and created their collections
3. Check service logs for database connection errors

---

## Best Practices

1. **Read-Only Access**: When exploring data, use `.find()` instead of `.update()` or `.delete()`
2. **Use Limits**: Always limit large queries: `.find().limit(20)`
3. **Backup Before Deleting**: Export data before running delete operations
4. **Use Indexes**: Check which fields have indexes for better query performance
5. **Pretty Print**: Use `.pretty()` in mongosh for readable output

---

## Next Steps

After viewing your databases:
1. Run CRUD test scripts to validate operations: `node scripts/test-healthcare-crud.js`
2. Monitor database performance using Compass's Performance tab
3. Create custom queries based on your application needs
4. Set up alerts for database size and performance

---

## Resources

- **MongoDB Compass Docs**: [https://www.mongodb.com/docs/compass/](https://www.mongodb.com/docs/compass/)
- **mongosh Docs**: [https://www.mongodb.com/docs/mongodb-shell/](https://www.mongodb.com/docs/mongodb-shell/)
- **MongoDB Query Operators**: [https://www.mongodb.com/docs/manual/reference/operator/query/](https://www.mongodb.com/docs/manual/reference/operator/query/)
