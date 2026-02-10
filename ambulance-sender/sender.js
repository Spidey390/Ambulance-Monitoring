const API_URL = "http://localhost:3000/api/ambulance/update";

const ambulances = {};

// Initialize 10 ambulances
for (let i = 1; i <= 10; i++) {
    const id = `AMB_${String(i).padStart(3, "0")}`;

    ambulances[id] = {
        ambulanceId: id,
        hasPatient: Math.random() < 0.5
    };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 6) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// 🔁 Update + Send data every 1 minute
async function updateAndSend() {
    console.log("⏱️ Updating ambulance data (1 minute interval)...");

    for (const a of Object.values(ambulances)) {

        // Change patient status every minute
        a.hasPatient = Math.random() < 0.5;

        const payload = {
            ambulanceId: a.ambulanceId,
            hasPatient: a.hasPatient,
            heartRate: a.hasPatient ? getRandomInt(60, 120) : 0,
            spo2: a.hasPatient ? getRandomInt(90, 100) : 0,
            latitude: getRandomFloat(12.90, 13.05),
            longitude: getRandomFloat(77.50, 77.70)
        };

        try {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log(
                `🚑 ${a.ambulanceId} | Patient: ${a.hasPatient} | HR: ${payload.heartRate}`
            );
        } catch (err) {
            console.error(`❌ Failed ${a.ambulanceId}`, err.message);
        }
    }
}

// Run once immediately
updateAndSend();

// Run every 1 minute (60,000 ms)
setInterval(updateAndSend, 60000);
