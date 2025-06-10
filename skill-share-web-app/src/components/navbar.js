import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/navbar.css';
import logo from '../assets/images/Skill.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/landing-page" className="navbar-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            <span className="brand-name">SkillConnect</span>
          </Link>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        <div ref={menuRef} className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/landing-page" className="nav-link">Home</Link>
          <Link to="/sign-up" className="nav-link">Sign up</Link>
          <Link to="/sign-in" className="nav-link">Login</Link>
          <Link to="/register-provider" className="nav-button">
            Become a Service Provider
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
