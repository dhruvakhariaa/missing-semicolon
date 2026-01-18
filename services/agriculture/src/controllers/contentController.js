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
        const locationQuery = req.query.location || 'Paithan';
        let latitude = 19.48;
        let longitude = 75.38;
        let finalLocationName = locationQuery;

        // Geocoding Step: Get coordinates from location name
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=en&format=json`;
            const geoData = await fetchWeather(geoUrl);

            if (geoData.results && geoData.results.length > 0) {
                latitude = geoData.results[0].latitude;
                longitude = geoData.results[0].longitude;
                finalLocationName = `${geoData.results[0].name}, ${geoData.results[0].admin1 || ''}`;
            }
        } catch (geoError) {
            console.warn('Geocoding failed, using defaults:', geoError.message);
        }

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

        const forecast = data.daily.time.map((date, index) => {
            const d = new Date(date);
            let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (index === 0) dayName = 'Today';
            if (index === 1) dayName = 'Tomorrow';

            return {
                day: dayName,
                temp: Math.round(data.daily.temperature_2m_max[index]),
                condition: getWeatherCondition(data.daily.weather_code[index]),
                rainChance: data.daily.precipitation_probability_max?.[index] || 0,
                alert: getAlert(data.daily.weather_code[index], data.daily.temperature_2m_max[index])
            };
        });

        res.status(200).json({
            success: true,
            data: {
                location: finalLocationName,
                forecast: forecast.slice(0, 7)
            }
        });
    } catch (error) {
        console.error('Weather Fetch Error:', error.message);

        // Dynamic Fallback
        const fallbackForecast = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (i === 0) dayName = 'Today';
            if (i === 1) dayName = 'Tomorrow';

            return {
                day: dayName,
                temp: 30 - (i % 3), // Varied temp
                condition: i === 5 ? 'Rain' : 'Sunny',
                rainChance: i === 5 ? 60 : 0,
                alert: i === 5 ? 'Rain Advisory' : 'Normal'
            };
        });

        res.status(200).json({
            success: true,
            data: {
                location: req.query.location || 'Paithan',
                forecast: fallbackForecast
            }
        });
    }
};
