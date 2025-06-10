import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/provider.css"; // adjust as needed

import NavbarLogedIn from "../components/navbar-logedin";

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5001/providerList") // ✅ use GET instead of POST
      .then((res) => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        return res.json();
      })
      .then((data) => {
        console.log(data); // 🪵 Debug output
        if (data.status === "ok") setProviders(data.data);
      })
      .catch((err) => {
        console.error("Error fetching providers:", err);
      });
  }, []);

   const handleClick = (id) => {
    navigate(`/provider-details/${id}`);
  };


  return (
    <div className="provider-container">
        <NavbarLogedIn />
      <div className="provider-grid">
        {providers.map((provider, index) => (
          <div
            key={index}
            className="provider-card"
            onClick={() => handleClick(provider._id)}
          >
            <img src="https://placehold.co/100x100" alt="Profile" />
            <p className="provider-name">{provider.firstName} {provider.lastName}</p>
            <p className="provider-service">{provider.service}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
