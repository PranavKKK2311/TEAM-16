import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const DriverSafetyApp = () => {
  const [heartRate, setHeartRate] = useState(75);
  const [speed, setSpeed] = useState(0);
  const [location, setLocation] = useState(null);
  const [userResponded, setUserResponded] = useState(true);
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("911");
  const [noResponseTimer, setNoResponseTimer] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const simulateHeartRateData = () => {
      const randomChange = Math.floor(Math.random() * 5) - 2;
      setHeartRate(prevRate => Math.max(40, Math.min(120, prevRate + randomChange)));
      const speedChange = Math.floor(Math.random() * 3) - 1;
      setSpeed(prevSpeed => Math.max(0, prevSpeed + speedChange));
    };
    const heartRateInterval = setInterval(simulateHeartRateData, 2000);
    return () => clearInterval(heartRateInterval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          setAlertMessage("Unable to track location. Please enable location services.");
          setShowAlert(true);
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setAlertMessage("Geolocation is not supported by your browser.");
      setShowAlert(true);
    }
  }, []);

  useEffect(() => {
    if (heartRate < 60) {
      handleLowHeartRate();
    } else if (heartRate > 100) {
      handleHighHeartRate();
    } else {
      if (noResponseTimer) {
        clearTimeout(noResponseTimer);
        setNoResponseTimer(null);
      }
      setUserResponded(true);
    }
  }, [heartRate, speed]);

  const handleLowHeartRate = () => {
    setAlertMessage("Your heart rate is low. Are you okay? Tap to respond.");
    setShowAlert(true);
    setUserResponded(false);
    if (!noResponseTimer) {
      const initialSpeed = speed;
      const timer = setTimeout(() => {
        if (!userResponded && Math.abs(speed - initialSpeed) < 2) {
          sendSOS();
        }
      }, 30000);
      setNoResponseTimer(timer);
    }
  };

  const handleHighHeartRate = () => {
    setAlertMessage("Your heart rate is elevated. Please slow down and take deep breaths.");
    setShowAlert(true);
  };

  const sendSOS = () => {
    setAlertMessage(`EMERGENCY: Sending SOS to ${emergencyContact} with your current location.`);
    setShowAlert(true);
  };

  const handleUserResponse = () => {
    setUserResponded(true);
    setShowAlert(false);
    if (noResponseTimer) {
      clearTimeout(noResponseTimer);
      setNoResponseTimer(null);
    }
  };

  const calculateEfficientRoute = () => {
    if (origin === "" || destination === "") {
      setAlertMessage("Please enter both origin and destination");
      setShowAlert(true);
      return;
    }
    setMapLoaded(true);
  };

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
    }
  };

  const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '8px' };
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Driver Safety & EV Route Optimizer</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Driver Health Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>{heartRate} BPM</div>
          <div>{speed} mph</div>
          <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2>EV-Optimized Route Planner</h2>
        <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Enter starting location" />
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
        <button onClick={calculateEfficientRoute}>Find Battery-Efficient Route</button>
        <LoadScript googleMapsApiKey="AIzaSyAbsE0mdIG82NQzYOk72MkCDoN36js7bqM">
          <GoogleMap mapContainerStyle={mapContainerStyle} center={location || defaultCenter} zoom={13}>
            {mapLoaded && origin !== "" && destination !== "" && (
              <DirectionsService options={{ origin, destination, travelMode: 'DRIVING' }} callback={directionsCallback} />
            )}
            {directions && <DirectionsRenderer options={{ directions }} />}
          </GoogleMap>
        </LoadScript>
      </div>
      {showAlert && <div>{alertMessage} <button onClick={handleUserResponse}>I'm OK</button></div>}
    </div>
  );
};

export default DriverSafetyApp;
