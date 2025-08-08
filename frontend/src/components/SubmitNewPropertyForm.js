import API_ENDPOINTS from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SubmitNewPropertyForm.css';

const SubmitNewPropertyForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        bedrooms: '',
        bathrooms: '',
        size: '',
        price: '',
        latitude: '',
        longitude: '',
        area: '',
        form_of_interest: '',
        financing_options: '',
        description: '',
        furnishing_status: '',
        facing_direction: '',
        year_built: '',
        facilities: '',
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => {
            // Revoke old preview URLs to prevent memory leaks
            prevPreviews.forEach(url => URL.revokeObjectURL(url));
            return newPreviews;
        });
    };

    const handleSubmit = async () => {
        try {
            const formDataToSend = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Append all images
            images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await fetch(API_ENDPOINTS.SUBMIT_PROPERTY, {
                method: 'POST',
                credentials: 'include',
                body: formDataToSend, // Don't set Content-Type header when sending FormData
            });

            const data = await response.json();
            if (data.message) {
                alert("Property submitted successfully!");
                // Clear form
                setFormData({
                    name: '',
                    type: '',
                    bedrooms: '',
                    bathrooms: '',
                    size: '',
                    price: '',
                    latitude: '',
                    longitude: '',
                    area: '',
                    form_of_interest: '',
                    financing_options: '',
                    description: '',
                    furnishing_status: '',
                    facing_direction: '',
                    year_built: '',
                    facilities: '',
                });
                setImages([]);
                setPreviews([]);
                navigate('/ren-dashboard');
            } else {
                alert("Failed to submit property. Please try again.");
            }
        } catch (error) {
            console.error('Error submitting property:', error);
            alert('Error submitting property. Please try again.');
        }
    };

    // Cleanup preview URLs when component unmounts
    React.useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <div className="submit-form-container">
            <div className="submit-form-card">
                <h3>Submit New Property</h3>
                <form className="submit-form">
                    <div className="form-group full-width">
                        <label htmlFor="name">Property Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter property name"
                            onChange={handleChange}
                            value={formData.name}
                            required
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="type">Property Type</label>
                        <select 
                            id="type"
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            required
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
                    </div>
                    <input
                        type="number"
                        name="bedrooms"
                        placeholder="Bedrooms"
                        onChange={handleChange}
                        value={formData.bedrooms}
                        required
                    />
                    <input
                        type="number"
                        name="bathrooms"
                        placeholder="Bathrooms"
                        onChange={handleChange}
                        value={formData.bathrooms}
                        required
                    />
                    <input
                        type="number"
                        name="size"
                        placeholder="Size (sq ft)"
                        onChange={handleChange}
                        value={formData.size}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        onChange={handleChange}
                        value={formData.price}
                        required
                    />
                    <input
                        type="text"
                        name="latitude"
                        placeholder="Latitude"
                        onChange={handleChange}
                        value={formData.latitude}
                        required
                    />
                    <input
                        type="text"
                        name="longitude"
                        placeholder="Longitude"
                        onChange={handleChange}
                        value={formData.longitude}
                        required
                    />
                    <input
                        type="text"
                        name="area"
                        placeholder="Area (e.g. Senai, Kulai)"
                        onChange={handleChange}
                        value={formData.area}
                        required
                    />
                    <input
                        type="text"
                        name="form_of_interest"
                        placeholder="Form of Interest"
                        onChange={handleChange}
                        value={formData.form_of_interest}
                        required
                    />
                    <input
                        type="text"
                        name="financing_options"
                        placeholder="Financing Options"
                        onChange={handleChange}
                        value={formData.financing_options}
                        required
                    />
                    
                    <textarea
                        name="description"
                        placeholder="Property Description"
                        onChange={handleChange}
                        value={formData.description}
                        required
                    />

                    <select 
                        name="furnishing_status" 
                        value={formData.furnishing_status} 
                        onChange={handleChange}
                    >
                        <option value="">Select Furnishing Status</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Partially Furnished">Partially Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                    </select>

                    <select 
                        name="facing_direction" 
                        value={formData.facing_direction} 
                        onChange={handleChange}
                    >
                        <option value="">Select Facing Direction</option>
                        <option value="North">North</option>
                        <option value="North East">North East</option>
                        <option value="East">East</option>
                        <option value="South East">South East</option>
                        <option value="South">South</option>
                        <option value="South West">South West</option>
                        <option value="West">West</option>
                        <option value="North West">North West</option>
                    </select>

                    <input
                        type="number"
                        name="year_built"
                        placeholder="Year Built"
                        onChange={handleChange}
                        value={formData.year_built}
                    />

                    <textarea
                        name="facilities"
                        placeholder="Facilities (comma-separated)"
                        onChange={handleChange}
                        value={formData.facilities}
                    />

                    <div className="image-upload-section">
                        <label htmlFor="images" className="image-upload-label">
                            Upload Property Images
                            <input
                                type="file"
                                id="images"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="image-input"
                            />
                        </label>
                        
                        <div className="image-previews">
                            {previews.map((preview, index) => (
                                <div key={index} className="image-preview">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="button" onClick={handleSubmit} className="submit-button">
                        Submit Property
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitNewPropertyForm;