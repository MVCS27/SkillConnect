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
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password } = this.component.state;

    fetch(`${API_BASE_URL}/loginUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userLogin");

          if (data.status === "success!") {
            window.localStorage.setItem("token", data.data);
            window.localStorage.setItem("userType", data.userType);
            window.localStorage.setItem("loggedIn", true);

            if (data.userType === "admin") {
              window.location.href = "/admin-dashboard";
            } else if (data.userType === "business") {
              if (data.isVerifiedBusiness) {
                window.location.href = "/business-profile";
              } else {
                window.location.href = "/account-verify";
              }
            } else if (data.userType === "customer") {  // ✅ This is the correct match
              window.location.href = "/customer-profile";
            } else {
              alert("Unknown user type: " + data.userType);
            }
          } else {
            alert("Invalid credentials or login failed.");
          }
        })
        .catch((err) => {
          console.error("Login error:", err);
          alert("An error occurred. Please try again.");
      });
  }
}
