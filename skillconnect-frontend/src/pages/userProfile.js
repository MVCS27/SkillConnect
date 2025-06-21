import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFileLines, faRightFromBracket, faChevronRight, faPenToSquare, faCheckCircle, faSyncAlt, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import NavbarLogedIn from "../components/navbar-logedin";
import { logOutUser } from "../controllers/logout";
import API_BASE_URL from "../config/api";

import "../assets/styles/profile.css";

export default function UserDetails() {
  const [userData, setUserData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const navigate = useNavigate();
  const { firstName, lastName, email, phoneNumber, address = {} } = userData;

  const cancelBooking = async (bookingId) => {
    const res = await fetch(`${API_BASE_URL}/bookings/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status: "cancelled" }),
    });
    const data = await res.json();
    if (data.status === "ok") {
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "cancelled" } : b));
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
        console.log(data, "userData");
        setUserData(data.data);

        if (data.data === "token expired") {
          alert("Token expired, login again");
          logOutUser();
        } if (data.data && data.data._id) {
        fetch(`${API_BASE_URL}/bookings/customer/${data.data._id}`)
          .then((res) => res.json())
          .then((bookingData) => {
            if (bookingData.status === "ok") {
              setBookings(bookingData.data);
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
      <NavbarLogedIn />
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

              <button
          className="offer-service-btn"
          onClick={() => navigate("/register-provider")}
        >
          OFFER SERVICE
        </button>

        <hr />

        <div className="services-section">
          <h3>Services Hired</h3>
          <div className="services-status">

           <div className="status-process">
                       <FontAwesomeIcon icon={faHourglassHalf} className="status-icon" />
            <span>Processing</span>

            {(() => {
              const processingBookings = bookings.filter(b => b.status === "processing");

              return processingBookings.length > 0 ? (
                <div className="status-item">
                  <span className="badge">{processingBookings.length}</span>

                  {processingBookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                      <p>
                        Provider: {booking.providerId?.firstName || "N/A"} {booking.providerId?.lastName || ""}
                      </p>
                      <p>Email: {booking.providerId?.email || "N/A"}</p>
                      <p>Phone: {booking.providerId?.phoneNumber || "N/A"}</p>
                      <p>Service: {booking.providerId?.serviceCategory || "N/A"}</p>
                      <button onClick={() => cancelBooking(booking._id)}>Cancel</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-bookings">No processing bookings yet.</p>
              );
            })()}
          </div>


            
                    <div className="status-process">
                        <FontAwesomeIcon icon={faSyncAlt} className="status-icon" />
                      <span>Ongoing</span>
                      {bookings.filter(b => b.status === "ongoing").length > 0 ? (
                        <div className="status-item">
                          {bookings
                            .filter(b => b.status === "ongoing")
                            .map((b) => (
                              <div key={b._id} className="booking-card">
                                <p>Provider: {b.providerId?.firstName || "N/A"} {b.providerId?.lastName || ""}</p>
                                <p>Service: {b.serviceCategory}</p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="no-bookings">No ongoing bookings yet.</p>
                      )}
                    </div>

          
               <div className="status-process">
                <span>Completed</span>
                <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                <div className="status-item">
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
          <h3>General</h3>
          <div className="account-item" onClick={handleEdit}>Edit Profile <FontAwesomeIcon icon={faChevronRight} /></div>
          <div className="logout" onClick={logOutUser}>Logout</div>
        </div>

          <div className="bottom-nav">
            <div onClick={() => navigate("/customer-profile")}>
              <FontAwesomeIcon icon={faGear} />
            </div>
            <div onClick={() => navigate("/provider-list")}>
              <FontAwesomeIcon icon={faFileLines} />
            </div>
            <div onClick={() => navigate("/update-user", { state: userData })}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </div>
            <div onClick={logOutUser}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </div>
        </div>
      </div>
    </div>
  );
}
