// helpers/registry-business.js

export class RegistryBusiness {
  constructor(component) {
    this.component = component;

    if (!component.state) {
      component.state = {
        firstName: "",
        lastName: "",
        mobile: "",
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

    const {
      firstName,
      lastName,
      mobile,
      email,
      password,
      confirmPassword,
      address,
      serviceCategory,
      nbiClearance,
      barangayClearance,
      certificate,
      governmentId,
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
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("serviceCategory", serviceCategory);
    formData.append("userType", "business");
    formData.append("address", JSON.stringify(address));

    if (nbiClearance) formData.append("nbiClearance", nbiClearance);
    if (barangayClearance) formData.append("barangayClearance", barangayClearance);
    if (certificate) formData.append("certificate", certificate);
    if (governmentId) formData.append("governmentId", governmentId);

    fetch("http://localhost:5001/register-business", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log(data, "businessRegister");

        // Update this line based on actual backend value
        if (data.status === "success!" || data.status === "success") {
          // ✅ Redirect with success flag
          window.location.href = "/sign-in?registered=success";
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
