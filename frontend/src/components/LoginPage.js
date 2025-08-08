import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import '../styles/LoginPage.css'; // We'll create this CSS file
import API_ENDPOINTS from '../config';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.message === 'Login successful') {
                sessionStorage.setItem('user_id', data.user_id);
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('role', data.role);

                if (data.role === 'REN') {
                    navigate('/ren-dashboard');
                } else if (data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/');
                    alert('Login successful!');
                }

                window.dispatchEvent(new Event('userSessionChange'));
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Failed to log in. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="illustration-container">
                <Carousel
                    autoPlay
                    infiniteLoop
                    showStatus={false}
                    showThumbs={false}
                    interval={3000}
                >
                    <div>
                        <img src="/home_image.jpg" alt="Property 1" />
                    </div>
                    <div>
                        <img src="/home_image2.jpg" alt="Property 2" />
                    </div>
                    <div>
                        <img src="/home_image3.jpg" alt="Property 3" />
                    </div>
                    {/* Add more images as needed */}
                </Carousel>
            </div>
            <div className="form-container">
                <div className="login-card">
                    <h2>Hello Again!</h2>
                    <p className="subtitle">Welcome back to your home! Please login to continue.</p>
                    <form className="login-form">
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={handleLogin} className="login-button">
                            Sign In
                        </button>
                        <div className="register-link">
                            <span>Don't have an account? </span>
                            <Link to="/register">Register</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;