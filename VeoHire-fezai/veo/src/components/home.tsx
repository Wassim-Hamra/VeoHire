import React from 'react';
import '../assets/styles/home.css'; // Importez le fichier CSS


function Home() {
  return (
    <div className="home">

      {/* Section Fonctionnalités */}
      <section className="features">
        <h2>Our Fonctionalities</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Pipeline automated for recrutement</h3>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate temporibus esse perspiciatis consectetur nulla eius possimus iste voluptatem voluptates minima.</p>
          </div>
          <div className="feature">
            <h3>Talents Recruting</h3>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate temporibus esse perspiciatis consectetur nulla eius possimus iste voluptatem voluptates minima.</p>
          </div>
          <div className="feature">
            <h3>Simplified Management</h3>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate temporibus esse perspiciatis consectetur nulla eius possimus iste voluptatem voluptates minima.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;