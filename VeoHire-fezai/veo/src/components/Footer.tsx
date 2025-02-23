import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/footer.css';

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>VeoHire</h3>
          <p>Your trusted partner in finding the best talents.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#about">About</a></li>
            <li><Link to="/jobform">Post a Job</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>Email: contact@recruitup.com</li>
            <li>Tel: +216 23 45 67 89</li>
            <li>Paris, France</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 RecruitUp. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
