import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/provider.css";
import NavbarLogedIn from "../components/navbar-logedin";
import API_BASE_URL from "../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const SERVICE_CATEGORIES = [
  "Plumber",
  "Electrician",
  "Cleaner",
  "Technician",
  "Others"
];

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [providerImages, setProviderImages] = useState({});
  const [providerRatings, setProviderRatings] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [topRatedProviders, setTopRatedProviders] = useState([]);
  const navigate = useNavigate();

  // Fetch all providers
  useEffect(() => {
    fetch(`${API_BASE_URL}/providerList`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setProviders(data.data);
          data.data.forEach(provider => {
            fetch(`${API_BASE_URL}/user-profile-image/${provider._id}`)
              .then(res => res.json())
              .then(imgData => {
                setProviderImages(prev => ({
                  ...prev,
                  [provider._id]: imgData.status === "ok"
                    ? `${API_BASE_URL}/images/${imgData.image}`
                    : "https://placehold.co/100x100?text=No+Image"
                }));
              });
          });
        }
      });
  }, []);

  // Fetch ratings for each provider
  useEffect(() => {
    providers.forEach(provider => {
      fetch(`${API_BASE_URL}/provider/${provider._id}/average-rating`)
        .then(res => res.json())
        .then(data => {
          setProviderRatings(prev => ({
            ...prev,
            [provider._id]: Number(data.average) || 0
          }));
        });
    });
  }, [providers]);

  // Get user location for "near me"
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }
  }, []);

  // Fetch nearby providers when userLocation changes
  useEffect(() => {
    if (userLocation) {
      fetch(`${API_BASE_URL}/providers/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&maxDistance=10`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "ok") setNearbyProviders(data.data);
        });
    }
  }, [userLocation]);

  // Top rated providers (rating >= 4, sorted by rating desc)
  useEffect(() => {
    const rated = providers
      .map(p => ({
        ...p,
        avgRating: providerRatings[p._id] || 0
      }))
      .filter(p => p.avgRating >= 4)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
    setTopRatedProviders(rated);
  }, [providers, providerRatings]);

  // Filter providers by search and category
  const filterProviders = (list, category) => {
    return list.filter(provider => {
      const name = `${provider.firstName} ${provider.lastName}`.toLowerCase();
      const service = (provider.serviceCategory || "").toLowerCase();
      const search = searchValue.toLowerCase();
      const matchCategory = category ? (provider.serviceCategory === category) : true;
      return (
        (!search || name.includes(search) || service.includes(search)) &&
        matchCategory
      );
    });
  };

  const renderProviderCards = (list) => (
    <div className="provider-row">
      {list.map(provider => (
        <div
          key={provider._id}
          className="provider-card"
          onClick={() => navigate(`/provider-details/${provider._id}`)}
        >
          <img
            src={providerImages[provider._id] || "https://placehold.co/100x100?text=No+Image"}
            alt="Profile"
            className="provider-image"
          />
          <p className="provider-name">{provider.firstName} {provider.lastName}</p>
          <p className="provider-service">{provider.serviceCategory}</p>
          <div>
            {[1,2,3,4,5].map(star => (
              <FontAwesomeIcon
                key={star}
                icon={providerRatings[provider._id] >= star ? solidStar : regularStar}
                style={{ color: "#FFD700" }}
              />
            ))}
            <span style={{ fontSize: 12, color: "#888" }}>
              {providerRatings[provider._id] ? providerRatings[provider._id] : "No ratings"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="provider-container">
      <NavbarLogedIn searchValue={searchValue} setSearchValue={setSearchValue} />
      <div className="provider-sections">

        {/* Near Me */}
        <h3>Near Me</h3>
        <hr />
        {userLocation && nearbyProviders.length > 0
          ? renderProviderCards(filterProviders(nearbyProviders))
          : <p style={{ color: "#888" }}>No providers found near you.</p>
        }

        {/* Top Rated */}
        <h3>Top Rated Providers</h3>
        <hr />
        {topRatedProviders.length > 0
          ? renderProviderCards(filterProviders(topRatedProviders))
          : <p style={{ color: "#888" }}>No top rated providers found.</p>
        }

        {/* By Service Category */}
        <h3>Service Categories</h3>
        <hr />
        {SERVICE_CATEGORIES.map(cat => (
          <div key={cat}>
            <h4>{cat}</h4>
            {renderProviderCards(filterProviders(providers, cat))}
          </div>
        ))}
      </div>
    </div>
  );
}
