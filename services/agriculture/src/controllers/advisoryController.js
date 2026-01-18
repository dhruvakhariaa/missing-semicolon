const https = require('https');
const Farmer = require('../models/Farmer');
const Advisory = require('../models/Advisory');

// @desc    Get personalized AI advisories
// @route   GET /api/agriculture/advisories
// @access  Public
exports.getAdvisories = async (req, res) => {
    try {
        const { crop, farmerId } = req.query;
        console.log(`Advisory Request - Crop: ${crop}, FarmerId: ${farmerId}`);

        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ success: false, message: "Server: API Key missing." });
        }

        // 1. Build Context string from DB
        let contextString = "";
        let cropListForFallback = [];

        if (farmerId) {
            try {
                const farmer = await Farmer.findById(farmerId);
                if (farmer?.landParcels?.length > 0) {
                    const parcels = farmer.landParcels.filter(p => p.currentCrop);
                    cropListForFallback = parcels.map(p => p.currentCrop);

                    if (parcels.length > 0) {
                        const details = parcels.map(p => {
                            const daysSown = p.sowingDate
                                ? Math.floor((new Date() - new Date(p.sowingDate)) / (1000 * 60 * 60 * 24))
                                : 0;
                            return `${p.currentCrop} (Age: ${daysSown} days, Irrigation: ${p.irrigationType})`;
                        });
                        contextString = details.join(", ");
                    }
                }
            } catch (e) {
                console.error("DB Error:", e.message);
            }
        }

        // Context logic: checking both DB and Query
        if (!contextString && crop) {
            contextString = crop;
            cropListForFallback = crop.split(',').filter(c => c.trim().length > 0);
        } else if (crop) {
            // If we have both, append query crops to be safe, ensuring user request is honored
            contextString += `, ${crop}`;
        }

        if (!contextString) {
            return res.status(200).json({
                success: true,
                data: [{ crop: 'General', stage: 'Planning', advice: 'Please add crops to get advice.', type: 'General' }]
            });
        }

        // 2. Construct Prompt (Restoring Gemini Prompt)
        const prompt = `
            Act as an expert agricultural scientist in India. 
            I need specific advice for these crops: ${contextString}.
            
            Output a JSON array of objects. Strictly valid JSON.
            [
                {
                    "crop": "Crop Name",
                    "stage": "Estimated Stage",
                    "advice_en": "Actionable advice in English (4-5 sentences)...",
                    "advice_hi": "Actionable advice in Hindi (4-5 sentences)...",
                    "type": "General"
                }
            ]
        `;

        // 3. Call Gemini API via HTTPS (No SDK)
        const requestData = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', chunk => body += chunk);
            apiRes.on('end', () => {
                if (apiRes.statusCode !== 200) {
                    console.error("Gemini API Error:", body);
                    return sendFallback(res, cropListForFallback);
                }

                try {
                    const response = JSON.parse(body);
                    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    console.log("DEBUG: Gemini Raw Text:", rawText);

                    // Simple cleaning for JSON Markdown
                    let jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                    if (jsonStr.startsWith('json')) jsonStr = jsonStr.substring(4).trim();

                    let advisories = [];
                    try {
                        advisories = JSON.parse(jsonStr);
                    } catch (e) {
                        console.error("DEBUG: JSON Parse Failed:", e.message);
                        // Try regex fallback if strict parse fails
                        const match = jsonStr.match(/\[.*\]/s);
                        if (match) {
                            advisories = JSON.parse(match[0]);
                        } else {
                            throw new Error("No JSON found");
                        }
                    }

                    if (!Array.isArray(advisories)) advisories = [advisories];

                    // Normalize keys
                    const normalizedAdvisories = advisories.map(a => {
                        return {
                            crop: a.crop || a.Crop || a.cropName || a.name || "Unknown Crop",
                            stage: a.stage || a.Stage || "General",
                            advice_en: a.advice_en || a.advice || a.english || "Advice not available",
                            advice_hi: a.advice_hi || a.hindi || "अनुवाद उपलब्ध नहीं है",
                            type: a.type || a.Type || "General"
                        };
                    });

                    console.log("DEBUG: Normalized Data:", JSON.stringify(normalizedAdvisories, null, 2));
                    res.status(200).json({ success: true, data: normalizedAdvisories });

                } catch (error) {
                    console.error("Parsing Error:", error.message);
                    sendFallback(res, cropListForFallback);
                }
            });
        });

        apiReq.on('error', (e) => {
            console.error("Network Error:", e);
            sendFallback(res, cropListForFallback);
        });

        apiReq.write(requestData);
        apiReq.end();

    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

function sendFallback(res, crops) {
    const data = (crops.length > 0 ? crops : ['General']).map(c => ({
        crop: c.split('(')[0].trim(),
        stage: 'General',
        advice_en: 'Standard advice: Ensure proper irrigation and monitor for pests. (AI unavailable)',
        advice_hi: 'मानक सलाह: उचित सिंचाई सुनिश्चित करें और कीटों पर नज़र रखें। (AI अनुपलब्ध)',
        type: 'General'
    }));
    res.status(200).json({ success: true, source: 'Fallback', data });
}

// Keep createAdvisory as is...
exports.createAdvisory = async (req, res) => {
    try {
        const advisory = await Advisory.create(req.body);
        res.status(201).json({ success: true, data: advisory });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
