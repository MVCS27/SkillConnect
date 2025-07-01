import React, { useEffect, useState } from "react";
import NavbarAdmin from "../../components/navbar-admin";
import API_BASE_URL from "../../config/api";
import "../../assets/styles/admin.css";

export default function AdminProviders() {
  const [pending, setPending] = useState([]);
  const [verified, setVerified] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showSuspendModal, setShowSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/businesses`)
      .then(res => res.json())
      .then(data => {
        setPending(data.pending);
        setVerified(data.verified);
        setSuspended(data.suspended || []);
        setRejected(data.rejected || []);
      });
  }, []);

  const handleApprove = async (id, email) => {
    await fetch(`${API_BASE_URL}/admin/verify-business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id }),
    });
    await fetch(`${API_BASE_URL}/admin/send-verification-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status: "success" }),
    });
    window.location.reload();
  };

  const handleSuspend = async (businessId, reason) => {
    await fetch(`${API_BASE_URL}/admin/suspend-business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, reason }),
    });
    setShowSuspendModal(null);
    setSuspendReason("");
    window.location.reload();
  };

  const handleUnsuspend = async (businessId) => {
    await fetch(`${API_BASE_URL}/admin/unsuspend-business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    window.location.reload();
  };

  const handleReject = async (businessId, reason) => {
    await fetch(`${API_BASE_URL}/admin/reject-business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, reason }),
    });
    // Delete user data except username
    await fetch(`${API_BASE_URL}/admin/delete-rejected-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: businessId }),
    });
    setShowRejectModal(null);
    setRejectReason("");
    window.location.reload();
  };

  return (
    <div>
      <NavbarAdmin />
      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem" }}>
        <h2 style={{ color: "#d4a017" }}>Pending Business Approvals</h2>
        {pending.length === 0 && <div style={{ color: "#888" }}>No pending providers.</div>}
        {pending.map(biz => (
          <div key={biz.id} style={{
            border: "1px solid #eee",
            borderRadius: 8,
            margin: "1rem 0",
            padding: "1rem 1.5rem",
            background: "#fff"
          }}>
            <h4>{biz.firstName} {biz.lastName}</h4>
            <ul>
              {biz.verificationDocuments
                .filter(doc => doc.status === "uploaded" && doc.fileReference)
                .map((doc, i) => (
                  <li key={i}>
                    <strong>{doc.documentType.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                    <a
                      href={doc.fileReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: 10 }}
                    >
                      View
                    </a>
                    <a
                      href={doc.fileReference}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </li>
                ))}
            </ul>
            <button
              onClick={() => handleApprove(biz.id, biz.email)}
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
              onClick={() => setShowRejectModal(biz.id)}
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
          <div key={biz.id} style={{
            border: "1px solid #e0ffe0",
            borderRadius: 8,
            margin: "1rem 0",
            padding: "1rem 1.5rem",
            background: "#f8fff8"
          }}>
            <h4>{biz.firstName} {biz.lastName}</h4>
            {/* Only show Suspend button if not suspended */}
            {!biz.isSuspended && (
              <button
                onClick={() => setShowSuspendModal(biz.id)}
                style={{
                  background: "#ffc107",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "0.5rem 1.2rem",
                  marginRight: 10,
                  cursor: "pointer"
                }}
              >
                Suspend
              </button>
            )}
            {/* Do not show Unsuspend button here */}
          </div>
        ))}

        <h2 style={{ color: "#ffc107", marginTop: 40 }}>Suspended Businesses</h2>
        {(suspended.length === 0) && <div style={{ color: "#888" }}>No suspended providers.</div>}
        {suspended.map(biz => (
          <div key={biz.id} style={{
            border: "1px solid #ffe0b2",
            borderRadius: 8,
            margin: "1rem 0",
            padding: "1rem 1.5rem",
            background: "#fffbe6"
          }}>
            <h4>{biz.firstName} {biz.lastName}</h4>
            <div>Status: Suspended</div>
            {/* Only show Unsuspend button if suspended */}
            {biz.isSuspended && (
              <button
                onClick={() => handleUnsuspend(biz.id)}
                style={{
                  background: "#17a2b8",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "0.5rem 1.2rem",
                  marginRight: 10,
                  cursor: "pointer"
                }}
              >
                Unsuspend
              </button>
            )}
            {/* Do not show Suspend button here */}
          </div>
        ))}

        <h2 style={{ color: "#dc3545", marginTop: 40 }}>Rejected Businesses</h2>
        {(rejected.length === 0) && <div style={{ color: "#888" }}>No rejected providers.</div>}
        {rejected.map(biz => (
          <div key={biz.id} style={{
            border: "1px solid #ffcdd2",
            borderRadius: 8,
            margin: "1rem 0",
            padding: "1rem 1.5rem",
            background: "#fff0f0"
          }}>
            <h4>{biz.firstName} {biz.lastName}</h4>
            <div>Status: Rejected</div>
          </div>
        ))}

        {showSuspendModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setShowSuspendModal(null)}>×</button>
              <h4>Suspend Business</h4>
              <input
                type="text"
                placeholder="Reason for suspension"
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />
              <button
                onClick={() => handleSuspend(showSuspendModal, suspendReason)}
                style={{ width: "100%" }}
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setShowRejectModal(null)}>×</button>
              <h4>Reject Business</h4>
              <input
                type="text"
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />
              <button
                onClick={() => handleReject(showRejectModal, rejectReason)}
                style={{ width: "100%" }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}