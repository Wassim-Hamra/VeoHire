import React from 'react';
import '../assets/styles/navbar.css';
import logo from '../assets/logo.png'; // Importez l'image

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="RecruitUp Logo" />
      </div>
      <div className="navbar-links">
        <a href="https://veoworldwide.com/about">À propos</a>
        <a href="#services">Services</a>
        <a href="#contact">Contact</a>
        <a href="#blog">Blog</a>
      </div>
    </nav>
  );
}

export default Navbar;
