import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGear,
  faFileLines,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/navbar.css';
import logo from '../assets/images/Skill.png';
import { logOutUser } from '../controllers/logout';

function NavbarLogedIn({ searchValue, setSearchValue }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
        <div className="navbar-brand">
          <Link to="/business-profile" className="navbar-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            <span className="brand-name">SkillConnect</span>
          </Link>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        <div ref={menuRef} className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {location.pathname === "/provider-list" ? (
            <>
              <button onClick={() => navigate('/customer-profile')} className="profile-button">
                <FontAwesomeIcon icon={faGear} /> Profile
              </button>
              <input
                type="text"
                className="search-bar"
                placeholder="Search providers or service..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: 200, marginLeft: 10, marginRight: 10 }}
              />
              <button onClick={logOutUser} className="nav-button">
                <FontAwesomeIcon icon={faRightFromBracket} /> Log Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/customer-profile')} className="profile-button">
                <FontAwesomeIcon icon={faGear} /> Profile
              </button>
              <button onClick={() => navigate('/provider-list')} className="profile-button">
                <FontAwesomeIcon icon={faFileLines} /> Search Service Providers
              </button>
              <button onClick={logOutUser} className="nav-button">
                <FontAwesomeIcon icon={faRightFromBracket} /> Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarLogedIn;
