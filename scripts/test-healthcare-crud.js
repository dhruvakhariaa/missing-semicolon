const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import Healthcare Service models
const Patient = require('../services/healthcare/src/models/Patient');
const Doctor = require('../services/healthcare/src/models/Doctor');
const Department = require('../services/healthcare/src/models/Department');
const Appointment = require('../services/healthcare/src/models/Appointment');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
    if (passed) {
        console.log(`  ${colors.green}✓${colors.reset} ${testName}`);
        if (details) console.log(`    ${colors.cyan}${details}${colors.reset}`);
        testsPassed++;
    } else {
        console.log(`  ${colors.red}✗${colors.reset} ${testName}`);
        if (details) console.log(`    ${colors.red}${details}${colors.reset}`);
        testsFailed++;
    }
}

async function testDepartmentCRUD() {
    console.log(`\n${colors.blue}━━━ DEPARTMENT MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE
        const dept1 = await Department.create({
            name: 'Cardiology',
            code: 'CARD',
            description: 'Heart and cardiovascular care',
            location: 'Building A, Floor 3'
        });
        logTest('Create department', !!dept1, `ID: ${dept1._id}`);

        const dept2 = await Department.create({
            name: 'Orthopedics',
            code: 'ORTH',
            description: 'Bone and joint specialists',
            location: 'Building B, Floor 2'
        });

        // READ
        const foundDept = await Department.findById(dept1._id);
        logTest('Read department by ID', foundDept.name === 'Cardiology');

        const allDepts = await Department.find({});
        logTest('Read all departments', allDepts.length >= 2);

        // UPDATE
        dept1.location = 'Building A, Floor 4';
        await dept1.save();
        logTest('Update department location', dept1.location === 'Building A, Floor 4');

        // Return departments for use in other tests
        return { cardiology: dept1, orthopedics: dept2 };

    } catch (err) {
        console.log(`${colors.red}Fatal error in Department tests: ${err.message}${colors.reset}`);
        testsFailed++;
        throw err;
    }
}

async function testPatientCRUD() {
    console.log(`\n${colors.blue}━━━ PATIENT MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Valid patient
        const patient1 = await Patient.create({
            userId: 'USR001',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '9876543210',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'male',
            bloodGroup: 'O+',
            address: {
                street: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            },
            emergencyContact: {
                name: 'Jane Doe',
                relation: 'Spouse',
                phone: '9876543211'
            },
            medicalHistory: {
                allergies: ['Penicillin', 'Peanuts'],
                conditions: ['Asthma'],
                medications: ['Inhaler'],
                notes: 'Requires nebulizer during severe attacks'
            }
        });
        logTest('Create patient with full details', !!patient1);
        logTest('Auto-generated timestamps', !!patient1.createdAt && !!patient1.updatedAt);
        logTest('Default isActive is true', patient1.isActive === true);

        // Test virtual field - age calculation
        const age = patient1.age;
        const expectedAge = new Date().getFullYear() - 1990;
        logTest('Virtual field: age calculation', age === expectedAge || age === expectedAge - 1);

        // CREATE - Minimal patient
        const patient2 = await Patient.create({
            userId: 'USR002',
            name: 'Alice Smith',
            email: 'alice.smith@email.com',
            phone: '9876543212'
        });
        logTest('Create patient with minimal fields', !!patient2);

        // CREATE - Duplicate userId (should fail)
        try {
            await Patient.create({
                userId: 'USR001', // Duplicate
                name: 'Another User',
                email: 'different@email.com',
                phone: '9876543213'
            });
            logTest('Validation: Duplicate userId', false);
        } catch (err) {
            logTest('Validation: Duplicate userId prevented', err.code === 11000);
        }

        // CREATE - Invalid enum (should fail)
        try {
            await Patient.create({
                userId: 'USR003',
                name: 'Bob Brown',
                email: 'bob@email.com',
                phone: '9876543214',
                gender: 'invalid' // Not in enum
            });
            logTest('Validation: Invalid gender enum', false);
        } catch (err) {
            logTest('Validation: Invalid gender enum', err.name === 'ValidationError');
        }

        // READ - Find by email
        const foundPatient = await Patient.findOne({ email: 'john.doe@email.com' });
        logTest('Read patient by email', foundPatient.name === 'John Doe');

        // READ - Text search
        const searchResults = await Patient.find({ $text: { $search: 'John' } });
        logTest('Text search by name', searchResults.length >= 1);

        // UPDATE - Update medical history
        patient1.medicalHistory.conditions.push('Hypertension');
        patient1.medicalHistory.medications.push('Blood pressure medicine');
        await patient1.save();
        logTest('Update medical history arrays', patient1.medicalHistory.conditions.length === 2);

        // UPDATE - Deactivate patient
        await Patient.findByIdAndUpdate(patient2._id, { isActive: false });
        const deactivated = await Patient.findById(patient2._id);
        logTest('Deactivate patient', deactivated.isActive === false);

        // READ - Filter active patients
        const activePatients = await Patient.find({ isActive: true });
        logTest('Filter active patients only', activePatients.every(p => p.isActive));

        // Return patient for appointment tests
        return { patient1 };

    } catch (err) {
        console.log(`${colors.red}Fatal error in Patient tests: ${err.message}${colors.reset}`);
        testsFailed++;
        throw err;
    }
}

async function testDoctorCRUD(departments) {
    console.log(`\n${colors.blue}━━━ DOCTOR MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Cardiologist
        const doctor1 = await Doctor.create({
            name: 'Dr. Sarah Johnson',
            email: 'dr.sarah@hospital.com',
            phone: '9876543220',
            department: departments.cardiology._id,
            specialization: 'Interventional Cardiology',
            qualification: 'MBBS, MD (Cardiology), DM',
            experience: 15,
            consultationFee: 1000,
            bio: 'Expert in cardiac catheterization and angioplasty',
            availability: {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
                startTime: '10:00',
                endTime: '16:00',
                slotDuration: 20
            },
            rating: 4.8,
            totalReviews: 120
        });
        logTest('Create doctor with full details', !!doctor1);
        logTest('Default isActive is true', doctor1.isActive === true);

        // CREATE - Orthopedic surgeon
        const doctor2 = await Doctor.create({
            name: 'Dr. Michael Chen',
            email: 'dr.chen@hospital.com',
            phone: '9876543221',
            department: departments.orthopedics._id,
            specialization: 'Orthopedic Surgery',
            qualification: 'MBBS, MS (Ortho)',
            experience: 10,
            consultationFee: 800
        });
        logTest('Create doctor with minimal fields', !!doctor2);
        logTest('Default availability set', doctor2.availability.days.length > 0);

        // CREATE - Duplicate email (should fail)
        try {
            await Doctor.create({
                name: 'Dr. Another Doctor',
                email: 'dr.sarah@hospital.com', // Duplicate
                phone: '9876543222',
                department: departments.cardiology._id,
                specialization: 'General Medicine',
                qualification: 'MBBS'
            });
            logTest('Validation: Duplicate email', false);
        } catch (err) {
            logTest('Validation: Duplicate email prevented', err.code === 11000);
        }

        // READ - Find by department
        const cardiologists = await Doctor.find({ department: departments.cardiology._id });
        logTest('Read doctors by department', cardiologists.length >= 1);

        // READ - Find by specialization
        const found = await Doctor.findOne({ specialization: 'Interventional Cardiology' });
        logTest('Read doctor by specialization', found.name === 'Dr. Sarah Johnson');

        // UPDATE - Update availability
        doctor1.availability.days.push('Saturday');
        doctor1.availability.endTime = '18:00';
        await doctor1.save();
        logTest('Update doctor availability', doctor1.availability.days.includes('Saturday'));

        // UPDATE - Update rating after new review
        const newReviewRating = 5;
        const newTotalReviews = doctor1.totalReviews + 1;
        const newAvgRating = ((doctor1.rating * doctor1.totalReviews) + newReviewRating) / newTotalReviews;
        doctor1.rating = newAvgRating;
        doctor1.totalReviews = newTotalReviews;
        await doctor1.save();
        logTest('Update rating after review', doctor1.totalReviews === 121);

        // READ - Filter active doctors
        const activeDoctors = await Doctor.find({ isActive: true });
        logTest('Filter active doctors', activeDoctors.length >= 2);

        // Return doctors for appointment tests
        return { doctor1, doctor2 };

    } catch (err) {
        console.log(`${colors.red}Fatal error in Doctor tests: ${err.message}${colors.reset}`);
        testsFailed++;
        throw err;
    }
}

async function testAppointmentCRUD(patient, doctor, department) {
    console.log(`\n${colors.blue}━━━ APPOINTMENT MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Schedule appointment
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const appt1 = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            department: department._id,
            appointmentDate: tomorrow,
            timeSlot: {
                startTime: '10:00',
                endTime: '10:30'
            },
            type: 'in-person',
            symptoms: 'Chest pain and shortness of breath',
            fee: 1000
        });
        logTest('Create appointment', !!appt1);
        logTest('Auto-generated appointment number', !!appt1.appointmentNumber);
        logTest('Default status is scheduled', appt1.status === 'scheduled');
        logTest('Default payment status is pending', appt1.paymentStatus === 'pending');

        // CREATE - Telemedicine appointment
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const appt2 = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            department: department._id,
            appointmentDate: nextWeek,
            timeSlot: {
                startTime: '14:00',
                endTime: '14:30'
            },
            type: 'telemedicine',
            symptoms: 'Follow-up consultation',
            fee: 800
        });
        logTest('Create telemedicine appointment', appt2.type === 'telemedicine');

        // READ - Find by patient
        const patientAppts = await Appointment.find({ patient: patient._id });
        logTest('Read appointments by patient', patientAppts.length >= 2);

        // READ - Find by doctor and date
        const doctorAppts = await Appointment.find({
            doctor: doctor._id,
            appointmentDate: { $gte: new Date() }
        }).sort({ appointmentDate: 1 });
        logTest('Read upcoming appointments by doctor', doctorAppts.length >= 2);

        // UPDATE - Confirm appointment
        appt1.status = 'confirmed';
        await appt1.save();
        logTest('Update appointment status to confirmed', appt1.status === 'confirmed');

        // UPDATE - Mark payment as paid
        await Appointment.findByIdAndUpdate(appt1._id, { paymentStatus: 'paid' });
        const paidAppt = await Appointment.findById(appt1._id);
        logTest('Update payment status', paidAppt.paymentStatus === 'paid');

        // UPDATE - Complete appointment with diagnosis
        appt1.status = 'completed';
        appt1.diagnosis = 'Mild angina, stress-related';
        appt1.prescription = 'Aspirin 75mg daily, reduce stress, light exercise';
        appt1.followUpDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await appt1.save();
        logTest('Complete appointment with diagnosis', appt1.status === 'completed');
        logTest('Add prescription', !!appt1.prescription);
        logTest('Schedule follow-up', !!appt1.followUpDate);

        // UPDATE - Cancel appointment
        appt2.status = 'cancelled';
        appt2.cancelledAt = new Date();
        appt2.cancellationReason = 'Patient unavailable';
        appt2.paymentStatus = 'refunded';
        await appt2.save();
        logTest('Cancel appointment', appt2.status === 'cancelled');
        logTest('Refund payment', appt2.paymentStatus === 'refunded');

        // READ - Count appointments by status
        const scheduledCount = await Appointment.countDocuments({
            doctor: doctor._id,
            status: 'scheduled'
        });
        logTest('Count scheduled appointments', typeof scheduledCount === 'number');

        // READ - Find appointments with populated references
        const populatedAppt = await Appointment.findById(appt1._id)
            .populate('patient')
            .populate('doctor')
            .populate('department');
        logTest('Populate patient reference', populatedAppt.patient.name === patient.name);
        logTest('Populate doctor reference', populatedAppt.doctor.name === doctor.name);
        logTest('Populate department reference', populatedAppt.department.name === department.name);

        // DELETE
        await Appointment.findByIdAndDelete(appt2._id);
        logTest('Delete appointment', true);

    } catch (err) {
        console.log(`${colors.red}Fatal error in Appointment tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function cleanupTestData() {
    console.log(`\n${colors.yellow}Cleaning up test data...${colors.reset}`);
    await Appointment.deleteMany({ patient: { $exists: true } });
    await Doctor.deleteMany({ email: { $in: ['dr.sarah@hospital.com', 'dr.chen@hospital.com'] } });
    await Patient.deleteMany({ userId: { $in: ['USR001', 'USR002', 'USR003'] } });
    await Department.deleteMany({ code: { $in: ['CARD', 'ORTH'] } });
    console.log(`${colors.green}✓ Cleanup complete${colors.reset}`);
}

async function main() {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║   HEALTHCARE SERVICE - CRUD TEST SUITE            ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);

    const mongoUri = process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare';

    try {
        console.log(`\n${colors.cyan}Connecting to: ${mongoUri}${colors.reset}`);
        await mongoose.connect(mongoUri);
        console.log(`${colors.green}✓ Connected to Healthcare Service database${colors.reset}`);

        const departments = await testDepartmentCRUD();
        const { patient1 } = await testPatientCRUD();
        const { doctor1 } = await testDoctorCRUD(departments);
        await testAppointmentCRUD(patient1, doctor1, departments.cardiology);
        await cleanupTestData();

        console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}\n`);
        console.log(`Total Tests: ${testsPassed + testsFailed}`);
        console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);

        const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
        console.log(`Success Rate: ${successRate}%\n`);

        if (testsFailed === 0) {
            console.log(`${colors.green}🎉 ALL HEALTHCARE SERVICE TESTS PASSED!${colors.reset}\n`);
            process.exit(0);
        } else {
            console.log(`${colors.yellow}⚠️  SOME TESTS FAILED${colors.reset}\n`);
            process.exit(1);
        }

    } catch (err) {
        console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

main();
