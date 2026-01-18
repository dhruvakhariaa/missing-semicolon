const chatService = require('./service');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle chat message request
 * POST /api/healthcare/chat
 * Body: { message, sessionId (optional) }
 */
const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use provided sessionId or generate a new one (guest user)
        const activeSessionId = sessionId || uuidv4();

        const response = await chatService.generateResponse(activeSessionId, message);

        res.json({
            success: true,
            message: response,
            sessionId: activeSessionId
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
