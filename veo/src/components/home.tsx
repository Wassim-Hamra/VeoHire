import React from 'react';
import '../assets/styles/home.css'; // Importez le fichier CSS

function Home() {
  return (
    <div className="home">
      {/* Section Hero */}

      {/* Section Fonctionnalités */}
      <section className="features">
        <h2>Nos Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Pipeline automatisé pour le recrutement</h3>
            <p>Trouvez des offres d'emploi adaptées à votre profil.</p>
          </div>
          <div className="feature">
            <h3>Recrutement de talents</h3>
            <p>Découvrez des candidats qualifiés pour votre entreprise.</p>
          </div>
          <div className="feature">
            <h3>Gestion simplifiée</h3>
            <p>Suivez vos candidatures et entretiens en un seul endroit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;