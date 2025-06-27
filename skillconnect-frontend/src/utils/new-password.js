import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function NewPassword() {
  const [step, setStep] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Step 1: Find user by username or email
  const handleFindUser = async (e) => {
    e.preventDefault();
    setError("");
    if (!userInput.trim()) {
      setError("Please enter your username or email.");
      return;
    }
    try {
      // Try by username
      let res = await fetch(`${API_BASE_URL}/user/by-username/${userInput.trim()}`);
      let data = await res.json();
      if (data.status === "ok" && data.data) {
        setUserId(data.data._id);
        setStep(2);
        return;
      }
      // Try by email
      res = await fetch(`${API_BASE_URL}/user/by-email/${userInput.trim()}`);
      data = await res.json();
      if (data.status === "ok" && data.data) {
        setUserId(data.data._id);
        setStep(2);
        return;
      }
      setError("User not found.");
    } catch (err) {
      setError("Error finding user.");
    }
  };

  // Step 2: Validate and update password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");
    // Password validation (same as register/update)
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    if (!isValid) {
      setPasswordError("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
    try {
      // Update password
      const res = await fetch(`${API_BASE_URL}/updateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: userId, password }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        // Send notification email
        await fetch(`${API_BASE_URL}/send-password-changed-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        alert("Password changed successfully! You will be redirected to login.");
        navigate("/sign-in");
      } else {
        setError("Failed to update password.");
      }
    } catch (err) {
      setError("Error updating password.");
    }
  };

  return (
    <div className="FormContainer" style={{ maxWidth: 400, margin: "4em auto" }}>
      <button
        onClick={() => navigate("/landing-page")}
        style={{ marginBottom: 20, background: "none", border: "none", color: "#d4a017", cursor: "pointer", fontWeight: "bold" }}
      >
        &larr; Back to Home
      </button>
      <form className="Form" onSubmit={step === 1 ? handleFindUser : handlePasswordChange}>
        <h3 className="text-center">Reset Password</h3>
        {step === 1 && (
          <>
            <div className="mb-3">
              <label>Username or Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username or email"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: "red", fontSize: "0.875rem" }}>{error}</div>}
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Find Account</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="mb-3 position-relative">
              <label>New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
              {passwordError && <div style={{ color: "red", fontSize: "0.875rem" }}>{passwordError}</div>}
            </div>
            <div className="mb-3 position-relative">
              <label>Re-enter New Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
              {confirmPasswordError && <div style={{ color: "red", fontSize: "0.875rem" }}>{confirmPasswordError}</div>}
            </div>
            {error && <div style={{ color: "red", fontSize: "0.875rem" }}>{error}</div>}
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Change Password</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}