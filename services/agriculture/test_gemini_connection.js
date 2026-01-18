const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

function testModel(version, model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${version}/models/${model}:generateContent?key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: ${version} / ${model}`);
                    resolve(true);
                } else {
                    console.log(`❌ FAILED: ${version} / ${model} - ${res.statusCode}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ERROR: ${version} / ${model} - ${e.message}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log("Testing gemini-2.5-flash...");
    await testModel('v1beta', 'gemini-2.5-flash');
}

runTests();
