import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../assets/styles/calendar.css";
import NavbarLogedInProvider from "../../components/navbar-logedin-provider";
import API_BASE_URL from "../../config/api";

const timeOptions = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export default function ProviderCalendar() {
  const [selectedDates, setSelectedDates] = useState([]); // Always an array
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [message, setMessage] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [providerId, setProviderId] = useState(null);
  const [customTime, setCustomTime] = useState("");
  const [customTimeError, setCustomTimeError] = useState("");

  // Split timeOptions into AM and PM without changing the original array
  const amTimes = timeOptions.filter(t => t.toLowerCase().includes("am"));
  const pmTimes = timeOptions.filter(t => t.toLowerCase().includes("pm"));

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
          setProviderId(data.data._id); // <-- use _id
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
  const selectedDateStr = selectedDates.length === 1 && selectedDates[0]
    ? selectedDates[0].toISOString().split("T")[0]
    : null;
  const unavailableTimes = selectedDateStr
    ? (unavailableSlots.find(slot => slot.date === selectedDateStr)?.times || [])
    : [];

  // Check if custom time overlaps
  const isCustomTimeUnavailable = customTime && unavailableTimes.includes(customTime);

  // Save unavailable slots for all selected dates
  const handleSave = async () => {
    if (!Array.isArray(selectedDates) || selectedDates.length === 0 || (selectedTimes.length === 0 && !customTime)) {
      setMessage("Please select at least one date and time.");
      return;
    }
    let timesToSave = [...selectedTimes];
    if (customTime && !isCustomTimeUnavailable) {
      timesToSave.push(customTime);
    }
    for (const dateObj of selectedDates) {
      if (!(dateObj instanceof Date) || isNaN(dateObj)) continue;
      const dateStr = dateObj.getFullYear() + "-" +
        String(dateObj.getMonth() + 1).padStart(2, "0") + "-" +
        String(dateObj.getDate()).padStart(2, "0");
      await fetch(`${API_BASE_URL}/provider/set-unavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, date: dateStr, times: timesToSave }),
      });
    }
    setMessage("Unavailable slots saved!");
    setSelectedTimes([]);
    setSelectedDates([]);
    setCustomTime("");
    setCustomTimeError("");
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
        <div className="booking-section-horizontal">
          {/* Calendar */}
          <div className="booking-calendar">
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
          </div>
          {/* Time Selection */}
          <div className="booking-time">
            <label style={{ fontWeight: 600 }}>Select Time:</label>
            <div style={{ display: "flex", gap: "18px", margin: "10px 0", width: "16em" }}>
              {/* AM Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>AM</div>
                {amTimes.map((time) => (
                  <label key={time} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1em" }}>
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
                      style={{ width: 22, height: 22 }}
                      disabled={unavailableTimes.includes(time)}
                    />
                    {time}
                    {unavailableTimes.includes(time) && (
                      <span style={{ color: "red", fontSize: 12 }}>Unavailable</span>
                    )}
                  </label>
                ))}
              </div>
              {/* PM Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>PM</div>
                {pmTimes.map((time) => (
                  <label key={time} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1em" }}>
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
                      style={{ width: 22, height: 22 }}
                      disabled={unavailableTimes.includes(time)}
                    />
                    {time}
                    {unavailableTimes.includes(time) && (
                      <span style={{ color: "red", fontSize: 12 }}>Unavailable</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            {/* Custom Time */}
            <div style={{ marginTop: 10 }}>
              <input
                type="time"
                value={customTime}
                onChange={e => {
                  setCustomTime(e.target.value);
                  if (unavailableTimes.includes(e.target.value)) {
                    setCustomTimeError("This time is unavailable.");
                  } else {
                    setCustomTimeError("");
                  }
                }}
                style={{ width: "100%", fontSize: "1.1em" }}
              />
              {customTime && (
                <div style={{ color: isCustomTimeUnavailable ? "red" : "green", fontSize: 13 }}>
                  {isCustomTimeUnavailable
                    ? "This time is unavailable."
                    : "This time is available."}
                </div>
              )}
            </div>
            <button onClick={handleSave} className="save-button" style={{ marginTop: 10 }}>Save Unavailable Slots</button>
            {message && <p className="message">{message}</p>}
          </div>
          {/* Unavailable Slots */}
          <div className="booking-services">
            <label style={{ fontWeight: 600 }}>Unavailable Slots:</label>
            <ul style={{ marginTop: 10, maxHeight: 300, overflowY: "auto", paddingLeft: 0 }}>
              {uniqueUnavailableSlots.length === 0 && <li>No unavailable slots set.</li>}
              {uniqueUnavailableSlots.map(slot => (
                <li key={slot.date} style={{ marginBottom: 14, listStyle: "none" }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>- {slot.date} :</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {slot.times.map(time => (
                      <span key={time} style={{ display: "inline-flex", alignItems: "center", background: "#fffbe6", borderRadius: 6, padding: "2px 8px", marginRight: 4, marginBottom: 4, border: "1px solid #d4a017" }}>
                        <button
                          style={{ color: "red", fontSize: "0.9em", marginRight: 4, background: "none", border: "none", cursor: "pointer" }}
                          onClick={() => handleRemoveTime(slot.date, time)}
                          title="Remove"
                        >
                          [remove]
                        </button>
                        {time}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}