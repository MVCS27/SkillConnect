import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/provider.css";
import NavbarLogedIn from "../components/navbar-logedin";
import API_BASE_URL from "../config/api";

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [providerImages, setProviderImages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/providerList`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.status === "ok") {
          setProviders(data.data);

          // Fetch images for each provider
          data.data.forEach((provider) => {
            fetch(`${API_BASE_URL}/user-profile-image/${provider._id}`)
              .then((res) => res.json())
              .then((imgData) => {
                setProviderImages((prev) => ({
                  ...prev,
                  [provider._id]: imgData.status === "ok"
                    ? `${API_BASE_URL}/images/${imgData.image}`
                    : "https://placehold.co/100x100?text=No+Image"
                }));
              });
          });
        }
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
            <img
              src={providerImages[provider._id] || "https://placehold.co/100x100?text=No+Image"}
              alt="Profile"
              className="provider-image"
            />
            <p className="provider-name">{provider.firstName} {provider.lastName}</p>
            <p className="provider-service">{provider.serviceCategory}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
