import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function ProviderGallery({ providerId, canUpload }) {
  const [image, setImage] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    if (providerId) fetchGallery();
  }, [providerId]);

  const fetchGallery = async () => {
    const res = await axios.get(`${API_BASE_URL}/provider/${providerId}/gallery`);
    if (res.data.status === "ok") setGallery(res.data.data);
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    formData.append("userId", providerId);
    formData.append("type", "gallery");
    await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setImage(null);
    fetchGallery();
  };

  const handleDelete = async (imageId) => {
    await axios.delete(`${API_BASE_URL}/provider/${providerId}/gallery/${imageId}`);
    fetchGallery();
  };

  return (
    <div style={{ marginBottom: "1.5em" }}>
      {canUpload && (
        <form onSubmit={submitImage} style={{ marginBottom: "1em" }}>
          <label>Upload Gallery Image:</label>
          <input
            accept="image/*"
            type="file"
            onChange={e => setImage(e.target.files[0])}
            style={{ marginLeft: 10, marginRight: 10 }}
          />
          <button type="submit">Upload</button>
        </form>
      )}
      <div className="gallery-grid">
        {gallery.length === 0 && <p>No portfolio images yet.</p>}
        {gallery.map((img, idx) => (
          <div key={img._id || idx} style={{ position: "relative" }}>
            <img
              src={img.image}
              alt={`Portfolio ${idx + 1}`}
              className="gallery-img"
              style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
            />
            {canUpload && (
              <button
                type="button"
                onClick={() => handleDelete(img._id)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(255,255,255,0.8)",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  padding: 2,
                  zIndex: 2
                }}
                aria-label="Delete image"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProviderGallery;