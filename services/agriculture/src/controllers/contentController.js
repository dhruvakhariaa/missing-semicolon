const Scheme = require('../models/Scheme');

// @desc    Get government schemes
// @route   GET /api/agriculture/schemes
// @access  Public
exports.getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({ isActive: true });

        // Mock data if empty
        if (schemes.length === 0) {
            return res.status(200).json({
                success: true,
                data: [
                    {
                        name: 'PM-KISAN',
                        description: 'Income support of Rs. 6000/- per year.',
                        eligibility: 'Small and marginal farmers',
                        benefits: 'Rs. 2000 every 4 months'
                    },
                    {
                        name: 'Fasal Bima Yojana',
                        description: 'Crop insurance scheme.',
                        eligibility: 'All farmers growing notified crops',
                        benefits: 'Insurance cover against natural risks'
                    }
                ]
            });
        }

        res.status(200).json({
            success: true,
            data: schemes
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get weather (Mock)
// @route   GET /api/agriculture/weather
// @access  Public
exports.getWeather = async (req, res) => {
    try {
        const village = req.query.location || 'Local Village';

        // Default to Paithan (Aurangabad) coordinates for the demo as per persona
        // In a real app, we would geocode the village name
        const latitude = 19.48; // Paithan
        const longitude = 75.38;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
        );
        const data = await response.json();

        if (!data.daily) {
            throw new Error('Weather data unavailable');
        }

        // Map WMO codes to readable conditions
        const getWeatherCondition = (code) => {
            if (code <= 1) return 'Sunny';
            if (code <= 3) return 'Partly Cloudy';
            if (code <= 48) return 'Foggy';
            if (code <= 69) return 'Rain';
            if (code <= 77) return 'Snow';
            if (code <= 99) return 'Thunderstorm';
            return 'Cloudy';
        };

        const getAlert = (code, maxTemp) => {
            if (maxTemp > 40) return 'Heatwave Alert';
            if (code >= 95) return 'Severe Thunderstorm Warning';
            if (code >= 65) return 'Heavy Rain Advisory';
            return 'Normal';
        };

        const forecast = data.daily.time.map((date, index) => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(data.daily.temperature_2m_max[index]),
            condition: getWeatherCondition(data.daily.weather_code[index]),
            rainChance: data.daily.precipitation_probability_max?.[index] || 0,
            alert: getAlert(data.daily.weather_code[index], data.daily.temperature_2m_max[index])
        }));

        res.status(200).json({
            success: true,
            data: {
                location: village,
                forecast: forecast
            }
        });
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        // Fallback mock data
        res.status(200).json({
            success: true,
            data: {
                location: req.query.location || 'Paithan',
                forecast: [
                    { day: 'Today', temp: 28, condition: 'Sunny', rainChance: 0, alert: 'Normal' },
                    { day: 'Tomorrow', temp: 27, condition: 'Cloudy', rainChance: 20, alert: 'Normal' },
                    { day: 'Wed', temp: 26, condition: 'Rain', rainChance: 80, alert: 'Advisory: Medium Rainfall' }
                ]
            }
        });
    }
};
