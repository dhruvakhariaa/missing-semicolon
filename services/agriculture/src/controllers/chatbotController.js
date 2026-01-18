const Farmer = require('../models/Farmer');
const https = require('https');

// @desc    Chat with Agri-Bot (Context Aware)
// @route   POST /api/agriculture/chat
// @access  Public
exports.chatWithBot = async (req, res) => {
    console.log("🤖 Chatbot Request Received:", req.body.message); // Debug Log

    try {
        const { message, farmerId } = req.body;

        if (!farmerId) {
            return res.status(400).json({ success: false, reply: "I need to know who you are first. Please register or login." });
        }

        // 1. Fetch Farmer Context
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ success: false, reply: "Farmer profile not found." });
        }

        // 2. Construct System Context
        const crops = farmer.landParcels.map(p => p.currentCrop).join(', ');
        const locations = [...new Set(farmer.landParcels.map(p => p.village))].join(', ');
        const soils = farmer.landParcels.map(p => p.soilHealth ? `pH ${p.soilHealth.ph}, N: ${p.soilHealth.nitrogen}` : 'Unknown').join('; ');

        const systemPrompt = `
You are 'Agri-Sahayak', an expert AI agriculture consultant for the Government of India.
You are talking to a farmer named ${farmer.name}.

FARMER CONTEXT:
- Location: ${locations}
- Crops Growing: ${crops}
- Soil Health: ${soils}

INSTRUCTIONS:
- Answer the farmer's question specifically based on their crops and location.
- Provide practical, actionable advice.
- Keep answers concise (under 3-4 sentences).
`;

        // 3. Call Groq API using native HTTPS (Node.js < 18 compatible)
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY_MISSING");
        }

        const data = JSON.stringify({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 300
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', (chunk) => body += chunk);
            apiRes.on('end', () => {
                if (apiRes.statusCode !== 200) {
                    console.error("Groq API Error:", body);
                    return res.status(502).json({ success: false, reply: "My brain is tired (AI Service Error). Please try again." });
                }
                const parsed = JSON.parse(body);
                const reply = parsed.choices[0]?.message?.content || "No reply generated.";
                res.status(200).json({ success: true, reply: reply });
            });
        });

        apiReq.on('error', (e) => {
            console.error("Network Error:", e);
            res.status(500).json({ success: false, reply: "I cannot reach the internet right now." });
        });

        apiReq.write(data);
        apiReq.end();

    } catch (err) {
        console.error("Chat Logic Error:", err.message);
        if (err.message === 'GROQ_API_KEY_MISSING') {
            return res.status(500).json({ success: false, reply: "System Config Error: GROQ_API_KEY is missing in .env file." });
        }
        res.status(500).json({ success: false, reply: "Internal System Error." });
    }
};
