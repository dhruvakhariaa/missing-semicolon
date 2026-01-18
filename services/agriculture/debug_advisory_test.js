const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Farmer = require('./src/models/Farmer');

const runDebug = async () => {
    try {
        console.log("1. Connecting to DB...");
        console.log("URI:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected!");

        console.log("2. Fetching Farmers...");
        const farmers = await Farmer.find({});
        console.log(`Found ${farmers.length} farmers.`);

        if (farmers.length > 0) {
            const f = farmers[0];
            console.log("\n=== TEST FARMER ===");
            console.log("ID:", f._id.toString());
            console.log("Name:", f.name);
            console.log("Parcels Count:", f.landParcels.length);

            f.landParcels.forEach((p, i) => {
                console.log(`  Parcel ${i}: ${p.currentCrop} (Sown: ${p.sowingDate})`);
            });

            // Simulate logic
            console.log("\n=== LOGIC SIMULATION ===");
            const parcels = f.landParcels.filter(p => p.currentCrop);
            if (parcels.length > 0) {
                const details = parcels.map(p => {
                    const daysSown = p.sowingDate
                        ? Math.floor((new Date() - new Date(p.sowingDate)) / (1000 * 60 * 60 * 24))
                        : 0;
                    let stage = "Vegetative";
                    if (daysSown < 15) stage = "Germination";
                    else if (daysSown > 60) stage = "Flowering/Fruiting";
                    return `${p.currentCrop} (Age: ${daysSown} days, Stage: ${stage})`;
                });
                console.log("Generated Context:", details.join(", "));
            } else {
                console.log("No active crops found for this farmer.");
            }
        } else {
            console.log("No farmers found in DB.");
        }

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
