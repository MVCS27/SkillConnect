import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/profile.css";
import NavbarLogedIn from "../components/navbar-logedin";

export default function ProviderDetails() {
  const { id } = useParams(); // providerId
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch provider info
  useEffect(() => {
    fetch(`http://localhost:5001/provider/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
            console.log("Fetched provider object:", data.data); // 👈 Add this
          setProvider(data.data);
        }
      })
      .catch(() => alert("Failed to fetch provider info."));
  }, [id]);

  // Fetch logged-in customer info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5001/userData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok" && data.data !== "token expired") {
          setCustomerData(data.data);
        } else {
          alert("Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch(() => alert("Failed to fetch user data."));
  }, []);

const handleBooking = async () => {
  if (!customerData || !provider) {
    alert("Booking info is incomplete.");
    return;
  }

  const customerId = customerData._id;
  const providerId = provider._id;
  const serviceCategory = provider.serviceCategory;

  if (!customerId || !providerId || !serviceCategory) {
    console.error("Missing booking data:", { customerId, providerId, serviceCategory });
    alert("Booking failed: Missing information.");
    return;
  }

  setBookingLoading(true);
  try {
    const response = await fetch("http://localhost:5001/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, providerId, serviceCategory }),
    });

    const data = await response.json();
    if (data.status === "ok") {
      alert("Booking successful!");
      navigate("/customer-profile");
    } else {
      console.error("Booking failed response:", data);
      alert("Booking failed.");
    }
  } catch (error) {
    console.error("Booking error:", error);
    alert("Something went wrong.");
  } finally {
    setBookingLoading(false);
  }
};

  if (!provider) return <div>Loading provider details...</div>;

  return (
    <div className="provider-details">
      <NavbarLogedIn />

      <div className="user-profile">
        <button onClick={() => navigate("/provider-list")} className="detail-button">
          ← Back to List
        </button>

        <div className="user-info">
          <div className="user-text">
            <h2>{provider.firstName} {provider.lastName}</h2>
            <p>Email: {provider.email}</p>
            <p>Mobile: {provider.mobile}</p>
            <p>Service: {provider.serviceCategory || "N/A"}</p>
            <p>
              Address: {provider.address?.street}, {provider.address?.barangay}, {provider.address?.cityMunicipality}, {provider.address?.province}
            </p>
          </div>
          <img
            src={provider.image || "https://placehold.co/100x100?text=No+Image"}
            alt="Provider"
            className="profile-image"
          />
        </div>

        <hr />

        {customerData && (
          <button
            onClick={handleBooking}
            className="detail-button"
            disabled={bookingLoading}
          >
            {bookingLoading ? "Booking..." : "Book Now"}
          </button>
        )}
      </div>
    </div>
  );
}
