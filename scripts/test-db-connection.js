const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const CONNECT_TIMEOUT = 10000; // 10s timeout
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function testConnection(name, uri) {
    if (!uri) {
        console.log(`${colors.red}❌ ${name}: URI not defined${colors.reset}`);
        return { success: false, name, error: 'URI not defined' };
    }

    console.log(`${colors.cyan}🔍 Testing ${name}...${colors.reset}`);
    console.log(`   URI: ${uri}`);

    try {
        const startTime = Date.now();
        const conn = await mongoose.createConnection(uri, {
            serverSelectionTimeoutMS: CONNECT_TIMEOUT,
            maxPoolSize: 10,
            minPoolSize: 2
        }).asPromise();

        const endTime = Date.now();
        const connectionTime = endTime - startTime;

        // Get database stats
        const dbName = conn.name;
        const collections = await conn.db.listCollections().toArray();
        const collectionCount = collections.length;

        console.log(`${colors.green}✅ ${name}: Connected successfully${colors.reset}`);
        console.log(`   Database: ${dbName}`);
        console.log(`   Connection Time: ${connectionTime}ms`);
        console.log(`   Collections: ${collectionCount}`);
        if (collectionCount > 0) {
            console.log(`   Collection Names: ${collections.map(c => c.name).join(', ')}`);
        }

        // Test a simple query to ensure read access
        await conn.db.admin().ping();
        console.log(`   ${colors.green}✓${colors.reset} Ping successful`);

        await conn.close();
        console.log(`   ${colors.green}✓${colors.reset} Connection closed properly\n`);

        return {
            success: true,
            name,
            dbName,
            connectionTime,
            collectionCount,
            collections: collections.map(c => c.name)
        };
    } catch (err) {
        console.log(`${colors.red}❌ ${name}: Connection failed${colors.reset}`);
        console.log(`   Error: ${err.message}`);
        console.log(`   Code: ${err.code || 'N/A'}\n`);
        return { success: false, name, error: err.message, code: err.code };
    }
}

async function testConnectionRecovery(name, uri) {
    console.log(`${colors.yellow}🔄 Testing connection recovery for ${name}...${colors.reset}`);

    try {
        const conn = await mongoose.createConnection(uri, {
            serverSelectionTimeoutMS: CONNECT_TIMEOUT
        }).asPromise();

        // Simulate connection loss and recovery
        await conn.close();
        console.log(`   ${colors.yellow}⚠${colors.reset} Connection closed`);

        // Try to reconnect
        const conn2 = await mongoose.createConnection(uri, {
            serverSelectionTimeoutMS: CONNECT_TIMEOUT
        }).asPromise();

        console.log(`   ${colors.green}✓${colors.reset} Reconnection successful`);
        await conn2.close();

        return { success: true, name };
    } catch (err) {
        console.log(`   ${colors.red}✗${colors.reset} Recovery failed: ${err.message}`);
        return { success: false, name, error: err.message };
    }
}

async function main() {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║   DATABASE CONNECTION TEST SUITE                  ║${colors.reset}`);
    console.log(`${colors.blue}║   Jan Sewa Portal - Microservices                  ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Define all database connections
    const databases = [
        {
            name: 'API Gateway Registry',
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sdp_registry',
            critical: true
        },
        {
            name: 'Urban Service',
            uri: process.env.URBAN_MONGO_URI || 'mongodb://localhost:27017/sdp_urban',
            critical: true
        },
        {
            name: 'Healthcare Service',
            uri: process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare',
            critical: true
        },
        {
            name: 'Agriculture Service',
            uri: process.env.AGRICULTURE_MONGO_URI || 'mongodb://localhost:27017/sdp_agriculture',
            critical: true
        },
        {
            name: 'Monitoring/Analytics Service',
            uri: process.env.MONITORING_MONGO_URI || 'mongodb://localhost:27017/sdp_analytics',
            critical: false
        }
    ];

    console.log(`${colors.cyan}Phase 1: Testing Database Connections${colors.reset}\n`);
    console.log('━'.repeat(60) + '\n');

    const results = [];
    for (const db of databases) {
        const result = await testConnection(db.name, db.uri);
        results.push({ ...result, critical: db.critical });
    }

    // Test connection recovery for one database
    console.log('━'.repeat(60) + '\n');
    console.log(`${colors.cyan}Phase 2: Testing Connection Recovery${colors.reset}\n`);
    const recoveryResult = await testConnectionRecovery(
        'Healthcare Service',
        process.env.HEALTHCARE_MONGO_URI || 'mongodb://localhost:27017/sdp_healthcare'
    );
    console.log();

    // Summary
    console.log('━'.repeat(60) + '\n');
    console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}\n`);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const criticalFailed = results.filter(r => !r.success && r.critical).length;

    console.log(`Total Databases: ${results.length}`);
    console.log(`${colors.green}✅ Successful: ${successful}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);

    if (criticalFailed > 0) {
        console.log(`${colors.red}⚠️  Critical Failures: ${criticalFailed}${colors.reset}`);
    }

    console.log();

    // List successful connections
    if (successful > 0) {
        console.log(`${colors.green}Successful Connections:${colors.reset}`);
        results.filter(r => r.success).forEach(r => {
            console.log(`  ✓ ${r.name} (${r.dbName}) - ${r.collectionCount} collections`);
        });
        console.log();
    }

    // List failures
    if (failed > 0) {
        console.log(`${colors.red}Failed Connections:${colors.reset}`);
        results.filter(r => !r.success).forEach(r => {
            console.log(`  ✗ ${r.name} - ${r.error}`);
        });
        console.log();
    }

    // Connection recovery status
    console.log(`Connection Recovery Test: ${recoveryResult.success ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
    console.log();

    // Final verdict
    console.log('━'.repeat(60) + '\n');
    if (criticalFailed === 0 && recoveryResult.success) {
        console.log(`${colors.green}🎉 ALL CRITICAL DATABASES ARE OPERATIONAL!${colors.reset}\n`);
        console.log('You can now proceed with CRUD operation tests.');
        console.log('Run: node scripts/test-urban-crud.js');
        console.log('Run: node scripts/test-healthcare-crud.js');
        console.log('Run: node scripts/test-agriculture-crud.js');
        process.exit(0);
    } else if (criticalFailed === 0) {
        console.log(`${colors.yellow}⚠️  DATABASES ARE CONNECTED BUT RECOVERY FAILED${colors.reset}\n`);
        console.log('Critical databases are accessible, but there may be connection stability issues.');
        process.exit(1);
    } else {
        console.log(`${colors.red}❌ SOME CRITICAL DATABASES ARE UNREACHABLE${colors.reset}\n`);
        console.log('Please ensure:');
        console.log('  1. Docker is running: docker ps');
        console.log('  2. MongoDB container is healthy: docker-compose ps mongodb');
        console.log('  3. Start services if needed: docker-compose up -d mongodb');
        console.log('  4. Check logs: docker-compose logs mongodb');
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.error(`${colors.red}Unhandled error: ${err.message}${colors.reset}`);
    process.exit(1);
});

main();
