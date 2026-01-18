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
// AGRICULTURE SERVICE DATA & MODELS
// ============================================
let Farmer, Scheme, Advisory;
try {
    Farmer = require('../services/agriculture/src/models/Farmer');
    Scheme = require('../services/agriculture/src/models/Scheme');
    Advisory = require('../services/agriculture/src/models/Advisory');
} catch (e) {
    console.log('⚠️  Agriculture models not found, skipping agriculture seed');
}

const farmersData = [
    {
        name: 'Ramesh Patil',
        phone: '9876000001',
        aadharNumber: '1234-5678-9001',
        village: 'Khandala',
        taluka: 'Maval',
        district: 'Pune',
        state: 'Maharashtra',
        landParcels: [
            {
                surveyNumber: 'S-123/A',
                area: 5.5,
                village: 'Khandala',
                irrigationType: 'Drip',
                currentCrop: 'Wheat',
                sowingDate: new Date('2024-11-01'),
                soilDetails: { ph: 6.8, nitrogen: 280, phosphorus: 25, potassium: 210, organicCarbon: 0.75, lastTested: new Date('2024-10-15') }
            },
            {
                surveyNumber: 'S-123/B',
                area: 3.2,
                village: 'Khandala',
                irrigationType: 'Rainfed',
                currentCrop: 'Jowar',
                sowingDate: new Date('2024-06-20')
            }
        ],
        enrolledSchemes: [
            { schemeName: 'PM-KISAN', status: 'Approved', applicationId: 'PMK-2024-00123', category: 'Direct Benefit', landArea: 8.7, bankAccount: 'XXXX-1234' }
        ]
    },
    {
        name: 'Sunita Deshmukh',
        phone: '9876000002',
        aadharNumber: '2345-6789-0012',
        village: 'Lonavala',
        taluka: 'Maval',
        district: 'Pune',
        state: 'Maharashtra',
        landParcels: [
            {
                surveyNumber: 'S-456/A',
                area: 4.0,
                village: 'Lonavala',
                irrigationType: 'Sprinkler',
                currentCrop: 'Rice',
                sowingDate: new Date('2024-07-01')
            }
        ],
        enrolledSchemes: [
            { schemeName: 'Crop Insurance', status: 'Applied', applicationId: 'CIS-2024-00456', category: 'Insurance', landArea: 4.0 }
        ]
    },
    {
        name: 'Ganesh Jadhav',
        phone: '9876000003',
        aadharNumber: '3456-7890-1234',
        village: 'Satara',
        taluka: 'Satara',
        district: 'Satara',
        state: 'Maharashtra',
        landParcels: [
            {
                surveyNumber: 'S-789/A',
                area: 12.0,
                village: 'Satara',
                irrigationType: 'Irrigated',
                currentCrop: 'Sugarcane',
                sowingDate: new Date('2024-02-15')
            },
            {
                surveyNumber: 'S-789/B',
                area: 8.0,
                village: 'Satara',
                irrigationType: 'Drip',
                currentCrop: 'Grapes',
                sowingDate: new Date('2023-06-01')
            }
        ],
        enrolledSchemes: [
            { schemeName: 'PM-KISAN', status: 'Approved', applicationId: 'PMK-2024-00789', category: 'Direct Benefit', landArea: 20.0, bankAccount: 'XXXX-5678' },
            { schemeName: 'Drip Irrigation Subsidy', status: 'Approved', applicationId: 'DIS-2024-00123', category: 'Subsidy', landArea: 8.0 }
        ]
    },
    {
        name: 'Laxmi Bhosale',
        phone: '9876000004',
        aadharNumber: '4567-8901-2345',
        village: 'Nashik',
        taluka: 'Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        landParcels: [
            {
                surveyNumber: 'S-101/A',
                area: 6.5,
                village: 'Nashik',
                irrigationType: 'Drip',
                currentCrop: 'Onion',
                sowingDate: new Date('2024-10-01'),
                soilDetails: { ph: 7.2, nitrogen: 320, phosphorus: 30, potassium: 250, organicCarbon: 0.85, lastTested: new Date('2024-09-20') }
            }
        ]
    }
];

const schemesData = [
    {
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Direct income support of ₹6000 per year to all landholding farmer families in three equal installments',
        eligibility: 'All landholding farmer families with cultivable land',
        benefits: '₹2000 per installment, 3 times a year, directly transferred to bank account',
        isActive: true
    },
    {
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Crop insurance scheme providing financial support to farmers in case of crop failure',
        eligibility: 'All farmers growing notified crops in notified areas',
        benefits: 'Insurance coverage for crop loss due to natural calamities, pests, and diseases',
        isActive: true
    },
    {
        name: 'Soil Health Card Scheme',
        description: 'Provides soil health cards to farmers for nutrient management and improving soil fertility',
        eligibility: 'All farmers',
        benefits: 'Free soil testing, health card with fertilizer recommendations, improved yield',
        isActive: true
    },
    {
        name: 'Kisan Credit Card (KCC)',
        description: 'Credit facility for farmers to meet agricultural and allied activities expenses',
        eligibility: 'Farmers, fishermen, and animal husbandry farmers',
        benefits: 'Low interest loans up to ₹3 lakh at 4% interest with timely repayment',
        isActive: true
    },
    {
        name: 'Drip Irrigation Subsidy Scheme',
        description: 'Subsidy for installing drip irrigation systems to promote water conservation',
        eligibility: 'Farmers with land parcels suitable for drip irrigation',
        benefits: '50-90% subsidy on drip irrigation equipment based on category',
        isActive: true
    }
];

const advisoriesData = [
    {
        crop: 'Wheat',
        stage: 'Tillering',
        advice: 'Apply first dose of nitrogen (urea @50kg/acre). Monitor for aphid infestation. Ensure adequate soil moisture.',
        type: 'Fertilizer',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
        crop: 'Rice',
        stage: 'Panicle Initiation',
        advice: 'Apply second split of nitrogen. Maintain 5cm water level in field. Watch for stem borer.',
        type: 'Fertilizer',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    {
        crop: 'Cotton',
        stage: 'Flowering',
        advice: 'Heavy rainfall expected next week. Postpone pesticide application. Ensure proper drainage.',
        type: 'Weather',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
        crop: 'Onion',
        stage: 'Bulb Formation',
        advice: 'Purple blotch disease alert. Spray Mancozeb @2.5g/litre at 10-day intervals. Reduce irrigation frequency.',
        type: 'Disease',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    },
    {
        crop: 'Sugarcane',
        stage: 'Grand Growth',
        advice: 'Apply potash fertilizer for improved sucrose content. Maintain regular irrigation. Earthing up recommended.',
        type: 'Fertilizer',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

async function seedAgriculture() {
    if (!Farmer || !Scheme || !Advisory) {
        console.log('⏭️  Skipping Agriculture: Models not available');
        return { farmers: 0, schemes: 0, advisories: 0 };
    }

    const AGRICULTURE_URI = process.env.AGRICULTURE_MONGO_URI || 'mongodb://localhost:27017/sdp_agriculture';

    console.log('\n🌾 Seeding Agriculture Service...');
    const conn = await mongoose.createConnection(AGRICULTURE_URI);

    // Register models on this connection
    const FarmerModel = conn.model('Farmer', Farmer.schema);
    const SchemeModel = conn.model('Scheme', Scheme.schema);
    const AdvisoryModel = conn.model('Advisory', Advisory.schema);

    // Clear existing data
    await FarmerModel.deleteMany({});
    await SchemeModel.deleteMany({});
    await AdvisoryModel.deleteMany({});

    // Seed data
    const createdFarmers = await FarmerModel.insertMany(farmersData);
    console.log(`   ✅ Created ${createdFarmers.length} farmers`);

    const createdSchemes = await SchemeModel.insertMany(schemesData);
    console.log(`   ✅ Created ${createdSchemes.length} schemes`);

    const createdAdvisories = await AdvisoryModel.insertMany(advisoriesData);
    console.log(`   ✅ Created ${createdAdvisories.length} advisories`);

    await conn.close();
    return {
        farmers: createdFarmers.length,
        schemes: createdSchemes.length,
        advisories: createdAdvisories.length
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
    console.log('Usage: node scripts/seed-data.js [service]');
    console.log('  Services: healthcare, urban, agriculture, or leave empty for all\n');

    try {
        let healthcareResults = { departments: 0, doctors: 0 };
        let urbanResults = { complaints: 0, requests: 0, notifications: 0 };
        let agricultureResults = { farmers: 0, schemes: 0, advisories: 0 };

        if (!service || service === 'healthcare') {
            healthcareResults = await seedHealthcare();
        }

        if (!service || service === 'urban') {
            urbanResults = await seedUrban();
        }

        if (!service || service === 'agriculture') {
            agricultureResults = await seedAgriculture();
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('================================');
        if (healthcareResults.departments > 0) {
            console.log(`🏥 Healthcare: ${healthcareResults.departments} departments, ${healthcareResults.doctors} doctors`);
        }
        if (urbanResults.complaints > 0) {
            console.log(`🏙️  Urban: ${urbanResults.complaints} complaints, ${urbanResults.requests} requests, ${urbanResults.notifications} notifications`);
        }
        if (agricultureResults.farmers > 0) {
            console.log(`🌾 Agriculture: ${agricultureResults.farmers} farmers, ${agricultureResults.schemes} schemes, ${agricultureResults.advisories} advisories`);
        }
        console.log('================================');
        console.log('\n📊 View your data in MongoDB Compass:');
        console.log('   Connect to: mongodb://localhost:27017');
        console.log('   Databases: sdp_healthcare, sdp_urban, sdp_agriculture');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();

