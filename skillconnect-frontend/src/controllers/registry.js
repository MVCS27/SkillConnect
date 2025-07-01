// helpers/UserRegisterHelper.js

import API_BASE_URL from "../config/api";

export class Registry {
  constructor(component) {
    this.component = component;

    component.state = {
      firstName: "",
      lastName: "",
      phoneNumber: "", // changed from mobile
      email: "",
      password: "",
      confirmPassword: "",
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


    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    // Require email verification
    if (!this.component.state.emailVerified) {
      alert("Please verify your email before signing up.");
      return;
    }

    const { firstName, lastName, phoneNumber, email, password, confirmPassword, address  } = this.component.state;

    // Validate password match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const username = `${firstName} ${lastName}`.trim(); // You can format it differently if needed

    // Proceed with registration
    fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ firstName, lastName, username, phoneNumber, email, password, address }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Registration response:", data);
        if (data.status === "success") {
          window.location.href = "/sign-in?registered=success";
        } else if (data.error === "Mobile Number Already Exists") {
          alert("Mobile number already exists. Please use a different number.");
        } else {
          // Show the real error message
          let errorMsg = typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
          alert("Registration failed. " + errorMsg);
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        alert("An error occurred while registering.");
      });
  }
}
