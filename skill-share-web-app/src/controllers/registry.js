// helpers/UserRegisterHelper.js

export class Registry {
  constructor(component) {
    this.component = component;

    component.state = {
      firstName: "",
      lastName: "",
      mobile: "",
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

    const { firstName, lastName, mobile, email, password, confirmPassword, address  } = this.component.state;

    // Validate password match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

     const username = `${firstName} ${lastName}`.trim(); // You can format it differently if needed

    // Proceed with registration
    fetch("http://localhost:5001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ firstName, lastName, username, mobile, email, password, address }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userRegister");

        if (data.status === "success!") {
          window.location.href = "/sign-in?registered=success";
        } else {
          alert("Registration failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        alert("An error occurred while registering.");
      });
  }
}
