import { useEffect, useState } from "react";

export default function AmbulanceDashboard() {
    const [data, setData] = useState(null);
    const [lastHeartbeat, setLastHeartbeat] = useState(null);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/ambulance/status");
                if (!res.ok) throw new Error("Server error");

                const jsonData = await res.json();
                setData(jsonData);
                setLastHeartbeat(new Date(jsonData.lastUpdated).toLocaleTimeString());
            } catch (err) {
                console.error("Connection lost:", err);
            }
        };

        // Initial fetch
        fetchTelemetry();

        // Poll for real-time updates (simulating low latency) [cite: 29]
        const interval = setInterval(fetchTelemetry, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return <div style={styles.loading}>Connecting to Control Center...</div>;

    const { vehicleId, status, location, patient } = data;
    const isEmergency = status === "EMERGENCY";

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>🚑 Emergency Response Control Center</h1>
                    <p style={styles.subtitle}>Real-time IoT Monitoring System</p>
                </div>
                <div style={{
                    ...styles.statusBadge,
                    backgroundColor: isEmergency ? '#ff4d4f' : '#52c41a',
                    animation: isEmergency ? 'pulse 1.5s infinite' : 'none'
                }}>
                    {status}
                </div>
            </header>

            <div style={styles.gridContainer}>
                {/* Left Column: Vehicle Tracking [cite: 44] */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>📍 Live Tracking</h2>
                    <div style={styles.infoRow}>
                        <strong>Vehicle ID:</strong> <span>{vehicleId}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <strong>Location:</strong>
                        <span>{location.latitude}, {location.longitude}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <strong>Heading:</strong> <span>{location.heading}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <strong>Last Update:</strong> <span>{lastHeartbeat}</span>
                    </div>
                    <div style={styles.mapPlaceholder}>
                        [Map Visualization Placeholder]
                    </div>
                </div>

                {/* Right Column: Patient Vitals [cite: 46, 47] */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>❤️ Patient Vitals</h2>
                    {patient.isOnboard ? (
                        <div style={styles.vitalsGrid}>
                            <div style={styles.vitalBox}>
                                <span style={styles.vitalLabel}>Heart Rate</span>
                                <span style={styles.vitalValue}>{patient.vitals.heartRate} <small>bpm</small></span>
                            </div>
                            <div style={styles.vitalBox}>
                                <span style={styles.vitalLabel}>SpO2</span>
                                <span style={styles.vitalValue}>{patient.vitals.spO2} <small>%</small></span>
                            </div>
                            <div style={styles.vitalBox}>
                                <span style={styles.vitalLabel}>Blood Pressure</span>
                                <span style={styles.vitalValue}>{patient.vitals.bloodPressure}</span>
                            </div>
                            <div style={styles.vitalBox}>
                                <span style={styles.vitalLabel}>Temperature</span>
                                <span style={styles.vitalValue}>{patient.vitals.temperature} <small>°C</small></span>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>No Patient Data - Unit is Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styling to match a professional Dashboard aesthetic
const styles = {
    container: {
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.5rem",
        color: "#666"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    title: {
        margin: 0,
        color: "#1f1f1f",
        fontSize: "24px",
    },
    subtitle: {
        margin: "5px 0 0 0",
        color: "#888",
        fontSize: "14px",
    },
    statusBadge: {
        padding: "10px 20px",
        borderRadius: "20px",
        color: "#fff",
        fontWeight: "bold",
        letterSpacing: "1px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    cardTitle: {
        marginTop: 0,
        borderBottom: "2px solid #f0f0f0",
        paddingBottom: "10px",
        marginBottom: "20px",
        color: "#333",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "15px",
        fontSize: "16px",
        color: "#555",
    },
    mapPlaceholder: {
        width: "100%",
        height: "150px",
        backgroundColor: "#e6f7ff",
        border: "2px dashed #1890ff",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1890ff",
        marginTop: "20px",
    },
    vitalsGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
    },
    vitalBox: {
        backgroundColor: "#fafafa",
        padding: "15px",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid #eee",
    },
    vitalLabel: {
        display: "block",
        fontSize: "12px",
        color: "#888",
        textTransform: "uppercase",
        marginBottom: "5px",
    },
    vitalValue: {
        fontSize: "22px",
        fontWeight: "bold",
        color: "#1f1f1f",
    },
    emptyState: {
        textAlign: "center",
        padding: "40px",
        color: "#aaa",
        fontStyle: "italic",
    }
};