import React, { useEffect, useState } from "react";
import NavbarAdmin from "../../components/navbar-admin";
import API_BASE_URL from "../../config/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setBookings(data.data);
      });
  }, []);

  // Group bookings by status
  const grouped = bookings.reduce((acc, booking) => {
    const status = booking.status || "current";
    if (!acc[status]) acc[status] = [];
    acc[status].push(booking);
    return acc;
  }, {});

  const allStatuses = Array.from(new Set(bookings.map(b => b.status || "processing")));

  return (
    <div>
      <NavbarAdmin />
      <div style={{ maxWidth: 1100, margin: "8em auto", padding: "2rem" }}>
        <h2 style={{ color: "#d4a017" }}>Admin Bookings</h2>
        {allStatuses.map(status => (
          <div key={status} style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "#888" }}>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Customer</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Provider</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Service</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Date</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Time</th>
                  <th style={{ borderBottom: "1px solid #ccc" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(grouped[status] || []).map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.customerId?.firstName} {booking.customerId?.lastName}</td>
                    <td>{booking.providerId?.firstName} {booking.providerId?.lastName}</td>
                    <td>{booking.serviceCategory}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>{booking.status || "processing"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!grouped[status] || grouped[status].length === 0) && (
              <div style={{ color: "#bbb", padding: "1rem" }}>No bookings in this status.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}