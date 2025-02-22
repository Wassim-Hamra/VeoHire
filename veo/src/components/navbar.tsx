import React from 'react';
import '../assets/styles/navbar.css';
import logo from '../assets/logo.png'; // Importez l'image

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="RecruitUp Logo" /> {/* Utilisez l'image ici */}
      </div>
      <div className="navbar-links">
        <a href="#about">À propos</a>
      </div>
    </nav>
  );
}

export default Navbar;