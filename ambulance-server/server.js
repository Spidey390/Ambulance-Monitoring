require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -------------------- MongoDB Connection --------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// -------------------- Schema --------------------
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

// -------------------- POST Route (Add Ambulance) --------------------
app.post('/api/ambulance/add', async (req, res) => {
    try {
        const { ambulanceId } = req.body;

        if (!ambulanceId) {
            return res.status(400).json({ message: "ambulanceId required" });
        }

        const newAmbulance = new Ambulance({
            ambulanceId,
            hasPatient: false,
            heartRate: 0,
            spo2: 0,
            latitude: 0,
            longitude: 0,
            lastUpdated: new Date()
        });

        await newAmbulance.save();

        res.status(201).json({ message: "Ambulance added successfully" });

    } catch (error) {
        if (error.code === 11000) { // duplicate key
            res.status(409).json({ message: "Ambulance ID already exists" });
        } else {
            console.error("Add Error:", error);
            res.status(500).json({ message: "Server Error" });
        }
    }
});

// -------------------- DELETE Route (Delete Ambulance) --------------------
app.delete('/api/ambulance/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Ambulance ID required" });
        }

        const deletedAmbulance = await Ambulance.findOneAndDelete({ ambulanceId: id });

        if (!deletedAmbulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }

        res.status(200).json({ message: "Ambulance deleted successfully" });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// -------------------- POST Route (IoT Update) --------------------
app.post('/api/ambulance/update', async (req, res) => {
    try {
        const { ambulanceId, hasPatient, heartRate, spo2, latitude, longitude } = req.body;

        if (!ambulanceId) {
            return res.status(400).json({ message: "ambulanceId required" });
        }

        await Ambulance.findOneAndUpdate(
            { ambulanceId },
            {
                hasPatient,
                heartRate,
                spo2,
                latitude,
                longitude,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Data updated successfully" });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// -------------------- GET Route (Frontend Status) --------------------
app.get('/api/ambulance/status', async (req, res) => {
    try {
        const ambulances = await Ambulance.find({});
        const now = new Date();
        const OFFLINE_THRESHOLD = 10; // seconds

        const formatted = ambulances.map(amb => {

            let status = "OFFLINE";
            const seconds = (now - amb.lastUpdated) / 1000;

            if (seconds <= OFFLINE_THRESHOLD) {
                if (!amb.hasPatient) {
                    status = "IDLE";
                } else {
                    status = "EMERGENCY";
                }
            }

            return {
                vehicleId: amb.ambulanceId,
                status,
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

        res.json(formatted);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
