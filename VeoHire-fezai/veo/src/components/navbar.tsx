import React from 'react';
import '../assets/styles/navbar.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; // Import Link

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="RecruitUp Logo" />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <a href="#about" className="nav-link">About</a>
      </div>
    </nav>
  );
}

export default Navbar;