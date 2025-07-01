import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet + Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function LocationModal({ open, onClose, onConfirm }) {
  const [position, setPosition] = useState([14.5995, 120.9842]); // Default: Manila

  if (!open) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: "#fff", padding: 24, borderRadius: 8, minWidth: 350, boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
      }}>
        <h3>Set Service Location</h3>
        <div style={{ width: 320, height: 320, marginBottom: 12 }}>
          <MapContainer
            center={position}
            zoom={14}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          <b>Selected Coordinates:</b><br />
          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => onConfirm({ lat: position[0], lng: position[1] })}
            style={{ background: "#f0e130", fontWeight: "bold" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}