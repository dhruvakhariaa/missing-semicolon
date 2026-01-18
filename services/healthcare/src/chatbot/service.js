const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HEALTHCARE_SYSTEM_PROMPT } = require("./prompts");

// Demo mode responses for when quota is exceeded or API is unavailable
const DEMO_RESPONSES = {
    greeting: "Namaste! I am your Jan Seva health assistant. I can help you with:\n\n• General health information and home remedies\n• Booking doctor appointments\n• Understanding medical terms and lab reports\n• Finding blood banks and donation camps\n• Emergency contact numbers\n\nWhat can I help you with today?",

    symptoms: "I understand you're experiencing health symptoms. Here's what I recommend:\n\n**For Mild Symptoms:**\n• Rest and stay hydrated\n• Monitor your temperature\n• Take over-the-counter medicines as needed\n\n**For Moderate Symptoms:**\n• Book an appointment through our 'Find Doctors' section\n• Call our helpline at 104 for guidance\n\n**For Emergencies:**\n• Call 108 immediately\n• Visit the nearest hospital emergency room\n\nWould you like me to guide you to book an appointment?",

    appointment: "I can help you book an appointment! Here's how:\n\n**Steps:**\n1. Go to the 'Find Doctors' section on the home page\n2. Select your preferred department or specialty\n3. Browse available doctors and their profiles\n4. Choose a convenient time slot\n5. Confirm your booking\n\n**Alternative Methods:**\n• Call our helpline at 104\n• Visit the nearest government hospital\n\nNeed help finding a specific department?",

    medicine: "For medication information:\n\n**Important Reminders:**\n• Always consult a doctor before taking new medicines\n• Follow prescribed dosages carefully\n• Check expiry dates\n• Inform your doctor of any allergies\n\n**For Prescriptions:**\n• Book an appointment with a doctor on our portal\n• Get teleconsultation if available\n• Visit a government hospital pharmacy\n\n**Emergency Helpline:** 104\n\nIs there a specific concern I can help with?",

    blood: "For blood donation and blood bank services:\n\n**Blood Bank Services:**\n• Visit our 'Blood Bank' page to check availability\n• Find blood by type and location\n• Register as a blood donor\n• Find donation camps near you\n\n**Emergency Blood Requests:**\n• Call Blood Helpline: 104\n• Visit the nearest government hospital\n• Check our real-time blood inventory online\n\nWould you like to register as a donor?",

    default: "I'm here to help with your healthcare needs! I can assist with:\n\n• **Appointments:** Guide you to book doctor visits\n• **Health Info:** Provide general medical information\n• **Blood Services:** Help find blood banks and donation camps\n• **Emergency:** Share emergency contact numbers\n• **Lab Reports:** Guide you to access your test results\n\n**Important Contact Numbers:**\n• Medical Emergency: 108\n• Health Helpline: 104\n• COVID Helpline: 1075\n\nHow can I assist you today?",
};

function getDemoResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/hello|hi|hey|namaste|start/)) {
        return DEMO_RESPONSES.greeting;
    } else if (lowerMessage.match(/symptom|fever|cough|pain|sick|ill|cold|flu|headache|stomach/)) {
        return DEMO_RESPONSES.symptoms;
    } else if (lowerMessage.match(/appointment|book|doctor|schedule|consultation|visit/)) {
        return DEMO_RESPONSES.appointment;
    } else if (lowerMessage.match(/medicine|drug|medication|prescription|tablet|pill/)) {
        return DEMO_RESPONSES.medicine;
    } else if (lowerMessage.match(/blood|donor|donation|transfusion/)) {
        return DEMO_RESPONSES.blood;
    } else {
        return DEMO_RESPONSES.default;
    }
}

/**
 * Generate a response from the healthcare chatbot
 * Currently using demo mode due to API quota limitations
 * @param {string} sessionId - Unique session ID for the user
 * @param {string} message - User's message
 * @returns {Promise<string>} - AI response
 */
const generateResponse = async (sessionId, message) => {
    try {
        // Using demo mode for reliable responses
        // When API quota is available, this can be switched to real Gemini API
        console.log(`[Chatbot Demo Mode] Session: ${sessionId}, Message: ${message.substring(0, 30)}...`);

        const response = getDemoResponse(message);
        return response;

    } catch (error) {
        console.error("Chatbot Error:", error);
        return DEMO_RESPONSES.default;
    }
};

/**
 * Clear chat history for a session
 * @param {string} sessionId
 */
const clearHistory = (sessionId) => {
    console.log(`[Chatbot] Cleared history for session: ${sessionId}`);
    return true;
};

module.exports = {
    generateResponse,
    clearHistory,
};
