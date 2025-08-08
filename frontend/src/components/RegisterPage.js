import API_ENDPOINTS from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css'; // We'll create this CSS file

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        role: 'user',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        occupation: '',
        preferredArea: '',
        propertyType: '',
        minPriceRange: '',
        maxPriceRange: '',
        renCode: '',
        companyName: '',
        phone: '',
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const roleData = formData.role === 'user'
            ? {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                occupation: formData.occupation,
                preferredArea: formData.preferredArea,
                propertyType: formData.propertyType,
                minPriceRange: formData.minPriceRange,
                maxPriceRange: formData.maxPriceRange,
                role: 'user',
            }
            : {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                renCode: formData.renCode,
                companyName: formData.companyName,
                phone: formData.phone,
                role: 'REN',
            };

        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });

            const data = await response.json();
            if (data.message === 'User registered successfully') {
                alert('Registration successful!');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <div className="illustration-container">
                <img src="/register1.png" alt="Register Illustration" className="illustration" />
            </div>
            <div className="form-container">
                <div className="register-card">
                    <h2>Join Us!</h2>
                    <p className="subtitle">Create your account to get started.</p>
                    <form className="register-form">
                        <select name="role" value={formData.role} onChange={handleInputChange} className="select-input">
                            <option value="user">Register as User</option>
                            <option value="REN">Register as REN</option>
                        </select>

                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />

                        {formData.role === 'user' ? (
                            <>
                                <input
                                    type="text"
                                    name="occupation"
                                    placeholder="Occupation"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="preferredArea"
                                    placeholder="Preferred Area"
                                    value={formData.preferredArea}
                                    onChange={handleInputChange}
                                />
                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleInputChange}
                                    className="select-input"
                                >
                                    <option value="">Select Property Type</option>
                                    <option value="Single storey terraced house">Single storey terraced house</option>
                                    <option value="Double storey terraced house">Double storey terraced house</option>
                                    <option value="Cluster house">Cluster house</option>
                                    <option value="Semi-detached house">Semi-detached house</option>
                                    <option value="Bungalow">Bungalow</option>
                                    <option value="Flat">Flat</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Condominium">Condominium</option>
                                    <option value="Townhouse">Townhouse</option>
                                </select>
                                <div className="price-range-container">
                                    <input
                                        type="number"
                                        name="minPriceRange"
                                        placeholder="Minimum Price"
                                        value={formData.minPriceRange}
                                        onChange={handleInputChange}
                                        className="price-input"
                                    />
                                    <span className="price-separator">-</span>
                                    <input
                                        type="number"
                                        name="maxPriceRange"
                                        placeholder="Maximum Price"
                                        value={formData.maxPriceRange}
                                        onChange={handleInputChange}
                                        className="price-input"
                                    />
                                </div>                                
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    name="renCode"
                                    placeholder="REN Number"
                                    value={formData.renCode}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </>
                        )}

                        <button type="button" onClick={handleRegister} className="register-button">
                            Register
                        </button>
                    </form>
                    <div className="login-link">
                        Already have an account? <button onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;