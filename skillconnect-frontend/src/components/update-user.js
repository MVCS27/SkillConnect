import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../assets/styles/form.css';
import API_BASE_URL from "../config/api"; // <-- Add this import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function UpdateUser() {
  const location = useLocation();
  const navigate = useNavigate(); // Add this line
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address state
  const [address, setAddress] = useState({
    street: "",
    barangay: "",
    cityMunicipality: "",
    province: "",
    zipCode: "",
  });
  const [profileImage, setProfileImage] = useState(null); // for preview
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [rateAmount, setRateAmount] = useState(location.state?.rateAmount || "");
  const [rateUnit, setRateUnit] = useState(location.state?.rateUnit || "");
  const [customRateUnit, setCustomRateUnit] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(location.state?.avatar || "");

  useEffect(() => {
    if (location.state) {
      setFirstName(location.state.firstName || "");
      setLastName(location.state.lastName || "");
      setPhoneNumber(location.state.phoneNumber || ""); // changed from mobile
      setEmail(location.state.email || "");
      setAddress(location.state.address || {
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        zipCode: "",
      });
      setRateAmount(location.state.rateAmount || "");
      setRateUnit(location.state.rateUnit || "");
    }
  }, [location.state]);

  // Fetch current profile image on mount
  useEffect(() => {
    if (location.state && location.state._id) {
      fetch(`${API_BASE_URL}/user-profile-image/${location.state._id}`)
        .then(res => res.json())
        .then(imgData => {
          if (imgData.status === "ok" && imgData.image) {
            setProfileImage(imgData.image); // Use the URL directly
          }
        });
    }
  }, [location.state]);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const uploadProfileImage = async (userId) => {
    if (!profileImageFile) return;
    const formData = new FormData();
    formData.append("image", profileImageFile);
    formData.append("userId", userId);
    formData.append("type", "profile");

    const res = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    console.log("Upload result:", result);
    return result;
  };

  const updateData = async () => {
    // Add validation before sending
    const validFirstName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(firstName.trim());
    const validLastName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(lastName.trim());
    const isValidPhoneNumber = /^09\d{9}$/.test(phoneNumber);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailRegex.test(email);

    setFirstNameError(!validFirstName);
    setLastNameError(!validLastName);
    setPhoneNumberError(!isValidPhoneNumber);
    setEmailError(!validEmail);

    if (!validFirstName || !validLastName || !isValidPhoneNumber || !validEmail) {
      return;
    }

    if (password || confirmPassword) {
      const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
      setPasswordError(!isValid);
      setConfirmPasswordError(confirmPassword !== password);
      if (!isValid || confirmPassword !== password) {
        return;
      }
    }

    // Update user info
    const response = await fetch(`${API_BASE_URL}/updateUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _id: location.state._id,
        firstName,
        lastName,
        phoneNumber,
        email,
        address,
        avatar: selectedAvatar, // <-- send avatar filename
        ...(password ? { password } : {}),
        rateAmount,
        rateUnit: rateUnit === "custom" ? customRateUnit : rateUnit,
      }),
    });
    const data = await response.json();
    if (data.status === "ok") {
      if (profileImageFile) {
        const imgRes = await uploadProfileImage(location.state._id);
        if (imgRes.status !== "ok") {
          alert("Image upload failed: " + (imgRes.error || "Unknown error"));
        }
      }
      window.location.href = "/customer-profile";
    } else {
      alert("Update failed: " + (data.data || "Unknown error"));
    }
  };

  return (
    <div className="Update-FormContainer">
      <div className="Form">
        {/* Profile Image Upload */}
        <div className="mb-3 text-center">
          <img
            src={selectedAvatar ? `/avatars/${selectedAvatar}` : "https://placehold.co/100x100?text=No+Avatar"}
            alt="Profile"
            className="profile-image"
            style={{ width: '8em', height: '12em', borderRadius: "50% / 30%", objectFit: "cover", margin: '.5em 2em' }}
            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Avatar"; }}
          />
          <button type="button" className="btn btn-secondary" onClick={() => setShowAvatarModal(true)}>
            Change Avatar
          </button>
        </div>

        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
              setFirstNameError(!validName);
            }}
            required
          />
          {firstNameError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Must start with a capital letter and contain at least 2 characters
            </div>
          )}
        </div>

       <div className="mb-3">
          <label>Last Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
              setLastNameError(!validName);
            }}
            required
          />
          {lastNameError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Must start with a capital letter and contain at least 2 characters
            </div>
          )}
        </div>

       <div className="mb-3">
          <label>Phone Number</label>
          <input
            type="text"
            className="form-control"
            placeholder="Phone Number"
            value={phoneNumber}
            maxLength="11"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setPhoneNumber(value);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const isValidPhoneNumber = /^09\d{9}$/.test(value);
              setPhoneNumberError(!isValidPhoneNumber);
            }}
            required
          />
          {phoneNumberError && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              Phone number must start with 09 and be exactly 11 digits
            </div>
          )}
        </div>

      <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              setEmailError(!emailRegex.test(value));
            }}
            required
            disabled
          />
          {emailError && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              Please enter a valid email address
            </div>
          )}
        </div>

{/* Password Field */}
        <div className="mb-3 position-relative">
          <label>New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => {
              const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
              setPasswordError(!isValid);
            }}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
          {passwordError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-3 position-relative">
          <label>Re-enter New Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Re-enter Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmPasswordError(confirmPassword !== password)}
          />
          <span
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </span>
          {confirmPasswordError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Passwords do not match.
            </div>
          )}
        </div>

{/* Address Section */}
        <h5 className="mt-4 mb-2">Address</h5>
        <div className="mb-3">
          <label>Street</label>
          <input
            type="text"
            className="form-control"
            placeholder="Street"
            value={address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Barangay</label>
          <input
            type="text"
            className="form-control"
            placeholder="Barangay"
            value={address.barangay}
            onChange={(e) => handleAddressChange('barangay', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>City / Municipality</label>
          <input
            type="text"
            className="form-control"
            placeholder="City / Municipality"
            value={address.cityMunicipality}
            onChange={(e) => handleAddressChange('cityMunicipality', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Province</label>
          <input
            type="text"
            className="form-control"
            placeholder="Province"
            value={address.province}
            onChange={(e) => handleAddressChange('province', e.target.value)}
            required
          />
        </div>
<div className="mb-3">
          <label>Zip Code</label>
          <input
            type="text"
            className="form-control"
            placeholder="Zip Code (Optional)"
            value={address.zipCode}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
          />
        </div>
<div className="mb-3">
  <label>Rate Amount (₱):</label>
  <input
    type="number"
    min="0"
    className="form-control"
    placeholder="e.g. 100"
    value={rateAmount || ""}
    onChange={e => setRateAmount(e.target.value)}
  />
</div>
<div className="mb-3">
  <label>Rate Unit/Label:</label>
  <select
    className="form-control"
    value={rateUnit || ""}
    onChange={e => {
      setRateUnit(e.target.value);
      if (e.target.value !== "custom") setCustomRateUnit("");
    }}
  >
    <option value="">Select unit</option>
    <option value="per hour">per hour</option>
    <option value="per session">per session</option>
    <option value="per kilo">per kilo</option>
    <option value="custom">Custom...</option>
  </select>
  {rateUnit === "custom" && (
    <input
      type="text"
      className="form-control"
      placeholder="Enter custom unit"
      value={customRateUnit || ""}
      onChange={e => setCustomRateUnit(e.target.value)}
    />
  )}
</div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={updateData} className="btn btn-primary">
            Save Changes
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </div>

      {showAvatarModal && (
  <div className="modal-overlay" style={{
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
  }}>
    <div style={{
      background: "#fff", borderRadius: 8, padding: 24, minWidth: 320, position: "relative", maxHeight: "80vh", overflowY: "auto"
    }}>
      <button
        onClick={() => setShowAvatarModal(false)}
        style={{
          position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer"
        }}
        aria-label="Close"
      >×</button>
      <h4>Select an Avatar</h4>
      {/* Group avatars by category */}
      {[ "Customer",
        "AutomobileMechanic",
        "Baker","Barber",
        "Carpenter","Cleaner","ClothesWasher","ComputerTech","Cook",
        "Electrician",
        "MotorMechanic",
        "Painter","PhoneTech","Plumber",
        "Technician", "Tutor"
      ].map(category => (
        <div key={category}>
          <h5>{category}</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(num => {
              const filename = `${category} (${num}).png`;
              return (
                <img
                  key={filename}
                  src={`/avatars/${filename}`}
                  alt={filename}
                  style={{
                    width: 60, height: 60, borderRadius: "50%",
                    border: selectedAvatar === filename ? "3px solid #007bff" : "2px solid #ccc",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setSelectedAvatar(filename);
                    setShowAvatarModal(false);
                  }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}

export default UpdateUser;
