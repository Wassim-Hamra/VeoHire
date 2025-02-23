import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/HeroSection.css';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Intelligent Recrutement For Modern Entreprises</h1>
        <p>Automate your recrutement processus and find the best talents easier.</p>
        <div className="hero-buttons">
          <button 
            className="primary-button"
            onClick={() => navigate('/jobform')}
          >
            Post a job offer
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('#about')}
          >
            See more
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;