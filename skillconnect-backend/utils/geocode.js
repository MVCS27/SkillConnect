require("dotenv").config();
const axios = require("axios");

// --- 1. Nominatim (OpenStreetMap) ---
async function geocodeWithNominatim(address) {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": `SkillConnectApp/1.0 (${process.env.EMAIL_USER || 'default@example.com'})`,
      },
    });

    if (res.data && res.data.length > 0) {
      const first = res.data[0];
      return {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        source: "Nominatim",
      };
    }
  } catch (err) {
    console.warn("Nominatim error:", err.message);
  }
  return null;
}

// --- 2. OpenCage ---
async function geocodeWithOpenCage(address) {
  try {
    const res = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
      params: {
        q: address,
        key: process.env.OPENCAGE_API_KEY,
      },
    });

    if (res.data && res.data.results.length > 0) {
      const geo = res.data.results[0].geometry;
      return {
        lat: geo.lat,
        lng: geo.lng,
        source: "OpenCage",
      };
    }
  } catch (err) {
    console.warn("OpenCage error:", err.message);
  }
  return null;
}

// --- 3. LocationIQ ---
async function geocodeWithLocationIQ(address) {
  try {
    const res = await axios.get(`https://us1.locationiq.com/v1/search.php`, {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: address,
        format: "json",
        addressdetails: 1,
      },
    });

    if (res.data && res.data.length > 0) {
      const geo = res.data[0];
      return {
        lat: parseFloat(geo.lat),
        lng: parseFloat(geo.lon),
        source: "LocationIQ",
      };
    }
  } catch (err) {
    console.warn("LocationIQ error:", err.message);
  }
  return null;
}

// --- 4. Google Maps Geocoding API (Free Tier) ---
async function geocodeWithGoogleMaps(address) {
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (res.data && res.data.status === "OK" && res.data.results.length > 0) {
      const geo = res.data.results[0].geometry.location;
      return {
        lat: geo.lat,
        lng: geo.lng,
        source: "GoogleMaps",
      };
    }
  } catch (err) {
    console.warn("Google Maps error:", err.message);
  }
  return null;
}

// --- Combined Function ---
async function geocodeAddress(address) {
  const cleanAddress = address.replace(/\s+/g, ' ').trim();

  const methods = [
    geocodeWithNominatim,
    geocodeWithOpenCage,
    geocodeWithLocationIQ,
    geocodeWithGoogleMaps, // Google Maps as fallback
  ];

  for (const method of methods) {
    const result = await method(cleanAddress);
    if (result) {
      console.log(`Geocoded using ${result.source}:`, result);
      return result;
    }
  }

  console.error("All geocoding attempts failed for:", cleanAddress);
  return null;
}

module.exports = geocodeAddress;
