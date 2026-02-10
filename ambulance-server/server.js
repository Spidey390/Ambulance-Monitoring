require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Cloud (Atlas)'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schema ---
const ambulanceSchema = new mongoose.Schema({
    ambulanceId: { type: String, required: true, unique: true },
    hasPatient: { type: Boolean, default: false },
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

// --- Routes ---

// 1. POST: IoT Device sends data here (Updates specific ambulance)
app.post('/api/ambulance/update', async (req, res) => {
    try {
        const { ambulanceId, hasPatient, heartRate, spo2, latitude, longitude } = req.body;

        if (!ambulanceId) return res.status(400).send({ message: "ambulanceId required" });

        // Find and update the specific ambulance
        const updatedData = await Ambulance.findOneAndUpdate(
            { ambulanceId: ambulanceId },
            {
                $set: {
                    hasPatient: hasPatient,
                    heartRate: heartRate,
                    spo2: spo2,
                    latitude: latitude,
                    longitude: longitude,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );

        res.status(200).send({ message: "Data updated" });

    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).send({ message: "Server Error" });
    }
});

// 2. GET: Frontend fetches data here (Returns ALL Ambulances)
app.get('/api/ambulance/status', async (req, res) => {
    try {
        // CHANGE: Use .find() instead of .findOne() to get the whole list
        const allAmbulances = await Ambulance.find({});

        if (!allAmbulances || allAmbulances.length === 0) return res.json([]);

        // Format the list for the Frontend
        const formattedList = allAmbulances.map(amb => {
            // Calculate status for each ambulance
            let status = "IDLE";
            if (amb.hasPatient) {
                status = (amb.heartRate > 100 || amb.heartRate < 60) ? "EMERGENCY" : "EN_ROUTE";
            }

            return {
                vehicleId: amb.ambulanceId,
                status: status,
                lastUpdated: amb.lastUpdated,
                location: {
                    latitude: amb.latitude,
                    longitude: amb.longitude
                },
                patient: {
                    isOnboard: amb.hasPatient,
                    vitals: {
                        heartRate: amb.heartRate,
                        spO2: amb.spo2,
                        bloodPressure: "--/--"
                    }
                }
            };
        });

        res.json(formattedList);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).send({ message: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});