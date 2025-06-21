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
    }
  }, [location.state]);

  // Fetch current profile image on mount
  useEffect(() => {
    if (location.state && location.state._id) {
      fetch(`${API_BASE_URL}/user-profile-image/${location.state._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "ok" && data.image) {
            setProfileImage(`${API_BASE_URL}/images/${data.image}`);
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

    await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      body: formData,
    });
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
        id: location.state._id,
        firstName,
        lastName,
        phoneNumber,
        email,
        address,
        ...(password ? { password } : {})
      }),
    });
    const data = await response.json();
    if (data.status === "ok") {
      if (profileImageFile) {
        await uploadProfileImage(location.state._id);
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
            src={profileImage || "https://placehold.co/100x100"}
            alt="Profile"
            className="profile-image"
            style={{ width: '8em', height: '12em', 
              borderRadius: "50% / 30%", objectFit: "cover", margin: '.5em 2em' }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: 10 }}
          />
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
    </div>
  );
}

export default UpdateUser;
