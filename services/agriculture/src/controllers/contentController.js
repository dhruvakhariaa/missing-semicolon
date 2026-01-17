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
                        eligibility: 'Small and marginal farmers holding up to 2 hectares (approx 5 acres) land',
                        benefits: 'Rs. 2000 every 4 months',
                        criteria: {
                            maxArea: 5.0, // acres
                            type: 'land_holding'
                        }
                    },
                    {
                        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                        description: 'Crop insurance scheme regarding non-preventable natural risks.',
                        eligibility: 'Farmers growing Wheat, Rice, Cotton or Sugarcane',
                        benefits: 'Insurance cover against natural risks',
                        criteria: {
                            requiredCrops: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Soybean'],
                            type: 'crop_based'
                        }
                    },
                    {
                        name: 'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)',
                        description: 'Coverage of irrigation water to every farm (Har Khet Ko Pani).',
                        eligibility: 'Farmers with cultivable land willing to install drip/sprinkler',
                        benefits: 'Subsidy on installation of Drip/Sprinkler irrigation systems',
                        criteria: {
                            minArea: 0.5,
                            type: 'irrigation'
                        }
                    },
                    {
                        name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
                        description: 'Promotion of commercial organic production through certified organic farming.',
                        eligibility: 'Cluster of farmers with 50 acres of land',
                        benefits: 'Financial assistance of Rs 50,000 per hectare/3 years',
                        criteria: {
                            minArea: 1, // Individual entry requirement usually smaller
                            type: 'general'
                        }
                    },
                    {
                        name: 'Soil Health Card Scheme',
                        description: 'Government issued card giving details of soil nutrient status.',
                        eligibility: 'All farmers',
                        benefits: 'Personalized fertilizer recommendations',
                        criteria: {
                            type: 'all'
                        }
                    },
                    {
                        name: 'Kisan Credit Card (KCC)',
                        description: 'A dedicated credit card scheme for farmers to access short-term loans.',
                        eligibility: 'All farmers, individual/joint borrowers who are owner cultivators.',
                        benefits: 'Short term credit for cultivation and other needs',
                        criteria: {
                            type: 'all'
                        }
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
const https = require('https');

// Helper to fetch data via HTTPS
const fetchWeather = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

exports.getWeather = async (req, res) => {
    try {
        const village = req.query.location || 'Local Village';

        // Paithan (Aurangabad) coordinates
        const latitude = 19.48;
        const longitude = 75.38;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current_weather=true&timezone=auto`;

        const data = await fetchWeather(url);

        if (!data.daily) {
            console.error('Weather data missing daily forecast:', data);
            throw new Error('Weather data unavailable');
        }

        // Map WMO codes to readable conditions
        const getWeatherCondition = (code) => {
            if (code <= 1) return 'Sunny';
            if (code <= 3) return 'Partly Cloudy';
            if (code <= 48) return 'Foggy';
            if (code <= 65) return 'Rain';
            if (code <= 77) return 'Snow';
            if (code <= 99) return 'Thunderstorm';
            return 'Cloudy';
        };

        const getAlert = (code, maxTemp) => {
            if (maxTemp > 40) return 'Heatwave Alert';
            if (code >= 95) return 'Severe Thunderstorm Warning';
            if (code >= 60) return 'Rain Advisory'; // Lower threshold for testing
            return 'Normal';
        };

        const forecast = data.daily.time.map((date, index) => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(data.daily.temperature_2m_max[index]),
            condition: getWeatherCondition(data.daily.weather_code[index]),
            rainChance: data.daily.precipitation_probability_max?.[index] || 0,
            alert: getAlert(data.daily.weather_code[index], data.daily.temperature_2m_max[index])
        }));

        // Add current weather to the response if needed, 
        // but for now keeping the forecast structure compliant with frontend

        res.status(200).json({
            success: true,
            data: {
                location: village,
                forecast: forecast.slice(0, 5) // Send next 5 days
            }
        });
    } catch (error) {
        console.error('Weather Fetch Error:', error.message);
        // Fallback mock data only if absolutely necessary
        res.status(200).json({
            success: true,
            data: {
                location: req.query.location || 'Paithan',
                forecast: [
                    { day: 'Today', temp: 30, condition: 'Sunny', rainChance: 0, alert: 'Normal' },
                    { day: 'Tomorrow', temp: 29, condition: 'Partly Cloudy', rainChance: 10, alert: 'Normal' },
                    { day: 'Wed', temp: 28, condition: 'Cloudy', rainChance: 30, alert: 'Normal' }
                ]
            }
        });
    }
};
