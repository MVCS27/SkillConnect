import React from "react";
import { useNavigate } from "react-router-dom";

export default function AccountVerify() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f9fa"
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem 3rem",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#d4a017" }}>Account Verification Pending</h2>
        <p style={{ margin: "1.5rem 0" }}>
          Thank you for registering as a business provider.<br />
          Your documents are being reviewed by our admin team.<br />
          You will be notified by email once your account is verified.
        </p>
        <div style={{ color: "#888", fontSize: "0.95rem" }}>
          If you have questions, please contact skillconnect12345@gmail.com.
        </div>
        <button
          style={{
            marginTop: "2rem",
            padding: "0.5rem 1.5rem",
            background: "#d4a017",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold"
          }}
          onClick={() => navigate("/landing-page")}
        >
          Back to Landing Page
        </button>
      </div>
    </div>
  );
}