import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../assets/styles/profile.css";
import NavbarLogedIn from "../components/navbar-logedin";
import API_BASE_URL from "../config/api";

export default function ProviderDetails() {
  const { id } = useParams(); // providerId
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [providerImage, setProviderImage] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  // Fetch provider info
  useEffect(() => {
    fetch(`${API_BASE_URL}/provider/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setProvider(data.data);

          // Fetch provider image
          fetch(`${API_BASE_URL}/user-profile-image/${data.data._id}`)
            .then((res) => res.json())
            .then((imgData) => {
              setProviderImage(
                imgData.status === "ok"
                  ? `${API_BASE_URL}/images/${imgData.image}`
                  : "https://placehold.co/100x100?text=No+Image"
              );
            });
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

    fetch(`${API_BASE_URL}/userData`, {
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

  // Fetch unavailable slots
  useEffect(() => {
    if (provider) {
      fetch(`${API_BASE_URL}/provider/${provider._id}/unavailable`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") setUnavailableSlots(data.data);
        });
    }
  }, [provider]);

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
      const response = await fetch(`${API_BASE_URL}/book`, {
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

  // Get unavailable times for selected date
  const unavailableTimes = selectedDate
    ? (unavailableSlots.find(slot => slot.date === selectedDate.toISOString().split("T")[0])?.times || [])
    : [];

  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

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
            src={providerImage || "https://placehold.co/100x100?text=No+Image"}
            alt="Provider"
            className="profile-image"
          />
        </div>

        <hr />

        {customerData && (
          <div>
            <h4>Book a Date and Time</h4>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText="Select a date"
              filterDate={date => {
                const dateStr = date.toISOString().split("T")[0];
                // Only allow dates that are not fully booked (all times unavailable)
                const slot = unavailableSlots.find(slot => slot.date === dateStr);
                return !slot || slot.times.length < timeOptions.length;
              }}
            />
            {selectedDate && (
              <div>
                <label>Select Time:</label>
                <select
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                >
                  <option value="">Select time</option>
                  {timeOptions.map(time => (
                    <option
                      key={time}
                      value={time}
                      disabled={unavailableTimes.includes(time)}
                    >
                      {time} {unavailableTimes.includes(time) ? "(Unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={async () => {
                if (!selectedDate || !selectedTime) {
                  alert("Please select date and time.");
                  return;
                }
                setBookingLoading(true);
                try {
                  const response = await fetch(`${API_BASE_URL}/book`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      customerId: customerData._id,
                      providerId: provider._id,
                      serviceCategory: provider.serviceCategory,
                      date: selectedDate.toISOString().split("T")[0],
                      time: selectedTime,
                    }),
                  });
                  const data = await response.json();
                  if (data.status === "ok") {
                    alert("Booking successful!");
                    navigate("/customer-profile");
                  } else {
                    alert("Booking failed.");
                  }
                } catch (error) {
                  alert("Something went wrong.");
                } finally {
                  setBookingLoading(false);
                }
              }}
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Book Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
