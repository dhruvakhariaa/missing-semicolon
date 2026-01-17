const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('../services/urban/src/models/Complaint');
const ServiceRequest = require('../services/urban/src/models/ServiceRequest');
const Notification = require('../services/urban/src/models/Notification');

dotenv.config({ path: './services/urban/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/urban-service';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing data
        await Complaint.deleteMany({});
        await ServiceRequest.deleteMany({});
        await Notification.deleteMany({});

        // Mock User
        const userId = 'demo-citizen-123';

        // 1. Create Complaints
        const complaints = [
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
        await Complaint.insertMany(complaints);
        console.log('Complaints Seeded');

        // 2. Create Service Requests
        const requests = [
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
        await ServiceRequest.insertMany(requests);
        console.log('Service Requests Seeded');

        // 3. Create Notifications
        const notifications = [
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
        await Notification.insertMany(notifications);
        console.log('Notifications Seeded');

        console.log('Data Verified & Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
