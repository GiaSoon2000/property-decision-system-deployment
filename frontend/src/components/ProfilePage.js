import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import API_ENDPOINTS from '../config';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userId = sessionStorage.getItem('user_id');
                console.log('Fetching profile for user ID:', userId);

                if (!userId) {
                    console.log('No user ID found in session storage');
                    navigate('/login');
                    return;
                }

                console.log('Making fetch request to:', `${API_ENDPOINTS.USER_PROFILE}/${userId}`);

                const response = await fetch(`${API_ENDPOINTS.USER_PROFILE}/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Profile data received:', data);
                    setUserData(data);
                    setFormData(data);
                } else {
                    const errorData = await response.json();
                    console.error('Server response:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert(error.message || 'Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_ENDPOINTS.UPDATE_PROFILE}/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setUserData(formData);
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    const renderUserProfile = () => (
        <div className="profile-details">
            <h3>User Profile</h3>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Occupation:</label>
                        <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Preferred Area:</label>
                        <input
                            type="text"
                            name="preferredArea"
                            value={formData.preferredArea}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Property Type:</label>
                        <input
                            type="text"
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Price Range:</label>
                        <input
                            type="number"
                            name="minPriceRange"
                            value={formData.minPriceRange}
                            onChange={handleInputChange}
                        />
                        <span> - </span>
                        <input
                            type="number"
                            name="maxPriceRange"
                            value={formData.maxPriceRange}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Occupation:</strong> {userData.occupation}</p>
                    <p><strong>Preferred Area:</strong> {userData.preferredArea}</p>
                    <p><strong>Property Type:</strong> {userData.propertyType}</p>
                    <p><strong>Price Range:</strong> {userData.minPriceRange} - {userData.maxPriceRange}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </>
            )}
        </div>
    );

    const renderRENProfile = () => (
        <div className="profile-details">
            <h3>REN Profile</h3>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>REN Code:</label>
                        <input
                            type="text"
                            name="renCode"
                            value={formData.renCode}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Company Name:</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone:</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>REN Code:</strong> {userData.renCode}</p>
                    <p><strong>Company Name:</strong> {userData.companyName}</p>
                    <p><strong>Phone:</strong> {userData.phone}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </>
            )}
        </div>
    );

    const renderAdminProfile = () => (
        <div className="profile-details">
            <h3>Admin Profile</h3>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </>
            )}
        </div>
    );

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            {userData?.role === 'user' && renderUserProfile()}
            {userData?.role === 'REN' && renderRENProfile()}
            {userData?.role === 'admin' && renderAdminProfile()}
        </div>
    );
};

export default ProfilePage;