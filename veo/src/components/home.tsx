import React from 'react';
import '../assets/styles/home.css'; // Importez le fichier CSS
import logo from '../assets/logo.png'; // Importez l'image

function Home() {
  return (
    <div className="home">
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Rejoignez la réserve exclusive de talents</h1>
          <p>Découvrez un monde d'opportunités d'emploi passionnantes qui correspondent à vos aspirations et stimulent votre croissance professionnelle.</p>
          <button className="cta-button">Commencer</button>
        </div>
        <div className="hero-logo">
        <img src={logo} alt="RecruitUp Logo" />
      </div>
      </section>

      {/* Section Étapes */}
      <section className="steps">
        <h2>Rejoindre la réserve en 3 étapes</h2>
        <div className="steps-grid">
          <div className="step">
            <h3>Étape 1</h3>
            <p>Inscrivez-vous et définissez vos préférences pour une recherche personnalisée.</p>
          </div>
          <div className="step">
            <h3>Étape 2</h3>
            <p>Complétez votre biographie et votre évaluation pour faire ressortir votre profil.</p>
          </div>
          <div className="step">
            <h3>Étape 3</h3>
            <p>Entrez en contact avec les employeurs qui recrutent actuellement.</p>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="features">
        <h2>Nos Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Pipeline automatisé pour le recrutement</h3>
            <p>Trouvez des offres d'emploi adaptées à votre profil grâce à notre algorithme intelligent.</p>
          </div>
          <div className="feature">
            <h3>Recrutement de talents</h3>
            <p>Découvrez des candidats qualifiés pour votre entreprise, avec des outils de recrutement avancés.</p>
          </div>
          <div className="feature">
            <h3>Gestion simplifiée</h3>
            <p>Suivez vos candidatures et entretiens en un seul endroit, de manière intuitive et efficace.</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}

export default Home;
