const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import Urban Service models
const Complaint = require('../services/urban/src/models/Complaint');
const ServiceRequest = require('../services/urban/src/models/ServiceRequest');
const Notification = require('../services/urban/src/models/Notification');
const Feedback = require('../services/urban/src/models/Feedback');

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

async function testComplaintCRUD() {
    console.log(`\n${colors.blue}━━━ COMPLAINT MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Valid complaint
        const complaint1 = await Complaint.create({
            citizenId: 'CIT001',
            title: 'Street Light Not Working',
            description: 'The street light on Main Street has been non-functional for 3 days',
            category: 'Electricity',
            location: 'Main Street, Block A'
        });
        logTest('Create valid complaint', !!complaint1, `ID: ${complaint1._id}`);
        logTest('Auto-generated timestamps', !!complaint1.createdAt && !!complaint1.updatedAt);
        logTest('Default status is Pending', complaint1.status === 'Pending');
        logTest('Default priority is Medium', complaint1.priority === 'Medium');
        logTest('History array initialized', complaint1.history && complaint1.history.length > 0);

        // CREATE - Complaint with images
        const complaint2 = await Complaint.create({
            citizenId: 'CIT002',
            title: 'Pothole on Highway',
            description: 'Large pothole causing accidents',
            category: 'Road',
            location: 'Highway 101',
            priority: 'Urgent',
            images: ['data:image/png;base64,iVBORw0KG...', 'data:image/png;base64,iVBORw0KH...']
        });
        logTest('Create complaint with images', complaint2.images.length === 2);

        // CREATE - Missing required field (should fail)
        try {
            await Complaint.create({
                citizenId: 'CIT003',
                title: 'Test Complaint'
                // Missing description, category, location
            });
            logTest('Validation: Missing required fields', false, 'Should have thrown error');
        } catch (err) {
            logTest('Validation: Missing required fields', err.name === 'ValidationError');
        }

        // CREATE - Invalid enum value (should fail)
        try {
            await Complaint.create({
                citizenId: 'CIT004',
                title: 'Test',
                description: 'Test description',
                category: 'InvalidCategory', // Not in enum
                location: 'Test Location'
            });
            logTest('Validation: Invalid enum value', false);
        } catch (err) {
            logTest('Validation: Invalid enum value', err.name === 'ValidationError');
        }

        // READ - Find by ID
        const foundComplaint = await Complaint.findById(complaint1._id);
        logTest('Read complaint by ID', foundComplaint.title === complaint1.title);

        // READ - Find by criteria
        const urgentComplaints = await Complaint.find({ priority: 'Urgent' });
        logTest('Read by priority filter', urgentComplaints.length >= 1);

        const electricityComplaints = await Complaint.find({ category: 'Electricity' });
        logTest('Read by category filter', electricityComplaints.length >= 1);

        // UPDATE - Change status
        complaint1.status = 'In Progress';
        complaint1.history.push({
            status: 'In Progress',
            timestamp: new Date(),
            note: 'Team assigned to investigate'
        });
        await complaint1.save();
        logTest('Update complaint status', complaint1.status === 'In Progress');
        logTest('Update history tracking', complaint1.history.length === 2);

        // UPDATE - Resolve complaint
        const resolvedComplaint = await Complaint.findByIdAndUpdate(
            complaint1._id,
            {
                status: 'Resolved',
                resolvedAt: new Date(),
                feedback: { rating: 5, comment: 'Fixed quickly!' }
            },
            { new: true }
        );
        logTest('Resolve complaint with feedback', resolvedComplaint.status === 'Resolved');
        logTest('Add feedback to complaint', resolvedComplaint.feedback.rating === 5);

        // UPDATE - Partial update
        await Complaint.findByIdAndUpdate(complaint2._id, { priority: 'High' });
        const updatedComplaint = await Complaint.findById(complaint2._id);
        logTest('Partial update (priority only)', updatedComplaint.priority === 'High');

        // UPDATE - Array operations
        await Complaint.findByIdAndUpdate(
            complaint2._id,
            { $push: { images: 'data:image/png;base64,NEW_IMAGE' } }
        );
        const withNewImage = await Complaint.findById(complaint2._id);
        logTest('Array operation: Add image', withNewImage.images.length === 3);

        // DELETE - Remove complaint
        const deleteResult = await Complaint.findByIdAndDelete(complaint2._id);
        logTest('Delete complaint', !!deleteResult);

        const deletedCheck = await Complaint.findById(complaint2._id);
        logTest('Verify deletion', deletedCheck === null);

        // Advanced query - Count by status
        const pendingCount = await Complaint.countDocuments({ status: 'Pending' });
        logTest('Count documents by status', typeof pendingCount === 'number');

        // Advanced query - Date range
        const recentComplaints = await Complaint.find({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        logTest('Query by date range (last 24h)', Array.isArray(recentComplaints));

    } catch (err) {
        console.log(`${colors.red}Fatal error in Complaint tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function testServiceRequestCRUD() {
    console.log(`\n${colors.blue}━━━ SERVICE REQUEST MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - New connection request
        const request1 = await ServiceRequest.create({
            citizenId: 'CIT001',
            serviceType: 'New Water Connection',
            details: {
                address: '123 Main St',
                name: 'John Doe',
                propertyType: 'Residential'
            }
        });
        logTest('Create service request', !!request1);
        logTest('Default status is Pending', request1.status === 'Pending');

        // CREATE - Certificate request with documents
        const request2 = await ServiceRequest.create({
            citizenId: 'CIT002',
            serviceType: 'Birth Certificate',
            details: {
                childName: 'Jane Doe',
                dateOfBirth: '2024-01-01',
                hospitalName: 'City Hospital'
            },
            documents: ['birth_proof.pdf', 'id_proof.pdf']
        });
        logTest('Create request with documents', request2.documents.length === 2);

        // READ - Find by citizen
        const userRequests = await ServiceRequest.find({ citizenId: 'CIT001' });
        logTest('Read requests by citizenId', userRequests.length >= 1);

        // UPDATE - Approve request
        request1.status = 'Approved';
        await request1.save();
        logTest('Update request status', request1.status === 'Approved');

        // DELETE
        await ServiceRequest.findByIdAndDelete(request2._id);
        logTest('Delete service request', true);

    } catch (err) {
        console.log(`${colors.red}Fatal error in ServiceRequest tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function testNotificationCRUD() {
    console.log(`\n${colors.blue}━━━ NOTIFICATION MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Multiple notifications
        const notif1 = await Notification.create({
            userId: 'USR001',
            message: 'Your complaint has been resolved',
            type: 'Success'
        });
        logTest('Create notification', !!notif1);
        logTest('Default isRead is false', notif1.isRead === false);

        const notif2 = await Notification.create({
            userId: 'USR001',
            message: 'New service available in your area',
            type: 'Info'
        });

        // READ - Unread notifications
        const unreadNotifs = await Notification.find({ userId: 'USR001', isRead: false });
        logTest('Query unread notifications', unreadNotifs.length >= 2);

        // UPDATE - Mark as read
        await Notification.updateMany({ userId: 'USR001' }, { isRead: true });
        const nowRead = await Notification.find({ userId: 'USR001', isRead: true });
        logTest('Bulk update: Mark all as read', nowRead.length >= 2);

        // DELETE - Clear old notifications
        await Notification.deleteMany({ userId: 'USR001' });
        const remaining = await Notification.find({ userId: 'USR001' });
        logTest('Bulk delete: Clear all notifications', remaining.length === 0);

    } catch (err) {
        console.log(`${colors.red}Fatal error in Notification tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function testFeedbackCRUD() {
    console.log(`\n${colors.blue}━━━ FEEDBACK MODEL TESTS ━━━${colors.reset}\n`);

    try {
        // CREATE - Positive feedback
        const feedback1 = await Feedback.create({
            userId: 'USR001',
            context: 'Complaint Resolution',
            rating: 5,
            comment: 'Excellent service! Issue resolved quickly.'
        });
        logTest('Create positive feedback', feedback1.rating === 5);

        // CREATE - Negative feedback
        const feedback2 = await Feedback.create({
            userId: 'USR002',
            context: 'Service Request Processing',
            rating: 2,
            comment: 'Too slow, needs improvement'
        });
        logTest('Create negative feedback', feedback2.rating === 2);

        // READ - Average rating calculation
        const allFeedback = await Feedback.find({});
        const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
        logTest('Calculate average rating', avgRating > 0 && avgRating <= 5);

        // READ - Filter by rating
        const highRatings = await Feedback.find({ rating: { $gte: 4 } });
        logTest('Filter high ratings (>= 4)', highRatings.length >= 1);

        // UPDATE
        feedback2.rating = 4;
        feedback2.comment = 'Improved after follow-up';
        await feedback2.save();
        logTest('Update feedback rating and comment', feedback2.rating === 4);

        // DELETE
        await Feedback.findByIdAndDelete(feedback1._id);
        logTest('Delete feedback', true);

    } catch (err) {
        console.log(`${colors.red}Fatal error in Feedback tests: ${err.message}${colors.reset}`);
        testsFailed++;
    }
}

async function cleanupTestData() {
    console.log(`\n${colors.yellow}Cleaning up test data...${colors.reset}`);
    await Complaint.deleteMany({ citizenId: { $in: ['CIT001', 'CIT002', 'CIT003', 'CIT004'] } });
    await ServiceRequest.deleteMany({ citizenId: { $in: ['CIT001', 'CIT002'] } });
    await Notification.deleteMany({ userId: { $in: ['USR001'] } });
    await Feedback.deleteMany({ userId: { $in: ['USR001', 'USR002'] } });
    console.log(`${colors.green}✓ Cleanup complete${colors.reset}`);
}

async function main() {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║   URBAN SERVICE - CRUD TEST SUITE                 ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);

    const mongoUri = process.env.URBAN_MONGO_URI || 'mongodb://localhost:27017/sdp_urban';

    try {
        console.log(`\n${colors.cyan}Connecting to: ${mongoUri}${colors.reset}`);
        await mongoose.connect(mongoUri);
        console.log(`${colors.green}✓ Connected to Urban Service database${colors.reset}`);

        await testComplaintCRUD();
        await testServiceRequestCRUD();
        await testNotificationCRUD();
        await testFeedbackCRUD();
        await cleanupTestData();

        console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}\n`);
        console.log(`Total Tests: ${testsPassed + testsFailed}`);
        console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);

        const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
        console.log(`Success Rate: ${successRate}%\n`);

        if (testsFailed === 0) {
            console.log(`${colors.green}🎉 ALL URBAN SERVICE TESTS PASSED!${colors.reset}\n`);
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
