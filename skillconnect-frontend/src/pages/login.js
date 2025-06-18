import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { LoginHelper } from '../controllers/login-control';
import Navbar from "../components/navbar";
import '../assets/styles/form.css';
import API_BASE_URL from "../config/api";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.helper = new LoginHelper(this);
    this.handleSubmit = this.helper.handleSubmit;

    this.state = {
      email: "",
      password: "",
      showSuccessMessage: false,
      showPassword: false,
      showAdminPopup: false,
      adminPasswordSent: false,
      adminPassword: "",
      adminError: "",
    };
  }

  togglePassword = () => {
    this.setState(prev => ({ showPassword: !prev.showPassword }));
  }

  handleEmailChange = (e) => {
    const email = e.target.value;
    this.setState({ email });
    if (email === "admin@skillconnect.com") {
      this.setState({ showAdminPopup: true });
    } else {
      this.setState({ showAdminPopup: false, adminPasswordSent: false, adminError: "" });
    }
  }

  handleSendAdminPassword = async () => {
    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    this.setState({ adminPassword: randomPassword });

    // Send to backend to email
    const res = await fetch(`${API_BASE_URL}/send-admin-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: randomPassword }),
    });
    const data = await res.json();
    if (data.status === "ok") {
      this.setState({ adminPasswordSent: true, adminError: "" });
    } else {
      this.setState({ adminError: "Failed to send password. Try again." });
    }
  }

  handleAdminLogin = (e) => {
    e.preventDefault();
    if (this.state.password === this.state.adminPassword) {
      window.localStorage.setItem("loggedIn", "true");
      window.localStorage.setItem("userType", "admin");
      window.location.href = "/admin-dashboard";
    } else {
      this.setState({ adminError: "Incorrect password." });
    }
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("registered") === "success") {
      this.setState({ showSuccessMessage: true });
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        <div className='FormContainer'>
          {this.state.showSuccessMessage && (
            <div className="alert alert-success text-center" style={{ marginBottom: "1rem", padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px" }}>
              Registered successfully. Please log in.
            </div>
          )}

          <form className="Form" onSubmit={this.state.email === "admin@skillconnect.com" ? this.handleAdminLogin : this.handleSubmit}>
            <h3 className='text-center'>Login</h3>

            <div className="mb-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
            </div>

            <div className="mb-3 position-relative">
              <label>Password</label>
              <input
                type={this.state.showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={this.state.password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
              <span
                onClick={this.togglePassword}
                style={{ position: 'absolute', right: '10px', top: '32px', cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={this.state.showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {this.state.showAdminPopup && (
              <div className="admin-popup" style={{ background: "#fffbe6", border: "1px solid #f0e130", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <p>Admin detected. <button type="button" onClick={this.handleSendAdminPassword} disabled={this.state.adminPasswordSent}>Send Password</button></p>
                {this.state.adminPasswordSent && <p style={{ color: "green" }}>Password sent to sagunmarkvincent@gmail.com</p>}
                {this.state.adminError && <p style={{ color: "red" }}>{this.state.adminError}</p>}
              </div>
            )}

            <div className="d-grid">
              <button
                type="submit"
                className="font-bold py-2 px-4 rounded"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4a017'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0e130'}
                style={{ backgroundColor: '#f0e130' }}
              >
                Login
              </button>
            </div>

            <p className="forgot-password text-center text-7xl">
              No Account yet? <a href="/sign-up">Sign In as a User</a> or <a href="/register-provider">Sign In as a Provider</a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}
