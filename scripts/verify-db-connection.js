const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Load environment variables (mimic service setup)
dotenv.config();

const CONNECT_TIMEOUT = 5000; // 5s timeout

async function testConnection(name, uri) {
    if (!uri) {
        console.log(`❌ ${name}: URI not defined`);
        return false;
    }
    console.log(`Testing ${name} at ${uri}...`);
    try {
        const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: CONNECT_TIMEOUT }).asPromise();
        console.log(`✅ ${name}: Connected successfully`);
        await conn.close();
        return true;
    } catch (err) {
        console.log(`❌ ${name}: Connection failed - ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('--- STARTING DATABASE CONNECTIVITY TEST ---');

    // Define DB URIs (Default to localhost as per docker-compose default exposure)
    const dbs = [
        { name: 'Infrastructure (MongoDB)', uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sdp_registry' },
        { name: 'Urban Service', uri: process.env.URBAN_MONGO_URI || 'mongodb://localhost:27017/sdp_urban' },
        { name: 'Healthcare Service', uri: process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare' },
        { name: 'Agriculture Service', uri: process.env.AGRICULTURE_MONGO_URI || 'mongodb://localhost:27017/agriculture_db' }
    ];

    let allSuccess = true;
    for (const db of dbs) {
        const success = await testConnection(db.name, db.uri);
        if (!success) allSuccess = false;
    }

    if (allSuccess) {
        console.log('\n✅ ALL DATABASES ARE REACHABLE');
        process.exit(0);
    } else {
        console.log('\n❌ SOME DATABASES ARE UNREACHABLE. Please ensure Docker is running.');
        process.exit(1);
    }
}

main();
