import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../assets/styles/calendar.css";
import NavbarLogedInProvider from "../components/navbar-logedin-provider";
import API_BASE_URL from "../config/api";

export default function ProviderCalendar() {
  const [selectedDates, setSelectedDates] = useState([]); // Always an array
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [message, setMessage] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [providerId, setProviderId] = useState(null);

  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Get provider ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE_URL}/userData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok" && data.data && data.data._id) {
          setProviderId(data.data._id);
        }
      });
  }, []);

  // Fetch unavailable slots
  useEffect(() => {
    if (!providerId) return;
    fetch(`${API_BASE_URL}/provider/${providerId}/unavailable`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setUnavailableSlots(data.data);
      });
  }, [providerId, message]);

  // Get unavailable times for the selected date (if only one date is selected)
  const unavailableTimes = selectedDates.length === 1
    ? (unavailableSlots.find(slot =>
        slot.date === selectedDates[0]?.toISOString().split("T")[0]
      )?.times || [])
    : [];

  // Save unavailable slots for all selected dates
  const handleSave = async () => {
    if (!Array.isArray(selectedDates) || selectedDates.length === 0 || selectedTimes.length === 0) {
      setMessage("Please select at least one date and time.");
      return;
    }
    for (const dateObj of selectedDates) {
      if (!(dateObj instanceof Date) || isNaN(dateObj)) continue; // skip invalid dates
      const dateStr = dateObj.getFullYear() + "-" +
        String(dateObj.getMonth() + 1).padStart(2, "0") + "-" +
        String(dateObj.getDate()).padStart(2, "0");
      await fetch(`${API_BASE_URL}/provider/set-unavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, date: dateStr, times: selectedTimes }),
      });
    }
    setMessage("Unavailable slots saved!");
    setSelectedTimes([]);
    setSelectedDates([]);
  };

  // Remove a specific time from unavailable slots
  const handleRemoveTime = async (date, time) => {
    const slot = unavailableSlots.find(s => s.date === date);
    if (!slot) return;

    const newTimes = slot.times.filter(t => t !== time);

    // Update the database
    await fetch(`${API_BASE_URL}/provider/set-unavailable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, date, times: newTimes }),
    });

    // Optimistically update UI immediately
    setUnavailableSlots(prev =>
      prev
        .map(slot =>
          slot.date === date
            ? { ...slot, times: newTimes }
            : slot
        )
        .filter(slot => slot.times.length > 0) // Remove date if no times left
    );

    setMessage("Time removed!");
  };

  // Deduplicate unavailableSlots by date
  const uniqueUnavailableSlots = Object.values(
    unavailableSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = slot;
      else {
        // Merge times if duplicate date
        acc[slot.date].times = Array.from(new Set([...acc[slot.date].times, ...slot.times]));
      }
      return acc;
    }, {})
  );

  return (
    <div>
      <NavbarLogedInProvider />
      <div className="calendar-container">
        <h2>Set Unavailable Slots</h2>
        <DatePicker
          selected={selectedDates[0] || null}
          onChange={dates => setSelectedDates(Array.isArray(dates) ? dates : [])}
          selectsMultiple
          minDate={new Date()}
          dayClassName={date =>
            date < new Date().setHours(0,0,0,0) ? "react-datepicker__day--disabled" : undefined
          }
          inline
        />
        <div className="time-options">
          {timeOptions.map((time) => (
            <label key={time} className="time-option">
              <input
                type="checkbox"
                checked={selectedTimes.includes(time)}
                onChange={() =>
                  setSelectedTimes(prev =>
                    prev.includes(time)
                      ? prev.filter(t => t !== time)
                      : [...prev, time]
                  )
                }
              />
              {time}
            </label>
          ))}
        </div>
        <button onClick={handleSave} className="save-button">Save Unavailable Slots</button>
        {message && <p className="message">{message}</p>}

        <h3>Unavailable Slots</h3>
        <ul>
          {uniqueUnavailableSlots.map(slot => (
            <li key={slot.date}>
              <strong>{slot.date}:</strong>{" "}
              {slot.times.map(time => (
                <span key={time} style={{ marginRight: 8 }}>
                  {time}{" "}
                  <button
                    style={{ color: "red", fontSize: "0.8em" }}
                    onClick={() => handleRemoveTime(slot.date, time)}
                  >
                    [remove]
                  </button>
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}