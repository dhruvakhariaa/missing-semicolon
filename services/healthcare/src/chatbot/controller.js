const chatService = require('./service');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle chat message request
 * POST /api/healthcare/chat
 * Body: { message, sessionId (optional) }
 */
const chat = async (req, res) => {
    try {
        const { message, sessionId, language } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Generate or use provided session ID
        const currentSessionId = sessionId || uuidv4();

        // Get response from chatbot service with language preference
        const response = await chatService.generateResponse(currentSessionId, message, language || 'english');

        res.json({
            success: true,
            message: response,
            sessionId: currentSessionId
        });
    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process your request. Please try again later.'
        });
    }
};

/**
 * Clear chat history
 * POST /api/healthcare/chat/clear
 * Body: { sessionId }
 */
const clearChat = (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
        chatService.clearHistory(sessionId);
    }
    res.json({ success: true, message: 'Chat history cleared' });
};

module.exports = {
    chat,
    clearChat
};
