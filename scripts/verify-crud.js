const mongoose = require('mongoose');
const axios = require('axios'); // We might need this later for API tests, but for now direct DB
// Models
// We need to robustly load models. Since we are in scripts/, we need to point to services/.../src/models
// But we might need to handle missing dependencies if we just require them.
// A better approach for CRUD verification WITHOUT relying on the API Gateway (which introduces another layer of failure)
// is to directly use Mongoose models to verify Schema compliance and DB operations.

// Helper to load model safely
function loadModel(path) {
    try {
        return require(path);
    } catch (e) {
        console.error(`Error loading model at ${path}:`, e.message);
        return null;
    }
}

async function verifyUrbanCRUD() {
    console.log('\n TESTING URBAN SERVICE CRUD...');
    const URI = process.env.URBAN_MONGO_URI || 'mongodb://localhost:27017/sdp_urban';
    const conn = await mongoose.createConnection(URI).asPromise();

    try {
        const Complaint = conn.model('Complaint', loadModel('../services/urban/src/models/Complaint').schema);

        // 1. CREATE
        const newComplaint = await Complaint.create({
            citizenId: 'test-citizen-001',
            title: 'Test Complaint',
            description: 'This is a test complaint for CRUD verification',
            category: 'Water',
            location: 'Test Location',
            priority: 'Medium'
        });
        console.log('   ✅ CREATE Complaint: Success', newComplaint._id);

        // 2. READ
        const foundComplaint = await Complaint.findById(newComplaint._id);
        if (foundComplaint.title === 'Test Complaint') {
            console.log('   ✅ READ Complaint: Success');
        } else {
            throw new Error('Read failed - data mismatch');
        }

        // 3. UPDATE
        foundComplaint.status = 'In Progress';
        await foundComplaint.save();
        console.log('   ✅ UPDATE Complaint: Success');

        // 4. DELETE
        await Complaint.findByIdAndDelete(newComplaint._id);
        const deleted = await Complaint.findById(newComplaint._id);
        if (!deleted) {
            console.log('   ✅ DELETE Complaint: Success');
        } else {
            throw new Error('Delete failed');
        }

    } catch (e) {
        console.error('   ❌ Urban CRUD Failed:', e.message);
    } finally {
        await conn.close();
    }
}

async function verifyHealthcareCRUD() {
    console.log('\n🏥 TESTING HEALTHCARE SERVICE CRUD...');
    const URI = process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare';
    const conn = await mongoose.createConnection(URI).asPromise();

    try {
        const Department = conn.model('Department', loadModel('../services/healthcare/src/models/Department').schema);

        // 1. CREATE
        const newDept = await Department.create({
            name: 'Testology',
            code: 'TEST',
            description: 'Testing Department',
            location: { building: 'T', floor: '1' }
        });
        console.log('   ✅ CREATE Department: Success', newDept._id);

        // 2. READ
        const found = await Department.findOne({ code: 'TEST' });
        if (found) console.log('   ✅ READ Department: Success');

        // 3. DELETE
        await Department.findByIdAndDelete(newDept._id);
        console.log('   ✅ DELETE Department: Success');

    } catch (e) {
        console.error('   ❌ Healthcare CRUD Failed:', e.message);
    } finally {
        await conn.close();
    }
}

async function verifyAgricultureCRUD() {
    console.log('\n🌾 TESTING AGRICULTURE SERVICE CRUD...');
    const URI = process.env.AGRICULTURE_MONGO_URI || 'mongodb://localhost:27017/agriculture_db';
    const conn = await mongoose.createConnection(URI).asPromise();

    try {
        const Farmer = conn.model('Farmer', loadModel('../services/agriculture/src/models/Farmer').schema);

        // 1. CREATE
        const newFarmer = await Farmer.create({
            name: 'Test Farmer',
            phone: '9999999999',
            aadharNumber: '123412341234',
            village: 'Test Village',
            taluka: 'Test Taluka',
            district: 'Test Dist',
            state: 'Test State',
            landParcels: [{
                surveyNumber: '101/A',
                area: 5.5,
                village: 'Test Village',
                irrigationType: 'Rainfed'
            }]
        });
        console.log('   ✅ CREATE Farmer: Success', newFarmer._id);

        // 2. READ
        const found = await Farmer.findById(newFarmer._id);
        if (found) console.log('   ✅ READ Farmer: Success');

        // 3. DELETE
        await Farmer.findByIdAndDelete(newFarmer._id);
        console.log('   ✅ DELETE Farmer: Success');

    } catch (e) {
        console.error('   ❌ Agriculture CRUD Failed:', e.message);
    } finally {
        await conn.close();
    }
}

async function main() {
    try {
        await verifyUrbanCRUD();
        await verifyHealthcareCRUD();
        await verifyAgricultureCRUD();
        console.log('\n🎉 ALL CRUD VERIFICATIONS COMPLETED');
        process.exit(0);
    } catch (e) {
        console.error('Fatal Error:', e);
        process.exit(1);
    }
}

main();
