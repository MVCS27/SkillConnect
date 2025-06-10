import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


function UpdateUser() {
  const location = useLocation();
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(false);
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

   // Address state
  const [address, setAddress] = useState({
    street: "",
    barangay: "",
    cityMunicipality: "",
    province: "",
    zipCode: "",
  });

    useEffect(() => {
    if (location.state) {
      setFirstName(location.state.firstName || "");
      setLastName(location.state.lastName || "");
      setMobile(location.state.mobile || "");
      setEmail(location.state.email || "");
      setAddress(location.state.address || {
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        zipCode: "",
      });
    }
  }, [location.state]);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

    const updateData = () => {
         // Add validation before sending
    const validFirstName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(firstName.trim());
    const validLastName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(lastName.trim());
    const isValidMobile = /^09\d{9}$/.test(mobile);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailRegex.test(email);

    setFirstNameError(!validFirstName);
    setLastNameError(!validLastName);
    setMobileError(!isValidMobile);
    setEmailError(!validEmail);

    if (!validFirstName || !validLastName || !isValidMobile || !validEmail) {
      return;
    }
        fetch("http://localhost:5001/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
        id: location.state._id,
        firstName,
        lastName,
        mobile,
        email,
        address,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Request failed: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        window.location.href = "/customer-profile";
      })
      .catch((err) => {
        alert("Something went wrong. Check the console.");
      });
  };

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                
<div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
              setFirstNameError(!validName);
            }}
            required
          />
          {firstNameError && (
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
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const validName = /^([A-Z][a-z]{1,})([ -][A-Z][a-z]{1,})*$/.test(value);
              setLastNameError(!validName);
            }}
            required
          />
          {lastNameError && (
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
            value={mobile}
            maxLength="11"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setMobile(value);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const isValidMobile = /^09\d{9}$/.test(value);
              setMobileError(!isValidMobile);
            }}
            required
          />
          {mobileError && (
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              setEmailError(!emailRegex.test(value));
            }}
            required
            disabled
          />
          {emailError && (
            <div style={{ color: "red", fontSize: "0.875rem" }}>
              Please enter a valid email address
            </div>
          )}
        </div>

{/* Address Section */}
        <h5 className="mt-4 mb-2">Address</h5>
        <div className="mb-3">
          <label>Street</label>
          <input
            type="text"
            className="form-control"
            placeholder="Street"
            value={address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Barangay</label>
          <input
            type="text"
            className="form-control"
            placeholder="Barangay"
            value={address.barangay}
            onChange={(e) => handleAddressChange('barangay', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>City / Municipality</label>
          <input
            type="text"
            className="form-control"
            placeholder="City / Municipality"
            value={address.cityMunicipality}
            onChange={(e) => handleAddressChange('cityMunicipality', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Province</label>
          <input
            type="text"
            className="form-control"
            placeholder="Province"
            value={address.province}
            onChange={(e) => handleAddressChange('province', e.target.value)}
            required
          />
        </div>
<div className="mb-3">
          <label>Zip Code</label>
          <input
            type="text"
            className="form-control"
            placeholder="Zip Code (Optional)"
            value={address.zipCode}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
          />
        </div>

        <button onClick={updateData} className="btn btn-primary">
          Save Changes
        </button>
            </div>
        </div>
    );
}

export default UpdateUser;
