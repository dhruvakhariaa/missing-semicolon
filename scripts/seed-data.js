/**
 * Unified Seed Script for Service Delivery Platform
 * Seeds data for multiple microservices: Healthcare, Urban
 * 
 * Usage:
 *   node scripts/seed-data.js          # Seeds ALL services
 *   node scripts/seed-data.js urban    # Seeds only Urban service
 *   node scripts/seed-data.js healthcare # Seeds only Healthcare service
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// ============================================
// HEALTHCARE SERVICE DATA & MODELS
// ============================================
let Department, Doctor;
try {
    Department = require('../services/healthcare/src/models/Department');
    Doctor = require('../services/healthcare/src/models/Doctor');
} catch (e) {
    console.log('⚠️  Healthcare models not found, skipping healthcare seed');
}

const departmentsData = [
    {
        name: 'General Medicine',
        code: 'GENMED',
        description: 'Primary healthcare and general consultations for common illnesses and health checkups.',
        icon: 'stethoscope',
        location: { building: 'Building A', floor: 'Ground Floor', room: 'G-101' },
        contactPhone: '+91-1800-111-001',
        isActive: true
    },
    {
        name: 'Cardiology',
        code: 'CARDIO',
        description: 'Heart and cardiovascular system specialists.',
        icon: 'heart',
        location: { building: 'Building B', floor: '1st Floor', room: '1-201' },
        contactPhone: '+91-1800-111-002',
        isActive: true
    },
    {
        name: 'Neurology',
        code: 'NEURO',
        description: 'Brain, spine, and nervous system disorders.',
        icon: 'brain',
        location: { building: 'Building B', floor: '2nd Floor', room: '2-305' },
        contactPhone: '+91-1800-111-003',
        isActive: true
    },
    {
        name: 'Pediatrics',
        code: 'PEDIA',
        description: 'Healthcare for infants, children, and adolescents.',
        icon: 'baby',
        location: { building: 'Building C', floor: 'Ground Floor', room: 'G-150' },
        contactPhone: '+91-1800-111-004',
        isActive: true
    },
    {
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bone, joints, and musculoskeletal system specialists.',
        icon: 'bone',
        location: { building: 'Building A', floor: '1st Floor', room: '1-110' },
        contactPhone: '+91-1800-111-005',
        isActive: true
    },
    {
        name: 'Dermatology',
        code: 'DERM',
        description: 'Skin, hair, and nail conditions.',
        icon: 'activity',
        location: { building: 'Building A', floor: '2nd Floor', room: '2-220' },
        contactPhone: '+91-1800-111-006',
        isActive: true
    }
];

// ============================================
// URBAN SERVICE DATA & MODELS
// ============================================
let Complaint, ServiceRequest, Notification;
try {
    Complaint = require('../services/urban/src/models/Complaint');
    ServiceRequest = require('../services/urban/src/models/ServiceRequest');
    Notification = require('../services/urban/src/models/Notification');
} catch (e) {
    console.log('⚠️  Urban models not found, skipping urban seed');
}

const userId = 'demo-citizen-123';

const complaintsData = [
    {
        citizenId: userId,
        title: 'Water Leakage',
        description: 'Severe pipe leakage on Main St.',
        category: 'Water',
        location: 'Sector 4, Main Street',
        status: 'In Progress',
        priority: 'High'
    },
    {
        citizenId: userId,
        title: 'Streetlight Broken',
        description: 'Streetlight #45 is flickering.',
        category: 'Electricity',
        location: 'Park Avenue',
        status: 'Pending',
        priority: 'Medium'
    },
    {
        citizenId: userId,
        title: 'Garbage Dump',
        description: 'Garbage not collected for 3 days.',
        category: 'Waste Management',
        location: 'Block C, Market',
        status: 'Resolved',
        resolvedAt: new Date(),
        priority: 'High'
    }
];

const serviceRequestsData = [
    {
        citizenId: userId,
        serviceType: 'New Water Connection',
        details: { address: 'Flat 302, Green Valley' },
        status: 'Pending'
    },
    {
        citizenId: userId,
        serviceType: 'Birth Certificate',
        details: { name: 'Child Name' },
        status: 'Completed'
    }
];

const notificationsData = [
    {
        userId: userId,
        message: 'Your complaint #1234 has been resolved.',
        type: 'Success',
        isRead: false
    },
    {
        userId: userId,
        message: 'Water supply maintenance scheduled for tomorrow.',
        type: 'Info',
        isRead: true
    },
    {
        userId: userId,
        message: 'Service Request #9988 is under review.',
        type: 'Info',
        isRead: false
    }
];

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedHealthcare() {
    if (!Department || !Doctor) {
        console.log('⏭️  Skipping Healthcare: Models not available');
        return { departments: 0, doctors: 0 };
    }

    const HEALTHCARE_URI = process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare';

    console.log('\n🏥 Seeding Healthcare Service...');
    const conn = await mongoose.createConnection(HEALTHCARE_URI);

    // Register models on this connection
    const DeptModel = conn.model('Department', Department.schema);
    const DocModel = conn.model('Doctor', Doctor.schema);

    // Clear existing data
    await DeptModel.deleteMany({});
    await DocModel.deleteMany({});

    // Seed Departments
    const createdDepartments = await DeptModel.insertMany(departmentsData);
    console.log(`   ✅ Created ${createdDepartments.length} departments`);

    // Generate Doctors for each department
    const doctorsData = [];
    const firstNames = ['Dr. Rajesh', 'Dr. Priya', 'Dr. Arun', 'Dr. Meera', 'Dr. Suresh', 'Dr. Anita'];
    const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Nair', 'Patel', 'Gupta'];
    const qualifications = ['MBBS, MD', 'MBBS, MS', 'MBBS, DM', 'MBBS, DNB'];

    createdDepartments.forEach((dept, deptIndex) => {
        for (let i = 0; i < 2; i++) {
            const firstName = firstNames[(deptIndex + i) % firstNames.length];
            const lastName = lastNames[(deptIndex + i + 1) % lastNames.length];
            doctorsData.push({
                name: `${firstName} ${lastName}`,
                email: `${firstName.replace('Dr. ', '').toLowerCase()}.${lastName.toLowerCase()}${deptIndex}${i}@hospital.gov.in`,
                phone: `+91-9800${100000 + deptIndex * 10 + i}`,
                department: dept._id,
                specialization: dept.name,
                qualification: qualifications[(deptIndex + i) % qualifications.length],
                experience: 5 + (deptIndex * 2) + i,
                consultationFee: 300 + (deptIndex * 100),
                bio: `Experienced ${dept.name} specialist with ${5 + (deptIndex * 2) + i} years of practice.`,
                availability: {
                    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    startTime: '09:00',
                    endTime: '17:00',
                    slotDuration: 30
                },
                rating: 4.0 + parseFloat((Math.random() * 1).toFixed(1)),
                totalReviews: Math.floor(Math.random() * 100) + 10,
                isActive: true
            });
        }
    });

    const createdDoctors = await DocModel.insertMany(doctorsData);
    console.log(`   ✅ Created ${createdDoctors.length} doctors`);

    await conn.close();
    return { departments: createdDepartments.length, doctors: createdDoctors.length };
}

async function seedUrban() {
    if (!Complaint || !ServiceRequest || !Notification) {
        console.log('⏭️  Skipping Urban: Models not available');
        return { complaints: 0, requests: 0, notifications: 0 };
    }

    const URBAN_URI = process.env.URBAN_MONGO_URI || 'mongodb://localhost:27017/sdp_urban';

    console.log('\n🏙️  Seeding Urban Service...');
    const conn = await mongoose.createConnection(URBAN_URI);

    // Register models on this connection
    const ComplaintModel = conn.model('Complaint', Complaint.schema);
    const RequestModel = conn.model('ServiceRequest', ServiceRequest.schema);
    const NotificationModel = conn.model('Notification', Notification.schema);

    // Clear existing data
    await ComplaintModel.deleteMany({});
    await RequestModel.deleteMany({});
    await NotificationModel.deleteMany({});

    // Seed data
    const createdComplaints = await ComplaintModel.insertMany(complaintsData);
    console.log(`   ✅ Created ${createdComplaints.length} complaints`);

    const createdRequests = await RequestModel.insertMany(serviceRequestsData);
    console.log(`   ✅ Created ${createdRequests.length} service requests`);

    const createdNotifications = await NotificationModel.insertMany(notificationsData);
    console.log(`   ✅ Created ${createdNotifications.length} notifications`);

    await conn.close();
    return {
        complaints: createdComplaints.length,
        requests: createdRequests.length,
        notifications: createdNotifications.length
    };
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    const args = process.argv.slice(2);
    const service = args[0]?.toLowerCase();

    console.log('🌱 Service Delivery Platform - Database Seeder');
    console.log('================================================');

    try {
        let healthcareResults = { departments: 0, doctors: 0 };
        let urbanResults = { complaints: 0, requests: 0, notifications: 0 };

        if (!service || service === 'healthcare') {
            healthcareResults = await seedHealthcare();
        }

        if (!service || service === 'urban') {
            urbanResults = await seedUrban();
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('================================');
        if (healthcareResults.departments > 0) {
            console.log(`Healthcare: ${healthcareResults.departments} departments, ${healthcareResults.doctors} doctors`);
        }
        if (urbanResults.complaints > 0) {
            console.log(`Urban: ${urbanResults.complaints} complaints, ${urbanResults.requests} requests, ${urbanResults.notifications} notifications`);
        }
        console.log('================================');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
