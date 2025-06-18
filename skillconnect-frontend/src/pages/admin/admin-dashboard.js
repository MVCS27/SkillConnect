import React from "react";
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logOutUser } from '../../controllers/logout';
import NavbarAdmin from "../../components/navbar-admin"; // <-- Import

export default function AdminDashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <NavbarAdmin /> {/* Add here */}
      <nav style={{ padding: "1rem 2rem" }}>
        <h2>SkillShare Admin Dashboard</h2>

        <button onClick={logOutUser} className="nav-button">
            <FontAwesomeIcon icon={faRightFromBracket} /> Log Out
        </button>
      </nav>
      <div
        style={{
          maxWidth: 900,
          margin: "2rem auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001",
          padding: "2rem",
        }}
      >
        <h3>Welcome, Admin!</h3>
        <p>Use the tools below to manage users, providers, and bookings.</p>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 220,
              background: "#f0e13022",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h4>Users</h4>
            <ul>
              <li>View all users</li>
              <li>Delete or ban users</li>
              <li>Reset user passwords</li>
            </ul>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 220,
              background: "#f0e13022",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h4>Providers</h4>
            <ul>
              <li>Approve new providers</li>
              <li>View provider documents</li>
              <li>Remove providers</li>
            </ul>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 220,
              background: "#f0e13022",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h4>Bookings</h4>
            <ul>
              <li>View all bookings</li>
              <li>Cancel or update bookings</li>
              <li>Monitor booking status</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 40, color: "#888" }}>
          <small>
            SkillShare Admin Panel &copy; {new Date().getFullYear()}
          </small>
        </div>
      </div>
    </div>
  );
}