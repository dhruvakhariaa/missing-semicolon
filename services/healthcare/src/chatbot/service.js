const Groq = require("groq-sdk");
const { HEALTHCARE_SYSTEM_PROMPT } = require("./prompts");

// Initialize Groq API only if API key is available
let groq = null;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
}

// Store chat history in-memory (For production, use Redis/MongoDB)
const chatSessions = new Map();

/**
 * Generate a response from the healthcare chatbot using Groq
 * @param {string} sessionId - Unique session ID for the user
 * @param {string} message - User's message
 * @param {string} language - Preferred language (english, hindi, gujarati)
 * @returns {Promise<string>} - AI response
 */
const generateResponse = async (sessionId, message, language = 'english') => {
    // If Groq is not configured, return a fallback message
    if (!groq) {
        return "The AI chatbot is not configured. Please set the GROQ_API_KEY environment variable to enable this feature.";
    }

    try {
        let chatHistory = chatSessions.get(sessionId);

        // If no session exists, create one with system prompt
        if (!chatHistory) {
            let languageInstruction = '';

            if (language === 'hindi') {
                languageInstruction = `\n\n**CRITICAL LANGUAGE REQUIREMENT:**
You MUST respond ONLY in Hindi language using Devanagari script (हिंदी).
Do NOT use English at all. Every word must be in Hindi.
Example: Instead of "Hello", say "नमस्ते"
Instead of "Book appointment", say "अपॉइंटमेंट बुक करें"
All responses must be 100% in Hindi/Devanagari script.`;
            } else if (language === 'gujarati') {
                languageInstruction = `\n\n**CRITICAL LANGUAGE REQUIREMENT:**
You MUST respond ONLY in Gujarati language using Gujarati script (ગુજરાતી).
Do NOT use English at all. Every word must be in Gujarati.
All responses must be 100% in Gujarati script.`;
            } else {
                languageInstruction = '\n\n**LANGUAGE:** Respond in English only.';
            }

            chatHistory = [
                {
                    role: "system",
                    content: HEALTHCARE_SYSTEM_PROMPT + languageInstruction
                },
                {
                    role: "assistant",
                    content: "Namaste! I am your Jan Seva health assistant. How can I help you today?"
                }
            ];
            chatSessions.set(sessionId, chatHistory);
        }

        // Add user message to history
        chatHistory.push({
            role: "user",
            content: message
        });

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: chatHistory,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false
        });

        const assistantMessage = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // Add assistant response to history
        chatHistory.push({
            role: "assistant",
            content: assistantMessage
        });

        // Update session
        chatSessions.set(sessionId, chatHistory);

        return assistantMessage;
    } catch (error) {
        console.error("Groq API Error:", error);

        // Handle specific error cases
        if (error.status === 429) {
            throw new Error("I'm experiencing high demand right now. Please try again in a minute.");
        } else if (error.status === 401) {
            throw new Error("API authentication failed. Please contact support.");
        } else if (error.status === 404) {
            throw new Error("AI service temporarily unavailable. Please try again later.");
        }

        throw new Error("I'm having trouble connecting right now. Please try again in a moment.");
    }
};

/**
 * Clear chat history for a session
 * @param {string} sessionId
 */
const clearHistory = (sessionId) => {
    chatSessions.delete(sessionId);
};

module.exports = {
    generateResponse,
    clearHistory,
};
