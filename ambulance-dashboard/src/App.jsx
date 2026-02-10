import React, { useState, useEffect } from "react";
import { MapPin, Phone, Activity, Search, Menu, ChevronRight, Heart, Wind, ArrowLeft } from "lucide-react";
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
        <Menu size={24} color="#333" />
        <span style={styles.brandTitle}>Control Center</span>
        <div style={styles.avatar}>A</div>
      </div>
      <div style={styles.sidebarContent}>
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
        <div style={{ ...styles.listContainer, display: isFullWidth ? 'grid' : 'flex', gridTemplateColumns: isFullWidth ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'flex', gap: isFullWidth ? '16px' : '8px' }}>
          {filteredList.map((item) => (
            <div key={item.id} style={{ ...styles.listItem, borderLeft: selectedId === item.id ? '4px solid #2D2F54' : '4px solid transparent', backgroundColor: selectedId === item.id ? '#F3F4F6' : 'white', border: isFullWidth ? '1px solid #E5E7EB' : '1px solid transparent', boxShadow: isFullWidth ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', }} onClick={() => setSelectedId(item.id)}>
              <div>
                <div style={styles.itemId}>{item.id}</div>
                <div style={{ ...styles.itemStatus, color: '#dc2626' }}>{item.status}</div>
                {isFullWidth && (<div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Driver: {item.driver}</div>)}
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
  if (activeAmbulance) {
    return (
      <div style={{ ...styles.main, display: 'flex' }}>
        {isMobile && (<button style={styles.backBtn} onClick={() => setSelectedId(null)}> <ArrowLeft size={20} /> Back to Fleet </button>)}
        {!isMobile && (<button style={styles.backBtn} onClick={() => setSelectedId(null)}> <ArrowLeft size={20} /> Back to Dashboard </button>)}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.sectionTitle}>{activeAmbulance.id} - Live Feed</h2>
            <span style={styles.driverName}>Driver: {activeAmbulance.driver}</span>
          </div>
          <div style={{ ...styles.statusBadge, backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            {activeAmbulance.status}
          </div>
        </div>
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
        <div style={styles.mapSection}>
          <div style={styles.mapHeader}>Live Location Tracking</div>
          <div style={styles.mapContainer}>
            <div style={styles.mapVisual}>
              <div style={styles.mapGridLines}></div>
              <div style={styles.pinWrapper}>
                <div style={styles.pinTooltip}>{activeAmbulance.id}</div>
                <MapPin size={48} color="#EF4444" fill="#EF4444" />
                <div style={styles.pulse}></div>
              </div>
            </div>
            <div style={styles.driverFooter}>
              <div style={styles.driverInfo}>
                <div style={styles.driverAvatar}>ID</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{activeAmbulance.driver}</div>
                  <div style={styles.driverStatus}>GPS Signal: Strong • Updated 1s ago</div>
                </div>
              </div>
              <button style={styles.callButton}><Phone size={20} color="white" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export default function App() {
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
          if (Array.isArray(data)) {
            const newActiveList = data.filter(d => d.patient && d.patient.isOnboard).map(d => ({
              id: d.vehicleId || d.ambulanceId,
              status: "EMERGENCY",
              driver: "Unknown Driver",
              location: { lat: d.location.latitude, lng: d.location.longitude },
              vitals: { hr: d.patient.vitals.heartRate, bp: d.patient.vitals.bloodPressure || "--/--", o2: d.patient.vitals.spO2 }
            }));
            setAmbulanceList(newActiveList);
          } else {
            setAmbulanceList(prevList => {
              if (data.patient && data.patient.isOnboard) {
                const exists = prevList.find(a => a.id === data.vehicleId);
                if (exists) {
                  return prevList.map(a => a.id === data.vehicleId ? {
                    ...a,
                    status: "EMERGENCY",
                    location: { lat: data.location.latitude, lng: data.location.longitude },
                    vitals: { hr: data.patient.vitals.heartRate, bp: data.patient.vitals.bloodPressure || "--/--", o2: data.patient.vitals.spO2 }
                  } : a);
                } else {
                  return [...prevList, {
                    id: data.vehicleId,
                    status: "EMERGENCY",
                    driver: "Unknown Driver",
                    location: { lat: data.location.latitude, lng: data.location.longitude },
                    vitals: { hr: data.patient.vitals.heartRate, bp: data.patient.vitals.bloodPressure || "--/--", o2: data.patient.vitals.spO2 }
                  }];
                }
              } else {
                return prevList.filter(a => a.id !== data.vehicleId);
              }
            });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };
    const intervalId = setInterval(fetchAmbulanceData, 500);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div style={styles.app}>
      <Sidebar isMobile={isMobile} selectedId={selectedId} setSelectedId={setSelectedId} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredList={filteredList} activeCount={ambulanceList.length} />
      <DetailView isMobile={isMobile} selectedId={selectedId} setSelectedId={setSelectedId} activeAmbulance={activeAmbulance} />
    </div>
  );
}
const styles = {
  app: { display: "flex", height: "100vh", width: "100vw", fontFamily: "'Inter', sans-serif", backgroundColor: "#F9FAFB", overflow: "hidden" },
  sidebar: { backgroundColor: "white", flexDirection: "column", zIndex: 20, flexShrink: 0, height: "100%", transition: "all 0.3s ease" },
  header: { padding: "20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F3F4F6", height: "70px" },
  brandTitle: { fontSize: "18px", fontWeight: "bold", color: "#111827", flex: 1 },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2D2F54", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" },
  sidebarContent: { padding: "24px", overflowY: "auto", flex: 1 },
  searchBox: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" },
  searchInput: { border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" },
  statsCard: { backgroundColor: "#2D2F54", color: "white", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 10px 15px -3px rgba(45, 47, 84, 0.2)" },
  statsLabel: { fontSize: "13px", opacity: 0.8 },
  statsNumber: { fontSize: "32px", fontWeight: "bold" },
  listContainer: { display: "flex", flexDirection: "column" },
  listItem: { padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" },
  itemId: { fontWeight: "700", color: "#111827", fontSize: "15px" },
  itemStatus: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
  main: { flex: 1, flexDirection: "column", padding: "30px", overflowY: "auto", gap: "24px", backgroundColor: "#F3F4F6", height: "100%", animation: "fadeIn 0.3s ease-in" },
  emptyState: { alignItems: "center", justifyContent: "center", color: "#9CA3AF" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px", opacity: 0.5 },
  emptyText: { fontSize: "18px", fontWeight: "500" },
  backBtn: { display: "flex", alignItems: "center", gap: "8px", border: "none", background: "transparent", marginBottom: "16px", fontSize: "14px", fontWeight: "600", color: "#4B5563", cursor: "pointer", padding: 0 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  sectionTitle: { fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" },
  driverName: { color: "#6B7280", fontSize: "14px", fontWeight: "500" },
  statusBadge: { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  vitalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  vitalCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "16px" },
  iconBox: { width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  vitalLabel: { fontSize: "13px", color: "#6B7280", fontWeight: "600", marginBottom: "2px" },
  vitalValue: { fontSize: "20px", fontWeight: "800", color: "#111827" },
  unit: { fontSize: "12px", color: "#9CA3AF", fontWeight: "500" },
  mapSection: { flex: 1, display: "flex", flexDirection: "column", gap: "12px", minHeight: "400px", borderRadius: "16px", overflow: "hidden" },
  mapHeader: { fontSize: "16px", fontWeight: "700", color: "#374151" },
  mapContainer: { flex: 1, backgroundColor: "white", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
  mapVisual: { flex: 1, backgroundColor: "#E5E7EB", backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "20px 20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  pinWrapper: { display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-20px)", zIndex: 10 },
  pinTooltip: { backgroundColor: "#111827", color: "white", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", marginBottom: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" },
  pulse: { width: "20px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.2)", animation: "pulse 2s infinite", position: "absolute", bottom: "-5px" },
  driverFooter: { padding: "16px 24px", backgroundColor: "white", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  driverInfo: { display: "flex", alignItems: "center", gap: "16px" },
  driverAvatar: { width: "40px", height: "40px", backgroundColor: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#6B7280" },
  driverStatus: { fontSize: "13px", color: "#16A34A", fontWeight: "500", marginTop: "2px" },
  callButton: { width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#111827", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s" }
};