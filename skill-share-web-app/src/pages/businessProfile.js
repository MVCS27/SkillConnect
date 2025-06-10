import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFileLines, faRightFromBracket, faChevronRight, faPenToSquare, faCheckCircle, faSyncAlt, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import NavbarLogedInProvider from "../components/navbar-logedin-provider";
import { logOutUser } from "../controllers/logout";

import "../assets/styles/profile.css";

export default function UserDetails() {
  const [userData, setUserData] = useState({});
  const [incomingBookings, setIncomingBookings] = useState([]);

  const navigate = useNavigate();
  const { firstName, lastName, email, mobile, address = {} } = userData;

  const updateStatus = async (bookingId, newStatus) => {
    const res = await fetch(`http://localhost:5001/bookings/update`, {
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
    }
  };


  useEffect(() => {
    fetch("http://localhost:5001/userData", {
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
        console.log(data, "userData");
        setUserData(data.data);

        if (data.data === "token expired") {
          alert("Token expired, login again");
          logOutUser();
        } if (data.data && data.data._id) {
          fetch(`http://localhost:5001/bookings/provider/${data.data._id}`)
            .then((res) => res.json())
            .then((bookingData) => {
              if (bookingData.status === "ok") {
                setIncomingBookings(bookingData.data);
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
            <p>{mobile}</p>
            <p>{email}</p>
            <p>{address.street}, {address.barangay}</p>
            <p>{address.cityMunicipality}, {address.province}</p>
          </div>
    
          <img src="https://placehold.co/100x100" alt="Profile" className="profile-image" />

        </div>

        <button className="offer-service-btn">OFFER SERVICE</button>

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
                          Customer: {booking.customerId?.firstName || "Unknown"}{" "}
                          {booking.customerId?.lastName || ""}
                        </p>
                        <p>Service: {booking.serviceCategory}</p>
                        <button onClick={() => updateStatus(booking._id, "ongoing")}>
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
                      <div key={b._id} className="booking-card">
                        <p>Customer: {b.customerId?.firstName || "N/A"} {b.customerId?.lastName || ""}</p>
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
            <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
            <span>Completed</span>
            <p className="no-bookings">No completed bookings yet.</p>
            {/* Add completed bookings if applicable in future */}
          </div>
        </div>
      </div>

        <hr />

        <div className="financial-section">
          <h3>Financial Services</h3>
          <div className="financial-item">Cash on Delivery</div>
          <div className="financial-item">QR Code <FontAwesomeIcon icon={faChevronRight} /></div>
          <div className="financial-item">Refund <FontAwesomeIcon icon={faChevronRight} /></div>
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
    </div>
  );
}
