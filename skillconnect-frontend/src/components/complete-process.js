import React, { useState } from "react";
import API_BASE_URL from "../config/api";

export default function CompleteProcess({ bookingId, userType, onSuccess }) {
  const [confirmed, setConfirmed] = useState(false);
  const [otherConfirmed, setOtherConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch confirmation status (optional: poll or fetch on mount)
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/booking/confirmation-status/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setConfirmed(data.confirmed[userType]);
          setOtherConfirmed(data.confirmed[userType === "customer" ? "provider" : "customer"]);
        }
      });
  }, [bookingId, userType]);

  const handleConfirm = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/booking/confirm-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, userType }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.status === "ok") {
      setConfirmed(true);
      setOtherConfirmed(data.bothConfirmed);
      if (data.bothConfirmed) {
        if (onSuccess) onSuccess();
      }
    } else {
      alert("Failed to confirm. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, background: "#fff", padding: 24, borderRadius: 8 }}>
      <h3>Complete Booking</h3>
      <p>
        {userType === "customer"
          ? "Click the button below to confirm you have received the service."
          : "Click the button below to confirm you have completed the service."}
      </p>
      <button
        className="btn btn-success"
        onClick={handleConfirm}
        disabled={confirmed || loading}
        style={{ marginBottom: 12 }}
      >
        {confirmed ? "Confirmed" : loading ? "Confirming..." : "Confirm Completion"}
      </button>
      <div>
        {confirmed && !otherConfirmed && (
          <span style={{ color: "#d4a017" }}>
            Waiting for the other party to confirm...
          </span>
        )}
        {confirmed && otherConfirmed && (
          <span style={{ color: "green" }}>
            Booking marked as complete!
          </span>
        )}
      </div>
    </div>
  );
}