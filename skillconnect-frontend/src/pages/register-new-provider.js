import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { RegistryBusiness } from '../controllers/registry-business';
import Navbar from "../components/navbar";
import '../assets/styles/form.css';
import API_BASE_URL from "../config/api";

//import app from "../config/firebase-config";
//import { getAuth, RecaptchaVerifier } from "firebase/auth";

export default class ProviderSignUp extends Component {

  constructor(props) {
    super(props);
    this.helper = new RegistryBusiness(this);
    this.handleSubmit = this.helper.handleSubmit;

     this.state = {
      firstName: "",
      lastName: "",
      firstNameError: false,
      lastNameError: false,
      phoneNumber: "", // <-- use only this
      phoneNumberError: false,
      email: "",
      emailError: false,
      password: "",
      passwordError: false,
      confirmPassword: "",
      confirmPasswordError: false,
      showPassword: false,
      showConfirmPassword: false,
      // Additional fields for service provider registration
      serviceCategory: "",
      serviceCategoryOther: "",
      serviceCategoryOtherError: false,
      nbiClearance: null,
      barangayClearance: null,
      certificate: null,
      governmentId: null,
      address: {
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        zipCode: "",
      },
      emailVerified: false,
      showEmailPopup: false,
      verificationCode: "",
      codeInput: "",
      codeStatus: "", // "pending", "success", "error"
      codeError: "",
    };
  }

   togglePassword = () => {
    this.setState(prev => ({ showPassword: !prev.showPassword }));
  }

  toggleConfirmPassword = () => {
    this.setState(prev => ({ showConfirmPassword: !prev.showConfirmPassword }));
  }

   handleAddressChange = (field, value) => {
    this.setState(prev => ({
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  }

  sendVerificationCode = async () => {
    const { email } = this.state;
    if (!email) return;
    this.setState({ codeStatus: "pending", codeError: "" });
    const res = await fetch(`${API_BASE_URL}/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      this.setState({ showEmailPopup: true, codeStatus: "" });
    } else {
      this.setState({ codeStatus: "error", codeError: data.message || "Failed to send code." });
    }
  };

  verifyCode = async () => {
    const { email, codeInput } = this.state;
    if (!codeInput) return;
    const res = await fetch(`${API_BASE_URL}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: codeInput }),
    });
    const data = await res.json();
    if (data.success) {
      this.setState({ emailVerified: true, codeStatus: "success", codeError: "" });
    } else {
      this.setState({ codeStatus: "error", codeError: "Incorrect code." });
    }
  };

  render() {
    
     const { address } = this.state;

    return (
      <div>
        <Navbar />  {/* Navbar will always appear */}

         <div className='FormContainer'>
           <form className="Form" onSubmit={this.handleSubmit}>
        <h3 className='text-center'>Create New Account as Service Provider</h3>

                  <div className="mb-3">
            <label>First Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="First Name"
              value={this.state.firstName}
              onChange={(e) => this.setState({ firstName: e.target.value })}
              onBlur={(e) => {
                const value = e.target.value.trim();
                const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
                this.setState({ firstNameError: !validName });
              }}
              required
            />
            {this.state.firstNameError && (
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
              value={this.state.lastName}
              onChange={(e) => this.setState({ lastName: e.target.value })}
              onBlur={(e) => {
                const value = e.target.value.trim();
                const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
                this.setState({ lastNameError: !validName });
              }}
              required
            />
            {this.state.lastNameError && (
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
            value={this.state.phoneNumber}
            maxLength="11"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              this.setState({ phoneNumber: value });
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const isValidPhone = /^09\d{9}$/.test(value);
              this.setState({ phoneNumberError: !isValidPhone });
            }}
            required
          />
          {this.state.phoneNumberError && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              Phone number must start with 09 and be exactly 11 digits
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className={`form-control${this.state.codeStatus === "error" ? " is-invalid" : ""}${this.state.codeStatus === "success" ? " is-valid" : ""}`}
            placeholder="Enter Email"
            value={this.state.email}
            onChange={(e) => {
              this.setState({ email: e.target.value, emailVerified: false, showEmailPopup: false, codeStatus: "", codeInput: "" });
            }}
            onBlur={this.sendVerificationCode}
            required
          />
          {this.state.emailError && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              Please enter a valid email address
            </div>
          )}

          {/* Email Verification Popup - MOVE THIS INSIDE THE EMAIL FIELD DIV */}
          {this.state.showEmailPopup && (
            <div className="email-popup" style={{ background: "#fffbe6", border: "1px solid #f0e130", padding: 16, borderRadius: 8, marginTop: 8 }}>
              <p>Enter the verification code sent to your email.</p>
              <input
                type="text"
                value={this.state.codeInput}
                onChange={e => this.setState({ codeInput: e.target.value })}
                className={`form-control${this.state.codeStatus === "error" ? " is-invalid" : ""}${this.state.codeStatus === "success" ? " is-valid" : ""}`}
                style={{ borderColor: this.state.codeStatus === "error" ? "red" : this.state.codeStatus === "success" ? "green" : undefined }}
              />
              <button type="button" onClick={this.verifyCode} disabled={this.state.codeStatus === "success"}>Verify</button>
              <button
                type="button"
                onClick={this.sendVerificationCode}
                style={{ marginLeft: 8 }}
                disabled={this.state.codeStatus === "pending"}
              >
                Resend Code
              </button>
              {this.state.codeStatus === "pending" && <div style={{ color: "#888" }}>Sending code...</div>}
              {this.state.codeStatus === "error" && <div style={{ color: "red" }}>{this.state.codeError}</div>}
              {this.state.codeStatus === "success" && <div style={{ color: "green" }}>Email verified!</div>}
            </div>
          )}
        </div>
        
        
        {/* Password Field */}
        <div className="mb-3 position-relative">
        <label>Password</label>
          <input
            type={this.state.showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Enter Password"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
            onBlur={() => {
              const password = this.state.password;
              const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
              this.setState({ passwordError: !isValid });
            }}
            required
          />
          <span
            onClick={this.togglePassword}
            style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={this.state.showPassword ? faEyeSlash : faEye} />
          </span>
          {this.state.passwordError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </div>
          )}
        </div>
        
        
        {/* Confirm Password Field */}
        <div className="mb-3 position-relative">
          <label>Re-enter Password</label>
          <input
            type={this.state.showConfirmPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Re-enter Password"
            value={this.state.confirmPassword}
            onChange={(e) => this.setState({ confirmPassword: e.target.value })}
            onBlur={() => {
              const { password, confirmPassword } = this.state;
              this.setState({ confirmPasswordError: confirmPassword !== password });
            }}
            required
          />
          <span
            onClick={this.toggleConfirmPassword}
            style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={this.state.showConfirmPassword ? faEyeSlash : faEye} />
          </span>
          {this.state.confirmPasswordError && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              Passwords do not match.
            </div>
          )}
        </div>

                 {/* Address Section */}
          <h5 className="mt-4 mb-2">Address</h5>

          <div className="mb-3">
            <label>Street</label>
            <input type="text" className="form-control" placeholder="Street"
              value={address.street}
              onChange={(e) => this.handleAddressChange('street', e.target.value)}
              required
               />
          </div>

          <div className="mb-3">
            <label>Barangay</label>
            <input type="text" className="form-control" placeholder="Barangay"
              value={address.barangay}
              onChange={(e) => this.handleAddressChange('barangay', e.target.value)}
              required
               />
          </div>

          <div className="mb-3">
            <label>City / Municipality</label>
            <input type="text" className="form-control" placeholder="City / Municipality"
              value={address.cityMunicipality}
              onChange={(e) => this.handleAddressChange('cityMunicipality', e.target.value)}
              required
               />
          </div>

          <div className="mb-3">
            <label>Province</label>
            <input type="text" className="form-control" placeholder="Province"
              value={address.province}
              onChange={(e) => this.handleAddressChange('province', e.target.value)}
              required
               />
          </div>

          <div className="mb-3">
            <label>Zip Code</label>
            <input type="text" className="form-control" placeholder="Zip Code (Optional)"
              value={address.zipCode}
              onChange={(e) => this.handleAddressChange('zipCode', e.target.value)} />
          </div>


            <div className="mb-3">
              <label>Service Category</label>
              <select
                className="form-control"
                value={this.state.serviceCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  this.setState({ 
                    serviceCategory: value,
                    serviceCategoryOther: "", // reset custom field if not "others"
                    serviceCategoryOtherError: false
                  });
                }}
                required
              >
                <option value="">Select a service</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Technician">Technician</option>
                <option value="others">Others</option>
              </select>
            </div>
            {this.state.serviceCategory === "others" && (
              <div className="mb-3">
                <label>Please specify</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter service category"
                  value={this.state.serviceCategoryOther || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    this.setState({ serviceCategoryOther: value });
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    const valid = /^[A-Z][a-zA-Z\s]*$/.test(value);
                    this.setState({ serviceCategoryOtherError: !valid });
                  }}
                  required
                />
                {this.state.serviceCategoryOtherError && (
                  <div style={{ color: 'red', fontSize: '0.875rem' }}>
                    Must start with a capital letter.
                  </div>
                )}
              </div>
            )}


            <div className="mb-3">
              <label>NBI Clearance</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="form-control"
                onChange={(e) => this.setState({ nbiClearance: e.target.files[0] })}
              />
            </div>

            <div className="mb-3">
              <label>Barangay Clearance</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="form-control"
                onChange={(e) => this.setState({ barangayClearance: e.target.files[0] })}
              />
            </div>

            <div className="mb-3">
              <label>Training Certificate</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="form-control"
                onChange={(e) => this.setState({ certificate: e.target.files[0] })}
              />
            </div>

            <div className="mb-3">
              <label>Government-issued ID</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="form-control"
                onChange={(e) => this.setState({ governmentId: e.target.files[0] })}
                required
              />
            </div>
      
                <div className="d-grid">
                  <button type="submit" className="font-bold py-2 px-4 rounded" 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4a017'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0e130'}
                    style={{ backgroundColor: '#f0e130' }}>
                    Sign Up
                  </button>
                </div>
                <p className="forgot-password text-center text-7xl">
                  Already registered? <a href="/sign-in">Login</a>
                </p>
      </form>

        </div>

        
      </div>
    )
  }
}