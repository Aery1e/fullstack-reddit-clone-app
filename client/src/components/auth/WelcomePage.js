import React from 'react';
import './auth.css';

function WelcomePage({ onPageChange }) {
    return (
        <div className="welcome-container">
            <h1>Welcome to Phreddit</h1>
            <div className="welcome-options">
                <button
                    className="welcome-button"
                    onClick={() => onPageChange('register')}
                >
                    Register as a new user
                </button>
                <button
                    className="welcome-button"
                    onClick={() => onPageChange('login')}
                >
                    Login as an existing user
                </button>
                <button
                    className="welcome-button"
                    onClick={() => onPageChange('home')}
                >
                    Continue as guest
                </button>
            </div>
        </div>
    );
}

export default WelcomePage;