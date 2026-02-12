import React, { useState, useEffect } from "react";
import { MapPin, Phone, Activity, Search, ChevronRight, Heart, Wind, ArrowLeft, Target } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import ambulanceIcon from './assets/ambulance.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: ambulanceIcon,
    shadowUrl: iconShadow,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60]
});
L.Marker.prototype.options.icon = DefaultIcon;
const scrollbarStyles = `
::-webkit-scrollbar {
width: 8px;
}
::-webkit-scrollbar-track {
background: #F3F4F6;
}
::-webkit-scrollbar-thumb {
background: #2D2F54;
border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
background: #1e1f3a;
}
#sidebar-scroll::-webkit-scrollbar-track {
background: #ffffff;
}
`;
function RecenterControl({ lat, lng }) {
    const map = useMap();
    const handleRecenter = () => {
        map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    };
    useEffect(() => {
        handleRecenter();
    }, [lat, lng]);
    return (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "20px", marginRight: "10px", zIndex: 1000, pointerEvents: "auto" }}>
            <div className="leaflet-control">
                <button
                    onClick={handleRecenter}
                    style={{
                        backgroundColor: "white",
                        padding: "0 12px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        fontWeight: "600",
                        fontSize: "14px",
                        color: "#333"
                    }}
                >
                    <Target size={18} color="#333" />
                    <span>Recenter</span>
                </button>
            </div>
        </div>
    );
}
const useWindowSize = () => {
    const [size, setSize] = useState([1200, 800]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSize([window.innerWidth, window.innerHeight]);
            const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);
    return size;
};
const Sidebar = ({ isMobile, selectedId, setSelectedId, searchTerm, setSearchTerm, filteredList, activeCount }) => {
    const isFullWidth = !selectedId && !isMobile;
    return (
        <div style={{ ...styles.sidebar, display: isMobile && selectedId ? 'none' : 'flex', width: isFullWidth ? '100%' : '100%', flex: isFullWidth ? 1 : 'unset', maxWidth: isFullWidth ? '100%' : '320px', borderRight: isFullWidth ? 'none' : '1px solid #E5E7EB' }}>
            <div style={styles.header}>
                <span style={styles.brandTitle}>Ambulance Control Center</span>
            </div>
            <div id="sidebar-scroll" style={styles.sidebarContent}>
                <div style={{ display: 'flex', gap: '20px', flexDirection: isFullWidth ? 'row' : 'column', marginBottom: '20px' }}>
                    <div style={{ ...styles.searchBox, flex: isFullWidth ? 1 : 'unset', marginBottom: 0 }}>
                        <Search size={18} color="#888" />
                        <input style={styles.searchInput} placeholder="Search ambulance ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div style={{ ...styles.statsCard, marginBottom: 0, minWidth: isFullWidth ? '250px' : 'unset' }}>
                        <span style={styles.statsLabel}>Active Ambulances</span>
                        <span style={styles.statsNumber}>{activeCount}</span>
                    </div>
                </div>
                <div style={{ ...styles.listContainer, display: isFullWidth ? 'grid' : 'grid', gridTemplateColumns: isFullWidth ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: isFullWidth ? '16px' : '8px' }}>
                    {filteredList.map((item) => (
                        <div key={item.id} style={{ ...styles.listItem, borderLeft: selectedId === item.id ? '4px solid #2D2F54' : '4px solid transparent', backgroundColor: selectedId === item.id ? '#F3F4F6' : 'white', border: isFullWidth ? '1px solid #E5E7EB' : '1px solid transparent', boxShadow: isFullWidth ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', cursor: item.status === "OFFLINE" ? "not-allowed" : "pointer", opacity: item.status === "OFFLINE" ? 0.6 : 1 }} onClick={item.status !== "OFFLINE" ? () => setSelectedId(item.id) : undefined}>
                            <div>
                                <div style={styles.itemId}>{item.id}</div>
                                <div style={{ ...styles.itemStatus, color: item.status === 'IDLE' ? 'green' : item.status === 'OFFLINE' ? 'gray' : '#dc2626' }}>{item.status}</div>
                            </div>
                            <ChevronRight size={20} color="#ccc" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
const DetailView = ({ isMobile, selectedId, setSelectedId, activeAmbulance }) => {
    if (!activeAmbulance) return null;
    if (isMobile && !selectedId) return null;
    return (
        <div style={{ ...styles.main, display: 'flex' }}>
            {isMobile && (<button style={styles.backBtn} onClick={() => setSelectedId(null)}> <ArrowLeft size={20} /> Back to Fleet </button>)}
            {!isMobile && (<button style={styles.backBtn} onClick={() => setSelectedId(null)}> <ArrowLeft size={20} /> Back to Dashboard </button>)}
            <div style={styles.topBar}>
                <div>
                    <h2 style={styles.sectionTitle}>{activeAmbulance.id} - Live Feed</h2>
                </div>
                <div style={{ ...styles.statusBadge, backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    {activeAmbulance.status}
                </div>
            </div>
            {activeAmbulance.vitals && (
                <div style={styles.vitalsGrid}>
                    <div style={styles.vitalCard}>
                        <div style={{ ...styles.iconBox, backgroundColor: '#FEF2F2', color: '#EF4444' }}><Heart size={24} /></div>
                        <div><div style={styles.vitalLabel}>Heart Rate</div><div style={styles.vitalValue}>{activeAmbulance.vitals.hr} <span style={styles.unit}>bpm</span></div></div>
                    </div>
                    <div style={styles.vitalCard}>
                        <div style={{ ...styles.iconBox, backgroundColor: '#EFF6FF', color: '#3B82F6' }}><Activity size={24} /></div>
                        <div><div style={styles.vitalLabel}>Blood Pressure</div><div style={styles.vitalValue}>{activeAmbulance.vitals.bp} <span style={styles.unit}>mmHg</span></div></div>
                    </div>
                    <div style={styles.vitalCard}>
                        <div style={{ ...styles.iconBox, backgroundColor: '#F0FDF4', color: '#22C55E' }}><Wind size={24} /></div>
                        <div><div style={styles.vitalLabel}>Oxygen Level</div><div style={styles.vitalValue}>{activeAmbulance.vitals.o2} <span style={styles.unit}>%</span></div></div>
                    </div>
                </div>
            )}
            <div style={styles.mapSection}>
                <div style={styles.mapHeader}>Live Location Tracking</div>
                <div style={styles.mapContainer}>
                    <MapContainer
                        center={[activeAmbulance.location.lat, activeAmbulance.location.lng]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        attributionControl={false}
                    >
                        <FixMapSize />
                        <RecenterControl lat={activeAmbulance.location.lat} lng={activeAmbulance.location.lng} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap contributors"
                        />
                        <Marker
                            position={[
                                activeAmbulance.location.lat,
                                activeAmbulance.location.lng
                            ]}
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};
export default function AmbulanceDashboard() {
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [ambulanceList, setAmbulanceList] = useState([]);
    const [width] = useWindowSize();
    const isMobile = width < 768;
    const activeAmbulance = ambulanceList.find(a => a.id === selectedId);
    const filteredList = ambulanceList.filter(a => a.id.toLowerCase().includes(searchTerm.toLowerCase()));
    useEffect(() => {
        const fetchAmbulanceData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/ambulance/status');
                if (!response.ok) return;
                const data = await response.json();
                if (data) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    setAmbulanceList(prevList => {
                        const prevMap = new Map(prevList.map(item => [item.id, item]));
                        dataArray.forEach(d => {
                            if (!d.vehicleId && !d.ambulanceId) return;
                            const id = d.vehicleId || d.ambulanceId;
                            const status = d.status;
                            const location = { lat: parseFloat(d.location.latitude), lng: parseFloat(d.location.longitude) };
                            let vitals = null;
                            if (d.patient && d.patient.isOnboard) {
                                vitals = {
                                    hr: d.patient.vitals.heartRate,
                                    bp: d.patient.vitals.bloodPressure || "--/--",
                                    o2: d.patient.vitals.spO2
                                };
                            }
                            prevMap.set(id, {
                                id: id,
                                status: status,
                                location: location,
                                vitals: vitals
                            });
                        });
                        const newList = Array.from(prevMap.values());
                        newList.sort((a, b) => {
                            const statusOrder = { EMERGENCY: 0, IDLE: 1, OFFLINE: 2 };
                            const statusA = statusOrder[a.status] || 0;
                            const statusB = statusOrder[b.status] || 0;
                            if (statusA !== statusB) return statusA - statusB;
                            return a.id.localeCompare(b.id);
                        });
                        return newList;
                    });
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };
        const intervalId = setInterval(fetchAmbulanceData, 1000);
        return () => clearInterval(intervalId);
    }, []);
    return (
        <div style={styles.app}>
            <style>{scrollbarStyles}</style>
            <Sidebar isMobile={isMobile} selectedId={selectedId} setSelectedId={setSelectedId} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredList={filteredList} activeCount={ambulanceList.length} />
            <DetailView isMobile={isMobile} selectedId={selectedId} setSelectedId={setSelectedId} activeAmbulance={activeAmbulance} />
        </div>
    );
}
function FixMapSize() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}
const styles = {
    app: { display: "flex", height: "100vh", width: "100vw", fontFamily: "'Inter', sans-serif", backgroundColor: "#F9FAFB", overflow: "hidden" },
    sidebar: { backgroundColor: "white", flexDirection: "column", zIndex: 20, flexShrink: 0, height: "100%", transition: "all 0.3s ease" },
    header: { padding: "16px 20px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #F3F4F6", minHeight: "80px" },
    brandTitle: { fontSize: "22px", fontWeight: "bold", color: "#111827", textAlign: "center", lineHeight: "1.2", maxWidth: "100%", wordWrap: "break-word" },
    sidebarContent: { padding: "24px", overflowY: "auto", flex: 1 },
    searchBox: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" },
    searchInput: { border: "none", outline: "none", width: "100%", fontSize: "20px", color: "black", background: "transparent" },
    statsCard: { backgroundColor: "#2D2F54", color: "white", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 10px 15px -3px rgba(45, 47, 84, 0.2)" },
    statsLabel: { fontSize: "13px", opacity: 0.8 },
    statsNumber: { fontSize: "32px", fontWeight: "bold" },
    listContainer: { display: "flex", flexDirection: "column" },
    listItem: { padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" },
    itemId: { fontWeight: "700", color: "#111827", fontSize: "15px" },
    itemStatus: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
    main: { flex: 1, flexDirection: "column", padding: "30px", overflowY: "auto", gap: "24px", backgroundColor: "#F3F4F6", height: "100%", animation: "fadeIn 0.3s ease-in" },
    backBtn: { display: "flex", alignItems: "center", gap: "8px", border: "none", background: "transparent", marginBottom: "16px", fontSize: "14px", fontWeight: "600", color: "#4B5563", cursor: "pointer", padding: 0 },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    sectionTitle: { fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" },
    statusBadge: { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
    vitalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
    vitalCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "16px" },
    iconBox: { width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    vitalLabel: { fontSize: "13px", color: "#6B7280", fontWeight: "600", marginBottom: "2px" },
    vitalValue: { fontSize: "20px", fontWeight: "800", color: "#111827" },
    unit: { fontSize: "12px", color: "#9CA3AF", fontWeight: "500" },
    mapSection: { display: "flex", flexDirection: "column", height: "60vh" },
    mapHeader: { fontSize: "16px", fontWeight: "700", color: "#374151" },
    mapContainer: { flex: 1, minHeight: 0, borderRadius: "16px", overflow: "hidden", border: "1px solid #E5E7EB" },
};