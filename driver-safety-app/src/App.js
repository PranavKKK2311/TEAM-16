import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import './App.css';

const App = () => {
  const [heartRate, setHeartRate] = useState(75);
  const [speed, setSpeed] = useState(30);
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [alertMessage, setAlertMessage] = useState("✅ Normal");
  const [emergencyContact, setEmergencyContact] = useState("911");
  const [noResponseTimer, setNoResponseTimer] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userResponded, setUserResponded] = useState(true);

  useEffect(() => {
    const simulateData = () => {
      const cases = [
        { heartRate: Math.floor(Math.random() * 20) + 40, speed: Math.floor(Math.random() * 10) + 20 }, 
        { heartRate: Math.floor(Math.random() * 30) + 80, speed: Math.floor(Math.random() * 15) + 40 }, 
        { heartRate: Math.floor(Math.random() * 20) + 110, speed: Math.floor(Math.random() * 20) + 60 }, 
      ];
      const testCase = cases[Math.floor(Math.random() * cases.length)];
      setHeartRate(testCase.heartRate);
      setSpeed(testCase.speed);
    };
    const interval = setInterval(simulateData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const triggerSOSIfNoResponse = useCallback(() => {
    if (!noResponseTimer) {
      const timer = setTimeout(() => {
        if (!userResponded) {
          sendSOS();
        }
      }, 10000); 
      setNoResponseTimer(timer);
    }
  }, [userResponded, noResponseTimer]);

  useEffect(() => {
    if (heartRate < 60) {
      setAlertMessage("⚠️ Low Heart Rate! Are you okay?");
      setUserResponded(false);
      triggerSOSIfNoResponse();
    } else if (heartRate > 100) {
      setAlertMessage("⚠️ High Heart Rate! Slow down and take deep breaths.");
    } else {
      setAlertMessage("✅ Normal");
      setUserResponded(true);
    }
  }, [heartRate, triggerSOSIfNoResponse]);

  const sendSOS = () => {
    setAlertMessage(`🚨 EMERGENCY: Sending SOS to ${emergencyContact}!`);
  };

  const calculateEfficientRoute = () => {
    if (origin === "" || destination === "") {
      setAlertMessage("⚠️ Please enter both origin and destination.");
      return;
    }
    setMapLoaded(true);
  };

  const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(255,0,0,0.2)' };
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="app-container">
      <h1 className="title">Driver Dashboard</h1>
      <div className="dashboard">
        <div className={`stat-box heart-rate ${heartRate < 60 || heartRate > 100 ? 'warning' : ''}`}>Heart Rate: {heartRate} BPM</div>
        <div className="stat-box speed">Speed: {speed} mph</div>
      </div>
      <div className="dashboard-alert">{alertMessage}</div>
      <div className="route-planner">
        <h2>EV-Optimized Route Planner</h2>
        <div className="input-group">
          <input type="text" className="input-field" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Enter starting location" />
          <input type="text" className="input-field" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
        </div>
        <button className="primary-button" onClick={calculateEfficientRoute}>Find Battery-Efficient Route</button>
        <LoadScript googleMapsApiKey="AIzaSyAbsE0mdIG82NQzYOk72MkCDoN36js7bqM" onLoad={() => setMapLoaded(true)}>
          {mapLoaded && (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={13}>
              {origin && destination && (
                <DirectionsService options={{ origin, destination, travelMode: 'DRIVING' }} callback={(response) => {
                  if (response?.status === 'OK') {
                    setDirections(response);
                  }
                }} />
              )}
              {directions && <DirectionsRenderer options={{ directions }} />}
            </GoogleMap>
          )}
        </LoadScript>
      </div>
    </div>
  );
};

export default App;