import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFileLines, faRightFromBracket, faChevronRight, faPenToSquare, faCheckCircle, faSyncAlt, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import PersonelInCharge from "../components/personel-incharge";
import CompleteProcess from "../components/complete-process"; // import at top

import NavbarLogedInProvider from "../components/navbar-logedin-provider";
import { logOutUser } from "../controllers/logout";
import API_BASE_URL from "../config/api";

import "../assets/styles/profile.css";

export default function UserDetails() {
  const [userData, setUserData] = useState({});
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const navigate = useNavigate();
  const { firstName, lastName, email, phoneNumber, address = {} } = userData;

  const updateStatus = async (bookingId, newStatus) => {
    const res = await fetch(`${API_BASE_URL}/bookings/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status: newStatus }),
    });
    const data = await res.json();
    if (data.status === "ok") {
      setIncomingBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      // Redirect to personel-incharge if accepted
      if (newStatus === "ongoing") {
        navigate("/personel-incharge", { state: { bookingId } });
      }
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/userData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ token: window.localStorage.getItem("token") }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.data);

        if (data.data === "token expired") {
          alert("Token expired, login again");
          logOutUser();
        } 
        if (data.data && data.data._id) {
          fetch(`${API_BASE_URL}/bookings/provider/${data.data._id}`)
            .then((res) => res.json())
            .then((bookingData) => {
              if (bookingData.status === "ok") {
                setIncomingBookings(bookingData.data);
              }
            });

          fetch(`${API_BASE_URL}/user-profile-image/${data.data._id}`)
            .then(res => res.json())
            .then(imgData => {
              if (imgData.status === "ok" && imgData.image) {
                setProfileImage(`${API_BASE_URL}/images/${imgData.image}`);
              }
            });
        }
      });
  }, []);

  const handleEdit = () => {
    navigate("/update-user", { state: userData });
  };

  return (
    <div>
      <NavbarLogedInProvider />
      <div className="user-profile">
       
        <div className="user-info">

           <div className="user-text">
            <h2>{firstName} {lastName}</h2>
            <p>{phoneNumber}</p>
            <p>{email}</p>
            <p>{address.street}, {address.barangay}</p>
            <p>{address.cityMunicipality}, {address.province}</p>
          </div>
    
          <img
            src={profileImage || "https://placehold.co/100x100"}
            alt="Profile"
            className="profile-image"
          />

        </div>

        <hr />

       <div className="services-section">
        <h3>My Services</h3>
        <div className="services-status">

          {/* PROCESSING */}
          {(() => {
            const processingBookings = incomingBookings.filter(b => b.status === "processing");

            return (
              <div className="status-process">
                <FontAwesomeIcon icon={faHourglassHalf} className="status-icon" />
                <span>Processing</span>

                {processingBookings.length > 0 ? (
                  <div className="status-item">
                    <span className="badge">{processingBookings.length}</span>

                    {processingBookings.map((booking) => (
                      <div key={booking._id} className="booking-card">
                        <p>
                          Customer: {booking.customerId?.firstName || "N/A"} {booking.customerId?.lastName || ""}
                        </p>
                        <p>Email: {booking.customerId?.email || "N/A"}</p>
                        <p>Phone: {booking.customerId?.phoneNumber || "N/A"}</p>
                        <button onClick={() => {
                          setSelectedBookingId(booking._id);
                          setShowPersonnelModal(true);
                        }}>
                          Accept
                        </button>
                        <button onClick={() => updateStatus(booking._id, "refused")}>
                          Refuse
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-bookings">No processing bookings yet.</p>
                )}
              </div>
            );
          })()}

          {/* ONGOING */}
          {(() => {
            const ongoingBookings = incomingBookings.filter(b => b.status === "ongoing");

            return (
              <div className="status-process">
                <FontAwesomeIcon icon={faSyncAlt} className="status-icon" />
                <span>Ongoing</span>
                {ongoingBookings.length > 0 ? (
                  <div className="status-item">
                    {ongoingBookings.map((b) => (
                      <div
                        key={b._id}
                        className="booking-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedBookingId(b._id);
                          setShowCompleteModal(true);
                        }}
                      >
                        <p>Customer: {b.customerId?.firstName || "N/A"} {b.customerId?.lastName || ""}</p>
                        <p>Email: {b.customerId?.email || "N/A"}</p>
                        <p>Phone: {b.customerId?.phoneNumber || "N/A"}</p>
                        <p>Service: {b.serviceCategory}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-bookings">No ongoing bookings yet.</p>
                )}
              </div>
            );
          })()}

          {/* COMPLETED */}
          <div className="status-process">
            <span>Completed</span>
            <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
            <div className="status-item">
              {incomingBookings
                .filter(b => b.status === "complete")
                .map((b) => (
                  <div key={b._id} className="booking-card">
                    <p>
                      {userData.userType === "customer"
                        ? `Provider: ${b.providerId?.firstName || "N/A"} ${b.providerId?.lastName || ""}`
                        : `Customer: ${b.customerId?.firstName || "N/A"} ${b.customerId?.lastName || ""}`}
                    </p>
                    <p>Service: {b.serviceCategory}</p>
                  </div>
                ))}
              {incomingBookings.filter(b => b.status === "complete").length === 0 && (
                <p className="no-bookings">No completed bookings yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

        <hr />

        <div className="financial-section">
          <h3>Financial Services</h3>
          <div className="financial-item">Cash on Delivery</div>
          <div className="financial-item">QR Code</div>
        </div>

        <hr />

        <div className="account-section">
          <h3>My Services</h3>
          <div className="account-item" onClick={handleEdit}>Edit Profile <FontAwesomeIcon icon={faChevronRight} /></div>
          <div className="logout" onClick={logOutUser}>Logout</div>
        </div>

        <div className="bottom-nav">
          <FontAwesomeIcon icon={faGear} />
          <FontAwesomeIcon icon={faFileLines} />
          <FontAwesomeIcon icon={faPenToSquare} />
          <FontAwesomeIcon icon={faRightFromBracket} />
        </div>
      </div>

      {showPersonnelModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowPersonnelModal(false)}
              style={{
                position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer", zIndex: 1001
              }}
              aria-label="Close"
            >×</button>
            <PersonelInCharge
              bookingId={selectedBookingId}
              onSuccess={() => setShowPersonnelModal(false)}
            />
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowCompleteModal(false)}
              style={{
                position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer", zIndex: 1001
              }}
              aria-label="Close"
            >×</button>
            <CompleteProcess
              bookingId={selectedBookingId}
              userType="provider"
              onSuccess={() => {
                setShowCompleteModal(false);
                // Optionally refresh bookings here
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
