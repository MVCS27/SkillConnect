import React, { useEffect, useState } from "react";

export default function AdminProviders() {
  const [pending, setPending] = useState([]);
  const [verified, setVerified] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/businesses")
      .then(res => res.json())
      .then(data => {
        setPending(data.pending);
        setVerified(data.verified);
      });
  }, []);

  const handleApprove = async (id, email) => {
    await fetch("http://localhost:5001/admin/verify-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id }),
    });
    await fetch("http://localhost:5001/admin/send-verification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status: "success" }),
    });
    window.location.reload();
  };

  const handleReject = async (email) => {
    await fetch("http://localhost:5001/admin/send-verification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status: "failed" }),
    });
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem" }}>
      <h2 style={{ color: "#d4a017" }}>Pending Business Approvals</h2>
      {pending.length === 0 && <div style={{ color: "#888" }}>No pending providers.</div>}
      {pending.map(biz => (
        <div key={biz._id} style={{
          border: "1px solid #eee",
          borderRadius: 8,
          margin: "1rem 0",
          padding: "1rem 1.5rem",
          background: "#fff"
        }}>
          <h4>{biz.firstName} {biz.lastName}</h4>
          <ul>
            {biz.verificationDocuments.map((doc, i) => (
              <li key={i}>
                <strong>{doc.documentType.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                <a href={doc.fileReference} target="_blank" rel="noopener noreferrer">View</a>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleApprove(biz._id, biz.email)}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "0.5rem 1.2rem",
              marginRight: 10,
              cursor: "pointer"
            }}
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(biz.email)}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "0.5rem 1.2rem",
              cursor: "pointer"
            }}
          >
            Reject
          </button>
        </div>
      ))}

      <h2 style={{ color: "#28a745", marginTop: 40 }}>Verified Businesses</h2>
      {verified.length === 0 && <div style={{ color: "#888" }}>No verified providers.</div>}
      {verified.map(biz => (
        <div key={biz._id} style={{
          border: "1px solid #e0ffe0",
          borderRadius: 8,
          margin: "1rem 0",
          padding: "1rem 1.5rem",
          background: "#f8fff8"
        }}>
          <h4>{biz.firstName} {biz.lastName}</h4>
        </div>
      ))}
    </div>
  );
}