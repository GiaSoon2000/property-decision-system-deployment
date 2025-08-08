import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminCreateUser.css';

const AdminCreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: 'user',
    username: '', // Changed from 'name' to 'username' to match backend
    email: '',
    password: '',
    phone: '',
    // User specific fields
    occupation: '',
    preferredArea: '',
    propertyType: '',
    minPriceRange: '',
    maxPriceRange: '',
    // REN specific fields
    renCode: '',
    companyName: '',
    verifiedStatus: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['username', 'email', 'password'];
    if (formData.role === 'REN') {
      requiredFields.push('renCode');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Format the data to match backend expectations
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      ...(formData.role === 'user' ? {
        // User profile data
        profile: {
          occupation: formData.occupation,
          preferred_area: formData.preferredArea,
          preferred_property_type: formData.propertyType,
          price_range_min: formData.minPriceRange,
          price_range_max: formData.maxPriceRange
        }
      } : {
        // REN profile data
        profile: {
          REN_id: formData.renCode,
          company_name: formData.companyName,
          verified_status: formData.verifiedStatus
        }
      })
    };

    try {
      const response = await fetch('http://localhost:5000/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert(`${formData.role} created successfully!`);
        navigate('/admin-dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create user');
    }
  };

  return (
    <div className="register-container">
      <div className="illustration-container">
        <img src="/register1.png" alt="Register Illustration" className="illustration" />
      </div>
      <div className="form-container">
        <div className="register-card">
          <h2>Create New Account</h2>
          <p className="subtitle">Create a new {formData.role === 'user' ? 'User' : 'REN'} account</p>
          
          <form className="register-form">
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="select-input"
            >
              <option value="user">Create User Account</option>
              <option value="REN">Create REN Account</option>
            </select>

            <input
              type="text"
              name="username"
              placeholder="Username *"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />

            {formData.role === 'user' ? (
              <>
                <input
                  type="text"
                  name="occupation"
                  placeholder="Occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="preferredArea"
                  placeholder="Preferred Area"
                  value={formData.preferredArea}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="propertyType"
                  placeholder="Preferred Property Type"
                  value={formData.propertyType}
                  onChange={handleChange}
                />

                <div className="price-range-container">
                  <input
                    type="number"
                    name="minPriceRange"
                    placeholder="Minimum Price"
                    value={formData.minPriceRange}
                    onChange={handleChange}
                    className="price-input"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    name="maxPriceRange"
                    placeholder="Maximum Price"
                    value={formData.maxPriceRange}
                    onChange={handleChange}
                    className="price-input"
                  />
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="renCode"
                  placeholder="REN Code *"
                  value={formData.renCode}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                />

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="verifiedStatus"
                      checked={formData.verifiedStatus}
                      onChange={handleChange}
                    />
                    Verified Status
                  </label>
                </div>
              </>
            )}

            <button 
              type="button" 
              onClick={handleSubmit} 
              className="register-button"
            >
              Create {formData.role}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;