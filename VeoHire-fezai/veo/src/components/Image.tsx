import React from 'react';
import '../assets/styles/Image.css';

function Image() {
    return (
        <div className="image-container">
            <img 
                src="/heroimage.svg" 
                alt="Modern recruitment illustration"
                className="hero-image"
            />
        </div>
    );
}

export default Image;