import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import UpdateUser from './components/update-user';

import UserSignUp from './pages/register-new-user';
import Login from './pages/login';
import UserDetails from './pages/userProfile';
import BusinessDetails from './pages/businessProfile';
import ProviderSignUp from './pages/register-new-provider';
import LandingPage from './pages/landing-page';
import ProviderList from './pages/provider-list';
import ProviderDetails from './pages/provider-details';

import ImageUpload from './tests/imageUpload';
import ProtectedRoute from './routes/routes';

function App() {
  const isLoggedIn = window.localStorage.getItem("loggedIn") === "true";
  const userType = window.localStorage.getItem("userType");

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={isLoggedIn ? <Navigate to={`/${userType}-profile`} /> : <LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<UserSignUp />} />
        <Route path="/register-provider" element={<ProviderSignUp />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Shared Routes */}
          <Route path="/update-user" element={<UpdateUser />} />
          <Route path="/uploadimage" element={<ImageUpload />} />

          {/* Customer Routes */}
          {userType === "customer" && (
            <>
              <Route path="/customer-profile" element={<UserDetails />} />
              <Route path="/provider-list" element={<ProviderList />} />
              <Route path="/provider-details/:id" element={<ProviderDetails />} />
            </>
          )}

          {/* Business Routes */}
          {userType === "business" && (
            <Route path="/business-profile" element={<BusinessDetails />} />
          )}

          {/* Add Admin Routes here */}
        </Route>

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
