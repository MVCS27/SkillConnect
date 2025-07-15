// helpers/LoginHelper.js

import API_BASE_URL from "../config/api";

export class LoginHelper {
  constructor(component) {
    this.component = component;

    component.state = {
      email: "",
      password: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.component.state;
    // 1. Check credentials first
    const res = await fetch(`${API_BASE_URL}/loginUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.status === "success") {
      // 2. Send OTP to email
      this.component.setState({ otpSent: false, otpInput: "", otpStatus: "pending", otpError: "" });
      const otpRes = await fetch(`${API_BASE_URL}/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const otpData = await otpRes.json();
      if (otpData.success) {
        this.component.setState({ otpSent: true, otpStatus: "" });
        // Save token and userType temporarily until OTP is verified
        this.component._pendingLogin = {
          token: data.data,
          userType: data.userType,
          isVerifiedBusiness: data.isVerifiedBusiness,
          user: data.user,
        };
      } else {
        this.component.setState({ otpStatus: "error", otpError: otpData.message || "Failed to send OTP." });
      }
    } else if (data.status === "suspended") {
      alert(data.error || "Your business account is suspended.");
    } else if (data.status === "rejected") {
      alert(data.error || "Your business account was rejected.");
    } else {
      this.component.setState({ otpStatus: "error", otpError: data.error || "Login failed." });
    }
  };

  verifyOtp = async () => {
    const { email, otpInput } = this.component.state;
    this.component.setState({ otpStatus: "pending", otpError: "" });
    const res = await fetch(`${API_BASE_URL}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otpInput }),
    });
    const data = await res.json();
    if (data.success) {
      this.component.setState({ otpStatus: "success" });
      // Proceed to login: store token, redirect, etc.
      const { token, userType, isVerifiedBusiness, user } = this.component._pendingLogin;
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("loggedIn", "true");
      window.localStorage.setItem("userType", userType);
      window.localStorage.setItem("userId", user._id);
      if (userType === "business") {
        if (!isVerifiedBusiness) {
          window.location.href = "/provider-verification";
        } else {
          window.location.href = "/provider-dashboard";
        }
      } else if (userType === "customer") {
        window.location.href = "/customer-profile";
      } else if (userType === "admin") {
        window.location.href = "/admin-dashboard";
      }
    } else {
      this.component.setState({ otpStatus: "error", otpError: "Incorrect code." });
    }
  };
}
