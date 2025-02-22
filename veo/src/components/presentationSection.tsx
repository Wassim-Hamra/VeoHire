import React from 'react';
import '../assets/styles/presentationsection.css';

function PresentationSection() {
  return (
    <section className="presentation-section">
      <div className="presentation-content">
        <h1>Trouvez le talent idéal</h1>
        <p>Notre plateforme de recrutement vous connecte avec les meilleurs candidats.</p>
        <button className="presentation-button">Commencer</button>
      </div>
    </section>
  );
}

export default PresentationSection;