import React, { useState } from 'react';
import axios from 'axios';
import './auth.css';

function LoginPage({ onPageChange, setUserData }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate fields
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {
            setIsSubmitting(true);

            // Send login request to server
            const response = await axios.post(
                "http://localhost:8000/api/users/login",
                {
                    email,
                    password,
                }
            );

            // Store user data in localStorage
            localStorage.setItem("userData", JSON.stringify(response.data.user));

            // Update application state with user data
            setUserData(response.data.user);

            // Redirect to home page
            onPageChange("home");
        } catch (err) {
            // Handle specific error messages from server
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError("Login failed. Please check your credentials and try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <h1>Login</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="auth-button" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                    <button
                        type="button"
                        className="auth-button secondary"
                        onClick={() => onPageChange("welcome")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;
