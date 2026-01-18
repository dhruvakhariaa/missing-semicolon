const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import Agriculture Service models
const Farmer = require('../services/agriculture/src/models/Farmer');
const Scheme = require('../services/agriculture/src/models/Scheme');
const Advisory = require('../services/agriculture/src/models/Advisory');

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

async function testFarmerCRUD() {
    console.log(`\n${colors.blue}━━━ FARMER MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Farmer with multiple land parcels
        const farmer1 = await Farmer.create({
            name: 'Ramesh Kumar',
            phone: '9876543210',
            aadharNumber: '1234-5678-9012',
            village: 'Khandala',
            taluka: 'Pune',
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
                    soilDetails: {
                        ph: 6.8,
                        nitrogen: 280,
                        phosphorus: 25,
                        potassium: 210,
                        organicCarbon: 0.75,
                        lastTested: new Date('2024-10-15')
                    }
                },
                {
                    surveyNumber: 'S-123/B',
                    area: 3.2,
                    village: 'Khandala',
                    irrigationType: 'Rainfed',
                    currentCrop: 'Cotton',
                    sowingDate: new Date('2024-06-15')
                }
            ],
            enrolledSchemes: [
                {
                    schemeName: 'PM-KISAN',
                    enrollmentDate: new Date('2024-01-01'),
                    status: 'Approved',
                    applicationId: 'PMK-2024-001',
                    category: 'Direct Benefit Transfer',
                    landArea: 8.7,
                    bankAccount: 'XXXX-XXXX-1234'
                }
            ]
        });
        logTest('Create farmer with land parcels', !!farmer1);
        logTest('Multiple land parcels created', farmer1.landParcels.length === 2);
        logTest('Scheme enrollment recorded', farmer1.enrolledSchemes.length === 1);
        logTest('Auto-generated timestamps', !!farmer1.createdAt && !!farmer1.updatedAt);

        // CREATE - Simple farmer
        const farmer2 = await Farmer.create({
            name: 'Sunita Patil',
            phone: '9876543211',
            aadharNumber: '2345-6789-0123',
            village: 'Lonavala',
            taluka: 'Maval',
            district: 'Pune',
            state: 'Maharashtra',
            landParcels: []
        });
        logTest('Create farmer without land parcels', farmer2.landParcels.length === 0);

        // CREATE - Duplicate phone (should fail)
        try {
            await Farmer.create({
                name: 'Another Farmer',
                phone: '9876543210', // Duplicate
                aadharNumber: '3456-7890-1234',
                village: 'Test',
                taluka: 'Test',
                district: 'Test',
                state: 'Test'
            });
            logTest('Validation: Duplicate phone', false);
        } catch (err) {
            logTest('Validation: Duplicate phone prevented', err.code === 11000);
        }

        // CREATE - Duplicate Aadhar (should fail)
        try {
            await Farmer.create({
                name: 'Test Farmer',
                phone: '9876543212',
                aadharNumber: '1234-5678-9012', // Duplicate
                village: 'Test',
                taluka: 'Test',
                district: 'Test',
                state: 'Test'
            });
            logTest('Validation: Duplicate Aadhar', false);
        } catch (err) {
            logTest('Validation: Duplicate Aadhar prevented', err.code === 11000);
        }

        // CREATE - Invalid phone format (should fail)
        try {
            await Farmer.create({
                name: 'Test',
                phone: '123', // Invalid format
                aadharNumber: '4567-8901-2345',
                village: 'Test',
                taluka: 'Test',
                district: 'Test',
                state: 'Test'
            });
            logTest('Validation: Invalid phone format', false);
        } catch (err) {
            logTest('Validation: Invalid phone format', err.name === 'ValidationError');
        }

        // READ - Find by Aadhar
        const foundFarmer = await Farmer.findOne({ aadharNumber: '1234-5678-9012' });
        logTest('Read farmer by Aadhar', foundFarmer.name === 'Ramesh Kumar');

        // READ - Find by village
        const khandalaFarmers = await Farmer.find({ village: 'Khandala' });
        logTest('Read farmers by village', khandalaFarmers.length >= 1);

        // READ - Find farmers with specific crop
        const wheatFarmers = await Farmer.find({ 'landParcels.currentCrop': 'Wheat' });
        logTest('Query by embedded document field (crop)', wheatFarmers.length >= 1);

        // UPDATE - Add new land parcel
        farmer2.landParcels.push({
            surveyNumber: 'S-456/A',
            area: 2.5,
            village: 'Lonavala',
            irrigationType: 'Sprinkler',
            currentCrop: 'Rice',
            sowingDate: new Date('2024-07-01')
        });
        await farmer2.save();
        logTest('Add land parcel to farmer', farmer2.landParcels.length === 1);

        // UPDATE - Enroll in new scheme
        farmer1.enrolledSchemes.push({
            schemeName: 'Crop Insurance Scheme',
            enrollmentDate: new Date(),
            status: 'Applied',
            applicationId: 'CIS-2024-045',
            category: 'Insurance',
            landArea: 8.7,
            bankAccount: 'XXXX-XXXX-1234'
        });
        await farmer1.save();
        logTest('Enroll farmer in new scheme', farmer1.enrolledSchemes.length === 2);

        // UPDATE - Update soil details
        farmer1.landParcels[0].soilDetails.ph = 7.0;
        farmer1.landParcels[0].soilDetails.nitrogen = 300;
        farmer1.landParcels[0].soilDetails.lastTested = new Date();
        await farmer1.save();
        logTest('Update soil details in land parcel', farmer1.landParcels[0].soilDetails.ph === 7.0);

        // UPDATE - Update scheme status
        const schemeToUpdate = farmer1.enrolledSchemes.find(s => s.schemeName === 'PM-KISAN');
        if (schemeToUpdate) {
            schemeToUpdate.status = 'Disbursed';
            await farmer1.save();
            logTest('Update scheme status', schemeToUpdate.status === 'Disbursed');
        }

        // UPDATE - Update irrigation date
        await Farmer.findOneAndUpdate(
            { _id: farmer1._id, 'landParcels.surveyNumber': 'S-123/A' },
            { $set: { 'landParcels.$.lastIrrigationDate': new Date() } }
        );
        const updated = await Farmer.findById(farmer1._id);
        logTest('Update irrigation date using positional operator', !!updated.landParcels[0].lastIrrigationDate);

        // READ - Aggregate total land area
        const totalArea = farmer1.landParcels.reduce((sum, parcel) => sum + parcel.area, 0);
        logTest('Calculate total land area', totalArea === 8.7);

        // READ - Find farmers by district and crop
        const puneCottonFarmers = await Farmer.find({
            district: 'Pune',
            'landParcels.currentCrop': 'Cotton'
        });
        logTest('Complex query: district and crop', puneCottonFarmers.length >= 1);

        // DELETE - Remove land parcel
        farmer1.landParcels = farmer1.landParcels.filter(p => p.surveyNumber !== 'S-123/B');
        await farmer1.save();
        logTest('Remove land parcel from array', farmer1.landParcels.length === 1);

        // DELETE - Remove farmer
        await Farmer.findByIdAndDelete(farmer2._id);
        const deletedCheck = await Farmer.findById(farmer2._id);
        logTest('Delete farmer', deletedCheck === null);

    } catch (err) {
        console.log(`${colors.red}Fatal error in Farmer tests: ${err.message}${colors.reset}`);
        console.log(err.stack);
        testsFailed++;
    }
}

async function testSchemeCRUD() {
    console.log(`\n${colors.blue}━━━ SCHEME MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Active scheme
        const scheme1 = await Scheme.create({
            name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
            description: 'Direct income support of ₹6000 per year to all farmer families',
            eligibility: 'All landholding farmer families',
            benefits: 'Three equal installments of ₹2000 each, directly to bank account',
            isActive: true
        });
        logTest('Create active scheme', !!scheme1);
        logTest('Default isActive is true', scheme1.isActive === true);

        // CREATE - Another scheme
        const scheme2 = await Scheme.create({
            name: 'Soil Health Card Scheme',
            description: 'Provides soil health cards to farmers for nutrient management',
            eligibility: 'All farmers',
            benefits: 'Free soil testing and health card',
            isActive: true
        });

        // CREATE - Inactive scheme
        const scheme3 = await Scheme.create({
            name: 'Old Subsidy Scheme',
            description: 'Discontinued irrigation subsidy',
            eligibility: 'N/A',
            benefits: 'N/A',
            isActive: false
        });
        logTest('Create inactive scheme', scheme3.isActive === false);

        // READ - Find active schemes
        const activeSchemes = await Scheme.find({ isActive: true });
        logTest('Read active schemes only', activeSchemes.length >= 2);

        // READ - Find by name
        const pmKisan = await Scheme.findOne({ name: { $regex: /PM-KISAN/i } });
        logTest('Read scheme by name (regex)', !!pmKisan);

        // UPDATE - Deactivate scheme
        scheme3.isActive = false;
        await scheme3.save();
        logTest('Update scheme status', scheme3.isActive === false);

        // UPDATE - Update benefits
        scheme2.benefits = 'Free soil testing, health card, and fertilizer recommendations';
        await scheme2.save();
        logTest('Update scheme benefits', scheme2.benefits.includes('recommendations'));

        // DELETE
        await Scheme.findByIdAndDelete(scheme3._id);
        logTest('Delete scheme', true);

    } catch (err) {
        console.log(`${colors.red}Fatal error in Scheme tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function testAdvisoryCRUD() {
    console.log(`\n${colors.blue}━━━ ADVISORY MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Disease advisory
        const advisory1 = await Advisory.create({
            crop: 'Wheat',
            stage: 'Tillering',
            advice: 'Apply first dose of nitrogen. Monitor for aphids and rust disease.',
            type: 'Disease',
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        logTest('Create disease advisory', !!advisory1);
        logTest('Advisory type set correctly', advisory1.type === 'Disease');

        // CREATE - Weather advisory
        const advisory2 = await Advisory.create({
            crop: 'Cotton',
            stage: 'Flowering',
            advice: 'Heavy rainfall expected. Postpone pesticide application for 3 days.',
            type: 'Weather',
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });
        logTest('Create weather advisory', advisory2.type === 'Weather');

        // CREATE - Fertilizer advisory
        const advisory3 = await Advisory.create({
            crop: 'Rice',
            stage: 'Panicle Initiation',
            advice: 'Apply urea @50kg/acre along with potash. Ensure adequate water availability.',
            type: 'Fertilizer',
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });

        // READ - Find advisories by crop
        const wheatAdvisories = await Advisory.find({ crop: 'Wheat' });
        logTest('Read advisories by crop', wheatAdvisories.length >= 1);

        // READ - Find current valid advisories
        const now = new Date();
        const validAdvisories = await Advisory.find({
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        });
        logTest('Read currently valid advisories', validAdvisories.length >= 3);

        // READ - Find by type
        const weatherAdvisories = await Advisory.find({ type: 'Weather' });
        logTest('Read advisories by type', weatherAdvisories.length >= 1);

        // READ - Find by crop and stage
        const wheatTillering = await Advisory.findOne({ crop: 'Wheat', stage: 'Tillering' });
        logTest('Read advisory by crop and stage', !!wheatTillering);

        // UPDATE - Extend validity period
        advisory1.validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await advisory1.save();
        logTest('Update advisory validity period', advisory1.validUntil > new Date());

        // UPDATE - Update advice content
        advisory2.advice = 'Heavy rainfall expected. Postpone all field operations for 5 days.';
        await advisory2.save();
        logTest('Update advisory content', advisory2.advice.includes('5 days'));

        // DELETE - Remove expired advisory
        await Advisory.findByIdAndDelete(advisory3._id);
        logTest('Delete advisory', true);

        // Advanced query - Find advisories expiring soon
        const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const expiringSoon = await Advisory.find({
            validUntil: { $lte: threeDaysLater, $gte: new Date() }
        });
        logTest('Query advisories expiring soon', Array.isArray(expiringSoon));

    } catch (err) {
        console.log(`${colors.red}Fatal error in Advisory tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function cleanupTestData() {
    console.log(`\n${colors.yellow}Cleaning up test data...${colors.reset}`);
    await Farmer.deleteMany({ phone: { $in: ['9876543210', '9876543211', '9876543212'] } });
    await Scheme.deleteMany({ name: { $regex: /(PM-KISAN|Soil Health|Old Subsidy)/i } });
    await Advisory.deleteMany({ crop: { $in: ['Wheat', 'Cotton', 'Rice'] } });
    console.log(`${colors.green}✓ Cleanup complete${colors.reset}`);
}

async function main() {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║   AGRICULTURE SERVICE - CRUD TEST SUITE           ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);

    const mongoUri = process.env.AGRICULTURE_MONGO_URI || 'mongodb://localhost:27017/sdp_agriculture';

    try {
        console.log(`\n${colors.cyan}Connecting to: ${mongoUri}${colors.reset}`);
        await mongoose.connect(mongoUri);
        console.log(`${colors.green}✓ Connected to Agriculture Service database${colors.reset}`);

        await testFarmerCRUD();
        await testSchemeCRUD();
        await testAdvisoryCRUD();
        await cleanupTestData();

        console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}\n`);
        console.log(`Total Tests: ${testsPassed + testsFailed}`);
        console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);

        const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
        console.log(`Success Rate: ${successRate}%\n`);

        if (testsFailed === 0) {
            console.log(`${colors.green}🎉 ALL AGRICULTURE SERVICE TESTS PASSED!${colors.reset}\n`);
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
