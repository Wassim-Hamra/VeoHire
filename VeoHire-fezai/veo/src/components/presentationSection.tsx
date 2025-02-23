import React from 'react';
import '../assets/styles/presentationsection.css';
import { useNavigate } from "react-router-dom";

function PresentationSection() {
  const navigate = useNavigate();
  return (
    <section className="presentation-section">
      <div className="presentation-content">
        <h1>Find The Best Talents</h1>
        <p>Our recruting platform connects you with the top-class candidats.</p>
        <button className="presentation-button" onClick={()=>{navigate("/jobform")}}>Get Started</button>
      </div>
    </section>
  );
}

export default PresentationSection;