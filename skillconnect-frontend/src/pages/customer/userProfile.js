import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFileLines, faRightFromBracket, faChevronRight, faPenToSquare, faCheckCircle, faSyncAlt, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

import NavbarLogedIn from "../../components/navbar-logedin";
import { logOutUser } from "../../controllers/logout";
import API_BASE_URL from "../../config/api";
import CompleteProcess from "../../components/complete-process"; // import at top
import RatingModal from "../../components/rating"; // import the rating modal

import "../../assets/styles/profile.css";

export default function UserDetails() {
  const [userData, setUserData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratings, setRatings] = useState([]);

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
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
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
              setProfileImage(imgData.image); // Use the URL directly!
            }
          });
        }
      });
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      // Get all providerIds from completed bookings
      const completedBookings = bookings.filter(b => b.status === "complete");
      const providerIds = [...new Set(completedBookings.map(b => b.providerId?._id || b.providerId))];

      // Fetch all ratings by this user for these providers
      Promise.all(
        providerIds.map(pid =>
          fetch(`${API_BASE_URL}/provider/${pid}/ratings`)
            .then(res => res.json())
            .then(data => ({ providerId: pid, ratings: data.data || [] }))
        )
      ).then(results => {
        // Flatten and filter ratings by this user
        const allRatings = results.flatMap(r =>
          r.ratings.filter(rc => rc.customerId === userData._id)
        );
        setRatings(allRatings);
      });
    }
  }, [bookings, userData._id]);

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
          src={profileImage}
          alt="Profile"
          className="profile-image"
          onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
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
                      <p>Service: {booking.serviceCategory}</p>
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
                              <div
                                key={b._id}
                                className="booking-card"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedBookingId(b._id);
                                  setShowCompleteModal(true);
                                }}
                              >
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
    {bookings
      .filter(b => b.status === "complete")
      .map((b) => {
        // Find rating for this booking/provider by this user
        const providerId = b.providerId?._id || b.providerId;
        const rating = ratings.find(r => r.providerId === providerId && r.customerId === userData._id);

        return (
          <div
            key={b._id}
            className="booking-card"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (!rating) {
                setRatingBooking(b);
                setShowRatingModal(true);
              }
            }}
          >
            <p>
              {userData.userType === "customer"
                ? `Provider: ${b.providerId?.firstName || "N/A"} ${b.providerId?.lastName || ""}`
                : `Customer: ${b.customerId?.firstName || "N/A"} ${b.customerId?.lastName || ""}`}
            </p>
            <p>Service: {b.serviceCategory}</p>
            {rating ? (
              <div>
                {[1,2,3,4,5].map(star => (
                  <FontAwesomeIcon
                    key={star}
                    icon={rating.rating >= star ? solidStar : regularStar}
                    style={{ color: "#FFD700" }}
                  />
                ))}
                <span style={{ fontSize: 12, color: "#888" }}>
                  {rating.comment}
                </span>
              </div>
            ) : (
              <span style={{ color: "#d4a017", textDecoration: "underline" }}>
                Click to add rating
              </span>
            )}
          </div>
        );
      })}
    {bookings.filter(b => b.status === "complete").length === 0 && (
      <p className="no-bookings">No completed bookings yet.</p>
    )}
  </div>
</div>

          </div>
        </div>

        <hr />

        <div className="financial-section">
          <h3>Financial Services</h3>
          <div className="financial-item">Cash on Service</div>
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
        userType="customer"
        onSuccess={() => {
          setShowCompleteModal(false);
          // Find the completed booking
          const completed = bookings.find(b => b._id === selectedBookingId);
          setRatingBooking(completed);
          setShowRatingModal(true);
        }}
      />
    </div>
  </div>
)}

{showRatingModal && ratingBooking && (
  <div className="modal-overlay" style={{
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
  }}>
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowRatingModal(false)}
        style={{
          position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer", zIndex: 1001
        }}
        aria-label="Close"
      >×</button>
      <RatingModal
        providerId={ratingBooking.providerId?._id || ratingBooking.providerId}
        customerId={userData._id}
        userName={userData.firstName + " " + userData.lastName}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => {
          setShowRatingModal(false);
          // Refresh bookings and ratings
          fetch(`${API_BASE_URL}/bookings/customer/${userData._id}`)
            .then(res => res.json())
            .then(bookingData => {
              if (bookingData.status === "ok") setBookings(bookingData.data);
            });
          // Optionally, also refresh ratings
          // ...fetch ratings logic here...
        }}
      />
    </div>
  </div>
)}
    </div>
  );
}
