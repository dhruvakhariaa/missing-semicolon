/**
 * Seed Script for Healthcare Database
 * Run from project root: node scripts/seed-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Department = require('../services/healthcare/src/models/Department');
const Doctor = require('../services/healthcare/src/models/Doctor');

// MongoDB connection string (from docker-compose or local)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

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

const seedDatabase = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await Department.deleteMany({});
        await Doctor.deleteMany({});

        // Seed Departments
        console.log('📂 Seeding Departments...');
        const createdDepartments = await Department.insertMany(departmentsData);
        console.log(`✅ Created ${createdDepartments.length} departments`);

        // Generate Doctors for each department
        console.log('👨‍⚕️ Seeding Doctors...');
        const doctorsData = [];
        const firstNames = ['Dr. Rajesh', 'Dr. Priya', 'Dr. Arun', 'Dr. Meera', 'Dr. Suresh', 'Dr. Anita'];
        const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Nair', 'Patel', 'Gupta'];
        const qualifications = ['MBBS, MD', 'MBBS, MS', 'MBBS, DM', 'MBBS, DNB'];

        createdDepartments.forEach((dept, deptIndex) => {
            // Create 2 doctors per department
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
                    rating: 4.0 + (Math.random() * 1).toFixed(1) * 1,
                    totalReviews: Math.floor(Math.random() * 100) + 10,
                    isActive: true
                });
            }
        });

        const createdDoctors = await Doctor.insertMany(doctorsData);
        console.log(`✅ Created ${createdDoctors.length} doctors`);

        console.log('\n🎉 Seed completed successfully!');
        console.log('------------------------');
        console.log(`Departments: ${createdDepartments.length}`);
        console.log(`Doctors: ${createdDoctors.length}`);
        console.log('------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
