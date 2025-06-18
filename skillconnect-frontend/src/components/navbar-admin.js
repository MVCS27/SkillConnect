import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faFileLines,
  faCalendarCheck,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/navbar.css';
import logo from '../assets/images/Skill.png';
import { logOutUser } from '../controllers/logout';

function NavbarAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Brand & Toggle */}
        <div className="navbar-brand">
          <Link to="/admin-dashboard" className="navbar-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            <span className="brand-name">SkillConnect</span>
          </Link>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {/* Navigation Links */}
        <div ref={menuRef} className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <button onClick={() => navigate('/admin-dashboard')} className="profile-button">
            <FontAwesomeIcon icon={faGauge} /> Dashboard
          </button>
          <button onClick={() => navigate('/admin-users')} className="profile-button">
            <FontAwesomeIcon icon={faUsers} /> Users
          </button>
          <button onClick={() => navigate('/admin-providers')} className="profile-button">
            <FontAwesomeIcon icon={faFileLines} /> Providers
          </button>
          <button onClick={() => navigate('/admin-bookings')} className="profile-button">
            <FontAwesomeIcon icon={faCalendarCheck} /> Bookings
          </button>
          <button onClick={logOutUser} className="nav-button">
            <FontAwesomeIcon icon={faRightFromBracket} /> Log Out
          </button>
        </div>

      </div>
    </nav>
  );
}

export default NavbarAdmin;
