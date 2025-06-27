import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import API_BASE_URL from "../config/api";

export default function RatingModal({ providerId, customerId, userName, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating.");
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/provider/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, customerId, userName, rating, comment }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Thank you for your feedback!");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      alert("Failed to submit rating.");
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  return (
    <div className="rating-modal" style={{ background: "#fff", padding: 24, borderRadius: 8, maxWidth: 400 }}>
      <h3>Rate Your Provider</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{ cursor: "pointer", color: (hover || rating) >= star ? "#FFD700" : "#ccc" }}
            >
              <FontAwesomeIcon icon={(hover || rating) >= star ? solidStar : regularStar} />
            </span>
          ))}
        </div>
        <textarea
          className="form-control"
          placeholder="Leave a comment (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          {dateStr} {timeStr}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      <button onClick={onClose} style={{ marginTop: 8, background: "none", border: "none", color: "#d4a017", cursor: "pointer" }}>
        Close
      </button>
    </div>
  );
}