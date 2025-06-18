import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { Registry } from '../controllers/registry';
import Navbar from "../components/navbar";
import '../assets/styles/form.css';

//import app from "../config/firebase-config";
//import { getAuth, RecaptchaVerifier } from "firebase/auth";

export default class UserSignUp extends Component {

  constructor(props) {
    super(props);
    this.helper = new Registry(this);
    this.handleSubmit = this.helper.handleSubmit;

    this.state = {
      firstName: "",
      lastName: "",
      firstNameError: false,
      lastNameError: false,
      mobile: "",
      email: "",
      mobileError: false,
      emailError: false,
      password: "",
      passwordError: false,
      confirmPassword: "",
      confirmPasswordError: false,
      showPassword: false,
      showConfirmPassword: false,
      address: {
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        zipCode: "",
      }
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

  render() {
    
     const { address } = this.state;

    return (
       <div>
        <Navbar />  {/* Navbar will always appear */}

        <div className='FormContainer'>
        <form className="Form" onSubmit={this.handleSubmit}>
          <h3 className='text-center'>Create New Account</h3>

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
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Mobile Number"
              value={this.state.mobile}
              maxLength="11"
              inputMode="numeric"
              onChange={(e) => {
                // Allow only digits
                const value = e.target.value.replace(/\D/g, "");
                this.setState({ mobile: value });
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const isValidMobile = /^09\d{9}$/.test(value);
                this.setState({ mobileError: !isValidMobile });
              }}
              required
            />
            {this.state.mobileError && (
              <div style={{ color: "red", fontSize: "0.875rem" }}>
                Mobile number must start with 09 and be exactly 11 digits
              </div>
            )}
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              onBlur={(e) => {
                const value = e.target.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                this.setState({ emailError: !emailRegex.test(value) });
              }}
              required
            />
            {this.state.emailError && (
              <div style={{ color: "red", fontSize: "0.875rem" }}>
                Please enter a valid email address
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