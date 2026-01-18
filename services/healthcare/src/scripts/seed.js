/**
 * Seed Script - Populate database with demo data
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Department, Doctor, Patient, Appointment } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdp_healthcare';

// Demo departments
const departments = [
    {
        name: 'General Medicine',
        code: 'GEN',
        description: 'Primary care and general health consultations',
        icon: 'stethoscope',
        location: { building: 'Main Building', floor: 'Ground Floor', room: 'G-101' }
    },
    {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system specialists',
        icon: 'heart',
        location: { building: 'Main Building', floor: '1st Floor', room: '1-201' }
    },
    {
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bones, joints, and musculoskeletal system',
        icon: 'bone',
        location: { building: 'Main Building', floor: '1st Floor', room: '1-301' }
    },
    {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Medical care for infants, children, and adolescents',
        icon: 'baby',
        location: { building: 'Main Building', floor: 'Ground Floor', room: 'G-201' }
    },
    {
        name: 'Dermatology',
        code: 'DERM',
        description: 'Skin, hair, and nail conditions',
        icon: 'user',
        location: { building: 'Main Building', floor: '2nd Floor', room: '2-101' }
    },
    {
        name: 'ENT',
        code: 'ENT',
        description: 'Ear, nose, and throat specialists',
        icon: 'ear',
        location: { building: 'Main Building', floor: '2nd Floor', room: '2-201' }
    }
];

// Demo doctors
const getDoctors = (deptMap) => [
    {
        name: 'Dr. Rajesh Kumar',
        email: 'dr.rajesh@hospital.gov.in',
        phone: '9876543210',
        department: deptMap['GEN'],
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experience: 15,
        consultationFee: 300,
        bio: 'Experienced general physician with expertise in preventive medicine.',
        availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30
        },
        rating: 4.5,
        totalReviews: 120
    },
    {
        name: 'Dr. Priya Sharma',
        email: 'dr.priya@hospital.gov.in',
        phone: '9876543211',
        department: deptMap['CARD'],
        specialization: 'Cardiologist',
        qualification: 'MBBS, DM Cardiology',
        experience: 12,
        consultationFee: 800,
        bio: 'Specialist in interventional cardiology and heart failure management.',
        availability: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '10:00',
            endTime: '16:00',
            slotDuration: 30
        },
        rating: 4.8,
        totalReviews: 85
    },
    {
        name: 'Dr. Amit Patel',
        email: 'dr.amit@hospital.gov.in',
        phone: '9876543212',
        department: deptMap['ORTHO'],
        specialization: 'Orthopedic Surgeon',
        qualification: 'MBBS, MS Orthopedics',
        experience: 10,
        consultationFee: 600,
        bio: 'Expert in joint replacement and sports injuries.',
        availability: {
            days: ['Tuesday', 'Thursday', 'Saturday'],
            startTime: '09:00',
            endTime: '14:00',
            slotDuration: 30
        },
        rating: 4.6,
        totalReviews: 95
    },
    {
        name: 'Dr. Sunita Gupta',
        email: 'dr.sunita@hospital.gov.in',
        phone: '9876543213',
        department: deptMap['PED'],
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD Pediatrics',
        experience: 18,
        consultationFee: 400,
        bio: 'Caring pediatrician with expertise in child development and nutrition.',
        availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            startTime: '08:00',
            endTime: '13:00',
            slotDuration: 20
        },
        rating: 4.9,
        totalReviews: 200
    },
    {
        name: 'Dr. Mohammed Ali',
        email: 'dr.mohammed@hospital.gov.in',
        phone: '9876543214',
        department: deptMap['DERM'],
        specialization: 'Dermatologist',
        qualification: 'MBBS, DVD',
        experience: 8,
        consultationFee: 500,
        bio: 'Specialist in cosmetic dermatology and skin disorders.',
        availability: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '11:00',
            endTime: '18:00',
            slotDuration: 20
        },
        rating: 4.4,
        totalReviews: 65
    },
    {
        name: 'Dr. Lakshmi Menon',
        email: 'dr.lakshmi@hospital.gov.in',
        phone: '9876543215',
        department: deptMap['ENT'],
        specialization: 'ENT Surgeon',
        qualification: 'MBBS, MS ENT',
        experience: 14,
        consultationFee: 550,
        bio: 'Expert in sinus surgeries and hearing disorders.',
        availability: {
            days: ['Tuesday', 'Thursday', 'Saturday'],
            startTime: '10:00',
            endTime: '16:00',
            slotDuration: 30
        },
        rating: 4.7,
        totalReviews: 78
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // Clear existing data
        console.log('Clearing existing data...');
        await Department.deleteMany({});
        await Doctor.deleteMany({});
        // Keep patients and appointments - they may have real user data

        // Seed departments
        console.log('Seeding departments...');
        const createdDepts = await Department.insertMany(departments);
        console.log(`Created ${createdDepts.length} departments`);

        // Create department code to ID map
        const deptMap = {};
        createdDepts.forEach(dept => {
            deptMap[dept.code] = dept._id;
        });

        // Seed doctors
        console.log('Seeding doctors...');
        const doctorData = getDoctors(deptMap);
        const createdDocs = await Doctor.insertMany(doctorData);
        console.log(`Created ${createdDocs.length} doctors`);

        console.log('\n✅ Seed completed successfully!');
        console.log('\nSummary:');
        console.log(`- Departments: ${createdDepts.length}`);
        console.log(`- Doctors: ${createdDocs.length}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
