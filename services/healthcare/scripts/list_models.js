require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy model to get client
        // Actually SDK doesn't have listModels on client directly? 
        // Wait, typically it's specific manager.
        // Let's check SDK docs pattern or just try common names.
        // Or just try "gemini-1.5-flash-latest".

        // Actually, I can use REST API via curl if SDK is obscure.
        console.log("Listing models via SDK might be tricky without Manager, using generic.");
    } catch (e) {
        console.log(e);
    }
}

// better approach: simply try commonly known models.
// gemini-1.5-flash, gemini-1.5-pro, gemini-1.0-pro
console.log("To list models, I will use curl.");
