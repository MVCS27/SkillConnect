import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function PersonelInCharge({ bookingId, onSuccess }) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // const bookingId = location.state?.bookingId; // Get bookingId from navigation state

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();
    formData.append("description", description);
    if (image) formData.append("image", image);
    formData.append("bookingId", bookingId);

    // Send to backend to email customer
    const res = await fetch(`${API_BASE_URL}/send-personel-incharge`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.status === "ok") {
      // After email is sent, update booking status to "ongoing"
      await fetch(`${API_BASE_URL}/bookings/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "ongoing" }),
      });
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      alert("Failed to send email. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 12px #0001" }}>
      <h2>Personnel In-Charge</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Personnel Photo:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {image && (
            <div style={{ marginTop: 8 }}>
              <img src={URL.createObjectURL(image)} alt="Personnel" style={{ width: 120, borderRadius: 8 }} />
            </div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Description:</label>
          <textarea
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter personnel details or message"
            required
            rows={4}
          />
        </div>
        <button type="submit" className="btn btn-primary">Send to Customer</button>
      </form>
      {emailSent && <div style={{ color: "green", marginTop: 16 }}>Email sent! Redirecting...</div>}
    </div>
  );
}