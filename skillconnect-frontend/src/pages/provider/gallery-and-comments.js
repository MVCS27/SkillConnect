import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../assets/styles/gallery-and-comments.css";
import NavbarLogedInProvider from "../../components/navbar-logedin-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import API_BASE_URL from "../../config/api";
import ProviderGallery from "../../components/ProviderGallery";

export default function GalleryAndComments() {
  const { id: providerId } = useParams();
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (!providerId) {
      console.warn("No providerId in URL!");
      return;
    }
    fetch(`${API_BASE_URL}/provider/${providerId}/ratings`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setRatings(data.data);
      });
  }, [providerId]);

  return (
    <div className="gallery-comments-container">
      <NavbarLogedInProvider />
      <div className="gallery-section">
        <h3>Portfolio / Gallery</h3>
        <ProviderGallery providerId={providerId} canUpload={true} />
      </div>
      <div className="reviews-section">
        <h3>Ratings & Comments</h3>
        <div className="reviews-list">
          {ratings.length === 0 && <p>No ratings yet.</p>}
          {ratings.map(r => (
            <div key={r._id} className="review-card">
              <div>
                {[1,2,3,4,5].map(star => (
                  <FontAwesomeIcon
                    key={star}
                    icon={r.rating >= star ? solidStar : regularStar}
                    style={{ color: "#FFD700", fontSize: 16 }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 14, color: "#333" }}>{r.comment}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                By {r.userName} on {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}