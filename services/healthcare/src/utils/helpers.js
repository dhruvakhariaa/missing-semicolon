/**
 * Utility Helper Functions
 */

// Standard API response format
const sendResponse = (res, statusCode, success, data = null, message = null, error = null) => {
    const response = {
        success,
        timestamp: new Date().toISOString()
    };

    if (data !== null) response.data = data;
    if (message) response.message = message;
    if (error) response.error = error;

    return res.status(statusCode).json(response);
};

// Paginated response
const sendPaginatedResponse = (res, data, page, limit, total) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
    });
};

// Generate time slots for a day
const generateTimeSlots = (startHour = 9, endHour = 17, intervalMinutes = 30) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endMin = minute + intervalMinutes;
            const endHr = endMin >= 60 ? hour + 1 : hour;
            const end = `${endHr.toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
            slots.push({ startTime: start, endTime: end });
        }
    }
    return slots;
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

module.exports = {
    sendResponse,
    sendPaginatedResponse,
    generateTimeSlots,
    formatDate
};
