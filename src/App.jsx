import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, Activity, MapPin, Map, RefreshCw } from 'lucide-react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('safe'); // 'safe' or 'danger'
  const [logs, setLogs] = useState([]);

  // Function to generate a random coordinate near the user's geotag location
  const generateDemoCoords = () => {
    const baseLat = 18.454212;
    const baseLng = 73.866331;
    
    // Add small random offset
    const lat = baseLat + (Math.random() - 0.5) * 0.01;
    const lng = baseLng + (Math.random() - 0.5) * 0.01;
    
    return { lat: lat.toFixed(5), lng: lng.toFixed(5) };
  };

  const handlePotholeDetected = () => {
    setStatus('danger');
    const coords = generateDemoCoords();
    
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      ...coords
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    // Auto reset status after 3 seconds
    setTimeout(() => {
      setStatus('safe');
    }, 3000);
  };

  const handleConnectClick = () => {
    if (isConnected) return; // Prevent multiple clicks
    
    setIsConnected(true);
    
    // Secret continuous timer every 5 seconds
    setInterval(() => {
      handlePotholeDetected(); // Trigger the fake pothole continuously!
    }, 5000);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Vectra RoadScan</h1>
        <p>Real-time Pothole Detection System</p>
      </div>

      <div className="glass-panel">
        <div className={`status-ring ${status}`}>
          {status === 'safe' ? (
            <ShieldCheck size={60} className="icon" />
          ) : (
            <AlertTriangle size={60} className="icon" />
          )}
        </div>
        
        <h2 className="status-text">
          {status === 'safe' ? 'Road is Clear' : 'POTHOLE DETECTED!'}
        </h2>
        <p className="status-subtext">
          {status === 'safe' 
            ? 'Sensors active. Scanning for anomalies...' 
            : 'Severe anomaly detected. Logging coordinates.'}
        </p>
      </div>

      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
        <button 
          className="btn" 
          style={{
            width: '100%', 
            padding: '16px',
            fontSize: '16px',
            background: isConnected ? '#10b981' : 'var(--accent-color)',
            cursor: isConnected ? 'default' : 'pointer',
            opacity: isConnected ? 0.9 : 1
          }} 
          onClick={handleConnectClick}
        >
          <Activity size={20} />
          {isConnected ? 'ESP32 Connected via Local Network' : 'Connect to ESP32 Hardware'}
        </button>
      </div>

      <div className="glass-panel">
        <div className="input-group" style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Map size={14} /> 
            Detection Log
          </label>
        </div>
        
        <div className="log-container">
          {logs.length === 0 ? (
            <div className="empty-state">
              No potholes detected yet.
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-info">
                  <span className="log-title">
                    <AlertTriangle size={14} /> 
                    Hazard Logged
                  </span>
                  <span className="log-coords">
                    Lat: {log.lat}, Lng: {log.lng}
                  </span>
                </div>
                <span className="log-time">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
