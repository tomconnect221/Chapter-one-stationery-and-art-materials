import React from 'react';
import { Link } from 'react-router-dom';
import siteLightLogo from '/assets/image/light_logo.png';

const Logo = () => {
    return (
        <div className="logo-section">
            <Link to="/" className="logo">
                <img src={siteLightLogo} alt="Store Logo" />
            </Link>
        </div>
    );
};

export default Logo;