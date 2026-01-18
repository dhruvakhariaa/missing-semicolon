/**
 * Quick Seed Script - Uses inline schemas to avoid Mongoose version conflicts
 * This script seeds ALL databases without importing from service node_modules
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Database URIs
const HEALTHCARE_URI = process.env.HEALTHCARE_MONGO_URI || 'mongodb://127.0.0.1:27017/sdp_healthcare';
const URBAN_URI = process.env.URBAN_MONGO_URI || 'mongodb://127.0.0.1:27017/sdp_urban';
const AGRICULTURE_URI = process.env.AGRICULTURE_MONGO_URI || 'mongodb://127.0.0.1:27017/sdp_agriculture';

// ============================================
// INLINE SCHEMAS (avoid version conflicts)
// ============================================

// Healthcare Schemas
const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    location: mongoose.Schema.Types.Mixed,
    contactPhone: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    specialization: String,
    qualification: String,
    experience: Number,
    consultationFee: { type: Number, default: 500 },
    bio: String,
    availability: {
        days: [String],
        startTime: String,
        endTime: String,
        slotDuration: Number
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Urban Schemas
const ComplaintSchema = new mongoose.Schema({
    citizenId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Water', 'Electricity', 'Road', 'Waste Management', 'Sanitation', 'Other'], required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    images: [String],
    history: [{ status: String, timestamp: Date, note: String }],
    resolvedAt: Date
}, { timestamps: true });

const ServiceRequestSchema = new mongoose.Schema({
    citizenId: { type: String, required: true },
    serviceType: { type: String, required: true },
    details: mongoose.Schema.Types.Mixed,
    status: { type: String, default: 'Pending' },
    documents: [String]
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Info', 'Success', 'Warning', 'Error'], default: 'Info' },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Agriculture Schemas
const FarmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    aadharNumber: { type: String, required: true, unique: true },
    village: { type: String, required: true },
    taluka: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    landParcels: [{
        surveyNumber: String,
        area: Number,
        village: String,
        irrigationType: { type: String, enum: ['Irrigated', 'Rainfed', 'Drip', 'Sprinkler'] },
        currentCrop: String,
        sowingDate: Date,
        soilDetails: {
            ph: Number,
            nitrogen: Number,
            phosphorus: Number,
            potassium: Number,
            organicCarbon: Number,
            lastTested: Date
        }
    }],
    enrolledSchemes: [{
        schemeName: String,
        status: String,
        applicationId: String,
        category: String,
        landArea: Number,
        bankAccount: String
    }]
}, { timestamps: true });

const SchemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    eligibility: String,
    benefits: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AdvisorySchema = new mongoose.Schema({
    crop: { type: String, required: true },
    stage: String,
    advice: { type: String, required: true },
    type: { type: String, enum: ['Weather', 'Disease', 'Fertilizer', 'General'] },
    validFrom: Date,
    validUntil: Date
}, { timestamps: true });

// ============================================
// SAMPLE DATA
// ============================================

const departmentsData = [
    { name: 'General Medicine', code: 'GENMED', description: 'Primary healthcare' },
    { name: 'Cardiology', code: 'CARDIO', description: 'Heart specialists' },
    { name: 'Neurology', code: 'NEURO', description: 'Brain and nervous system' },
    { name: 'Pediatrics', code: 'PEDIA', description: 'Child healthcare' },
    { name: 'Orthopedics', code: 'ORTHO', description: 'Bone and joint specialists' },
    { name: 'Dermatology', code: 'DERM', description: 'Skin conditions' }
];

const complaintsData = [
    { citizenId: 'CIT-001', title: 'Street Light Not Working', description: 'Broken street light on MG Road', category: 'Electricity', location: 'MG Road, Sector 12', priority: 'High' },
    { citizenId: 'CIT-002', title: 'Pothole on Highway', description: 'Large pothole causing accidents', category: 'Road', location: 'NH-8, KM 23', priority: 'Urgent', status: 'In Progress' },
    { citizenId: 'CIT-003', title: 'Water Leakage', description: 'Pipeline leakage near market', category: 'Water', location: 'Central Market', priority: 'Medium' },
    { citizenId: 'CIT-001', title: 'Garbage Not Collected', description: 'No collection for 5 days', category: 'Waste Management', location: 'Green Park Colony', status: 'Resolved', resolvedAt: new Date() },
    { citizenId: 'CIT-004', title: 'Drainage Blocked', description: 'Flooding in streets', category: 'Sanitation', location: 'Gandhi Nagar', priority: 'High' }
];

const serviceRequestsData = [
    { citizenId: 'CIT-001', serviceType: 'New Water Connection', details: { address: '123 Rose Garden' }, status: 'Pending' },
    { citizenId: 'CIT-002', serviceType: 'Birth Certificate', details: { childName: 'Ananya Sharma' }, status: 'Approved' },
    { citizenId: 'CIT-003', serviceType: 'Property Tax Payment', details: { amount: 15000 }, status: 'Completed' }
];

const notificationsData = [
    { userId: 'CIT-001', message: 'Your complaint has been resolved', type: 'Success' },
    { userId: 'CIT-002', message: 'Water maintenance scheduled tomorrow', type: 'Warning' },
    { userId: 'CIT-001', message: 'Service request approved', type: 'Success', isRead: true }
];

const farmersData = [
    {
        name: 'Ramesh Patil', phone: '9876000001', aadharNumber: '1234-5678-9001',
        village: 'Khandala', taluka: 'Maval', district: 'Pune', state: 'Maharashtra',
        landParcels: [
            { surveyNumber: 'S-123/A', area: 5.5, village: 'Khandala', irrigationType: 'Drip', currentCrop: 'Wheat', sowingDate: new Date('2024-11-01') },
            { surveyNumber: 'S-123/B', area: 3.2, village: 'Khandala', irrigationType: 'Rainfed', currentCrop: 'Jowar' }
        ],
        enrolledSchemes: [{ schemeName: 'PM-KISAN', status: 'Approved', applicationId: 'PMK-2024-001', landArea: 8.7 }]
    },
    {
        name: 'Sunita Deshmukh', phone: '9876000002', aadharNumber: '2345-6789-0012',
        village: 'Lonavala', taluka: 'Maval', district: 'Pune', state: 'Maharashtra',
        landParcels: [{ surveyNumber: 'S-456/A', area: 4.0, village: 'Lonavala', irrigationType: 'Sprinkler', currentCrop: 'Rice' }]
    },
    {
        name: 'Ganesh Jadhav', phone: '9876000003', aadharNumber: '3456-7890-1234',
        village: 'Satara', taluka: 'Satara', district: 'Satara', state: 'Maharashtra',
        landParcels: [
            { surveyNumber: 'S-789/A', area: 12.0, village: 'Satara', irrigationType: 'Irrigated', currentCrop: 'Sugarcane' },
            { surveyNumber: 'S-789/B', area: 8.0, village: 'Satara', irrigationType: 'Drip', currentCrop: 'Grapes' }
        ],
        enrolledSchemes: [{ schemeName: 'PM-KISAN', status: 'Approved', applicationId: 'PMK-2024-002', landArea: 20.0 }]
    },
    {
        name: 'Laxmi Bhosale', phone: '9876000004', aadharNumber: '4567-8901-2345',
        village: 'Nashik', taluka: 'Nashik', district: 'Nashik', state: 'Maharashtra',
        landParcels: [{ surveyNumber: 'S-101/A', area: 6.5, village: 'Nashik', irrigationType: 'Drip', currentCrop: 'Onion' }]
    }
];

const schemesData = [
    { name: 'PM-KISAN', description: 'Direct income support ₹6000/year', eligibility: 'All farmers', benefits: '₹2000 x 3 installments', isActive: true },
    { name: 'PMFBY', description: 'Crop insurance scheme', eligibility: 'Farmers with notified crops', benefits: 'Insurance for crop loss', isActive: true },
    { name: 'Soil Health Card', description: 'Free soil testing', eligibility: 'All farmers', benefits: 'Soil health card + recommendations', isActive: true },
    { name: 'Kisan Credit Card', description: 'Credit for farmers', eligibility: 'All farmers', benefits: 'Low interest loans up to ₹3L', isActive: true },
    { name: 'Drip Irrigation Subsidy', description: 'Water conservation', eligibility: 'Farmers with suitable land', benefits: '50-90% subsidy', isActive: true }
];

const advisoriesData = [
    { crop: 'Wheat', stage: 'Tillering', advice: 'Apply nitrogen fertilizer @50kg/acre', type: 'Fertilizer', validFrom: new Date(), validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { crop: 'Rice', stage: 'Panicle Initiation', advice: 'Maintain 5cm water level', type: 'General', validFrom: new Date(), validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { crop: 'Cotton', stage: 'Flowering', advice: 'Heavy rainfall expected - postpone spraying', type: 'Weather', validFrom: new Date(), validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { crop: 'Onion', stage: 'Bulb Formation', advice: 'Purple blotch alert - spray Mancozeb', type: 'Disease', validFrom: new Date(), validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
    { crop: 'Sugarcane', stage: 'Grand Growth', advice: 'Apply potash for improved sucrose', type: 'Fertilizer', validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
];

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedHealthcare() {
    console.log('\n🏥 Seeding Healthcare Service...');
    const conn = await mongoose.createConnection(HEALTHCARE_URI);

    const Department = conn.model('Department', DepartmentSchema);
    const Doctor = conn.model('Doctor', DoctorSchema);

    await Department.deleteMany({});
    await Doctor.deleteMany({});

    const departments = await Department.insertMany(departmentsData);
    console.log(`   ✅ Created ${departments.length} departments`);

    // Generate doctors
    const doctorsData = [];
    const names = ['Dr. Anil Kumar', 'Dr. Priya Sharma', 'Dr. Rajesh Patel', 'Dr. Meera Nair', 'Dr. Suresh Reddy', 'Dr. Kavitha Menon'];
    departments.forEach((dept, i) => {
        doctorsData.push({
            name: names[i % names.length],
            email: `doctor${i}@hospital.gov.in`,
            phone: `98765432${10 + i}`,
            department: dept._id,
            specialization: dept.name,
            qualification: 'MBBS, MD',
            experience: 5 + i * 2,
            consultationFee: 500 + i * 100,
            availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '17:00', slotDuration: 30 },
            rating: 4.0 + (i % 10) / 10,
            totalReviews: 50 + i * 10
        });
    });

    const doctors = await Doctor.insertMany(doctorsData);
    console.log(`   ✅ Created ${doctors.length} doctors`);

    await conn.close();
    return { departments: departments.length, doctors: doctors.length };
}

async function seedUrban() {
    console.log('\n🏙️  Seeding Urban Service...');
    const conn = await mongoose.createConnection(URBAN_URI);

    const Complaint = conn.model('Complaint', ComplaintSchema);
    const ServiceRequest = conn.model('ServiceRequest', ServiceRequestSchema);
    const Notification = conn.model('Notification', NotificationSchema);

    await Complaint.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Notification.deleteMany({});

    const complaints = await Complaint.insertMany(complaintsData);
    console.log(`   ✅ Created ${complaints.length} complaints`);

    const requests = await ServiceRequest.insertMany(serviceRequestsData);
    console.log(`   ✅ Created ${requests.length} service requests`);

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`   ✅ Created ${notifications.length} notifications`);

    await conn.close();
    return { complaints: complaints.length, requests: requests.length, notifications: notifications.length };
}

async function seedAgriculture() {
    console.log('\n🌾 Seeding Agriculture Service...');
    const conn = await mongoose.createConnection(AGRICULTURE_URI);

    const Farmer = conn.model('Farmer', FarmerSchema);
    const Scheme = conn.model('Scheme', SchemeSchema);
    const Advisory = conn.model('Advisory', AdvisorySchema);

    await Farmer.deleteMany({});
    await Scheme.deleteMany({});
    await Advisory.deleteMany({});

    const farmers = await Farmer.insertMany(farmersData);
    console.log(`   ✅ Created ${farmers.length} farmers`);

    const schemes = await Scheme.insertMany(schemesData);
    console.log(`   ✅ Created ${schemes.length} schemes`);

    const advisories = await Advisory.insertMany(advisoriesData);
    console.log(`   ✅ Created ${advisories.length} advisories`);

    await conn.close();
    return { farmers: farmers.length, schemes: schemes.length, advisories: advisories.length };
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('🌱 Quick Seed Script - Standalone Version');
    console.log('==========================================');
    console.log('This script uses inline schemas to avoid version conflicts.\n');

    try {
        const healthcareResults = await seedHealthcare();
        const urbanResults = await seedUrban();
        const agricultureResults = await seedAgriculture();

        console.log('\n🎉 ALL DATABASES SEEDED SUCCESSFULLY!');
        console.log('======================================');
        console.log(`🏥 Healthcare: ${healthcareResults.departments} departments, ${healthcareResults.doctors} doctors`);
        console.log(`🏙️  Urban: ${urbanResults.complaints} complaints, ${urbanResults.requests} requests, ${urbanResults.notifications} notifications`);
        console.log(`🌾 Agriculture: ${agricultureResults.farmers} farmers, ${agricultureResults.schemes} schemes, ${agricultureResults.advisories} advisories`);
        console.log('======================================\n');
        console.log('📊 Open MongoDB Compass and connect to:');
        console.log('   mongodb://localhost:27017');
        console.log('\n   You will now see these databases with data:');
        console.log('   • sdp_healthcare');
        console.log('   • sdp_urban');
        console.log('   • sdp_agriculture\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
