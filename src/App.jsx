import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, Activity, MapPin, Map, RefreshCw } from 'lucide-react';

function App() {
  const [espIp, setEspIp] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [status, setStatus] = useState('safe'); // 'safe' or 'danger'
  const [logs, setLogs] = useState([]);
  
  // New states for the 5-second demo trick
  const [demoActive, setDemoActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const pollIntervalRef = useRef(null);

  // Function to generate a random coordinate near a base location (e.g. New York)
  const generateDemoCoords = () => {
    const baseLat = 40.7128;
    const baseLng = -74.0060;
    
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

  const startDemoTrick = () => {
    setDemoActive(true);
    setCountdown(5);
    
    let counter = 5;
    const timer = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      
      if (counter <= 0) {
        clearInterval(timer);
        setDemoActive(false);
        handlePotholeDetected(); // Trigger the fake pothole!
      }
    }, 1000);
  };

  const togglePolling = () => {
    if (isPolling) {
      clearInterval(pollIntervalRef.current);
      setIsPolling(false);
    } else {
      if (!espIp && !espIp.trim()) {
        alert("Please enter the ESP32 IP address.");
        return;
      }
      setIsPolling(true);
      
      // Start polling the ESP32
      pollIntervalRef.current = setInterval(async () => {
        try {
          // Expecting ESP32 to return { "pothole": true/false }
          const response = await fetch(`http://${espIp}/status`, {
            method: 'GET',
            mode: 'cors'
          });
          const data = await response.json();
          
          if (data.pothole && status !== 'danger') {
            handlePotholeDetected();
          }
        } catch (err) {
          console.error("Failed to fetch from ESP32", err);
          // Don't auto-stop polling, it might just be a temporary network hiccup
        }
      }, 1000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

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

      <div className="glass-panel">
        <div className="input-group">
          <label>Connect to ESP32 (Local Network)</label>
          <div className="input-field">
            <input 
              type="text" 
              placeholder="e.g. 192.168.1.15" 
              value={espIp}
              onChange={(e) => setEspIp(e.target.value)}
              disabled={isPolling}
            />
            <button 
              className={`btn ${isPolling ? 'btn-danger' : ''}`}
              onClick={togglePolling}
            >
              <Activity size={18} />
              {isPolling ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
        
        {/* The Magic Presentation Button */}
        {!demoActive ? (
          <button className="btn" style={{width: '100%', background: '#10b981'}} onClick={startDemoTrick}>
            <Activity size={18} />
            Start Hardware Presentation Demo
          </button>
        ) : (
          <div style={{textAlign: 'center', padding: '12px', color: '#10b981', fontWeight: 'bold'}}>
            Detecting anomaly in {countdown} seconds... (Get ready to jerk the hardware!)
          </div>
        )}
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
