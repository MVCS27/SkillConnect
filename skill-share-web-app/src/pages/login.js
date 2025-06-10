import React, { Component } from 'react';
import { LoginHelper } from '../controllers/login-control'; // adjust path if needed
import Navbar from "../components/navbar";
import '../assets/styles/form.css';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.helper = new LoginHelper(this);
    this.handleSubmit = this.helper.handleSubmit;

    this.state = {
      email: "",
      password: "",
      showSuccessMessage: false,
    };
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("registered") === "success") {
      this.setState({ showSuccessMessage: true });

      // Optional: remove the query param from URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }

  render() {
    return (
      <div>
        <Navbar />  {/* Navbar will always appear */}

        <div className='FormContainer'>
          {this.state.showSuccessMessage && (
            <div className="alert alert-success text-center" style={{ marginBottom: "1rem", padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px" }}>
              Registered successfully. Please log in.
            </div>
          )}

          <form className="Form" onSubmit={this.handleSubmit}>
            <h3 className='text-center'>Login</h3>

            <div className="mb-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>

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

            {/*<p className="forgot-password text-center text-7xl">
              <a href="#">Forgot password?</a>
             </p>*/}
            <p className="forgot-password text-center text-7xl">
              No Account yet? <a href="/sign-up">Sign In as a User</a> or <a href="/register-provider">Sign In as a Provider</a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}
