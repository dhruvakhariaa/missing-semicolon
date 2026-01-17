const mongoose = require('mongoose');
const Farmer = require('./src/models/Farmer');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agriculture_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        const farmers = await Farmer.find({});
        console.log(`\nFound ${farmers.length} farmers.`);

        farmers.forEach(f => {
            console.log(`\n-----------------------------------`);
            console.log(`Farmer: ${f.name} (ID: ${f._id})`);
            console.log(`Enrolled Schemes: ${f.enrolledSchemes ? f.enrolledSchemes.length : 0}`);
            if (f.enrolledSchemes && f.enrolledSchemes.length > 0) {
                console.log(JSON.stringify(f.enrolledSchemes, null, 2));
            }
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

connectDB();
