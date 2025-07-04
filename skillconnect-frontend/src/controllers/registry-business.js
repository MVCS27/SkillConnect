// helpers/registry-business.js

import API_BASE_URL from "../config/api";

export class RegistryBusiness {
  constructor(component) {
    this.component = component;

    if (!component.state) {
      component.state = {
        firstName: "",
        lastName: "",
        phoneNumber: "", // changed from mobile
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
        serviceCategory: "",
        address: {
          street: "",
          barangay: "",
          cityMunicipality: "",
          province: "",
          zipCode: "",
        },
        nbiClearance: null,
        barangayClearance: null,
        certificate: null,
        governmentId: null,
      };
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    // Require email verification
    if (!this.component.state.emailVerified) {
      alert("Please verify your email before signing up.");
      return;
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      confirmPassword,
      address,
      serviceCategory,
      serviceCategoryOther, // <-- add this
      nbiClearance,
      barangayClearance,
      certificate,
      governmentId,
      rateAmount,
      rateUnit,
      customRateUnit,
    } = this.component.state;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();

    const username = `${firstName} ${lastName}`.trim();
    formData.append("username", username);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("password", password);

    // Use the custom value if "others" is selected
    let finalServiceCategory = serviceCategory;
    if (serviceCategory === "others" && serviceCategoryOther) {
      finalServiceCategory = serviceCategoryOther;
    }
    formData.append("serviceCategory", finalServiceCategory);

    formData.append("userType", "business");
    formData.append("address", JSON.stringify(address));

    if (nbiClearance) formData.append("nbiClearance", nbiClearance);
    if (barangayClearance) formData.append("barangayClearance", barangayClearance);
    if (certificate) formData.append("certificate", certificate);
    if (governmentId) formData.append("governmentId", governmentId);
    formData.append("rateAmount", rateAmount);
    formData.append("rateUnit", rateUnit === "custom" ? customRateUnit : rateUnit);

    fetch(`${API_BASE_URL}/register-business`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log(data, "businessRegister");

        if (data.status === "success") {
          window.location.href = "/account-verify";
        } else {
          alert("Registration failed. " + (data.error || "Unknown error."));
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        alert("An error occurred while registering the business.");
      });
  }
}