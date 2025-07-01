import React, { useRef, useEffect, useState } from "react";

export default function MapPicker({ open, onClose, onConfirm }) {
  const mapRef = useRef(null);
  const [center, setCenter] = useState({ lat: 14.5995, lng: 120.9842 }); // Default: Manila
  const [address, setAddress] = useState("Loading address...");

  useEffect(() => {
    if (!open) return;
    // Load Google Maps script if not loaded
    if (!window.google || !window.google.maps) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbhcuDQCWs2NVdoGoRayYe7WfzM6Szkd8&libraries=marker`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        document.getElementById("google-maps-script").onload = initMap;
      }
    } else {
      initMap();
    }
    // eslint-disable-next-line
  }, [open]);

  function initMap() {
    if (!mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: false,
    });

    let marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: false,
    });

    map.addListener("center_changed", () => {
      const newCenter = map.getCenter();
      marker.setPosition(newCenter);
      // newCenter is a LatLng object, so use .lat() and .lng()
      setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      fetchAddress(newCenter.lat(), newCenter.lng());
    });

    // Initial address fetch
    fetchAddress(center.lat, center.lng); // <-- FIX: use .lat and .lng, not .lat() and .lng()
  }

  function fetchAddress(lat, lng) {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCbhcuDQCWs2NVdoGoRayYe7WfzM6Szkd8`
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          data.status === "OK" &&
          data.results &&
          data.results.length > 0
        ) {
          setAddress(data.results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      })
      .catch(() => setAddress("Could not fetch address"));
  }

  if (!open) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "350px", borderRadius: 8 }}
        />
        <div style={{ margin: "12px 0" }}>
          <b>Selected Address:</b>
          <div>{address}</div>
        </div>
        <button onClick={() => onConfirm(center, address)}>Confirm Location</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
      {/* Add some CSS for .map-modal-overlay and .map-modal */}
    </div>
  );
}