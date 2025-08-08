import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'; // Make sure to create this CSS file
import FeaturedProperties from './tailwind/FeaturedProperties'; 
import RecommendedProperties from './tailwind/RecommendedProperties';
import API_ENDPOINTS from '../config';

const HomePage = () => {
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [price, setPrice] = useState('');
  const [properties, setProperties] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AREAS);
      const data = await response.json();
      setAreaOptions(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROPERTIES);
      const data = await response.json();
      
      // Process the images for each property
      const processedProperties = data.map(property => {
        // Convert comma-separated image paths to array if they exist
        let images = [];
        if (property.images) {
          // If images is a string (comma-separated), split it
          if (typeof property.images === 'string') {
            images = property.images.split(',').map(path => path.trim());
          } else if (Array.isArray(property.images)) {
            images = property.images;
          }
        }

        // If no images available, use default
        if (!images.length) {
          images = ['default-property.jpg'];
        }

        // Create full URLs for the images
        const imageUrls = images.map(imagePath => 
          `${API_ENDPOINTS.STATIC_IMAGES}/${imagePath}`
        );

        return {
          ...property,
          imageUrls // Add the processed image URLs to the property object
        };
      });

      setProperties(processedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Only add parameters if they have a value
    if (area.trim()) params.append('area', area.trim());
    if (propertyType) params.append('propertyType', propertyType);
    if (price) params.append('price', price);
    
    // If no filters are selected, we'll still do a search that returns all properties
    navigate(`/search-results?${params.toString()}`);
  };


  return (
    <div className="home-page">
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <h2>MYPropertyWise</h2>
            <h1>AI-Powered Property Comparison & Analysis</h1>
            <p>Beyond Listings: Discover Your Ideal Home Through Intelligent Comparisons</p>
          </div>
          <div className="search-box">
            <div className="search-tabs">
              <button className="active">For Sale</button>
            </div>
            <div className="search-inputs">
              <select 
                value={area} 
                onChange={(e) => setArea(e.target.value)}
                className="area-select"
              >
                <option value="">Select Area</option>
                {areaOptions.map(areaOption => (
                  <option key={areaOption} value={areaOption}>
                    {areaOption}
                  </option>
                ))}
              </select>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
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
              <select value={price} onChange={(e) => setPrice(e.target.value)}>
                <option value="">Select Price Range</option>
                <option value="0-200000">Below RM 200,000</option>
                <option value="200000-400000">RM 200,000 - RM 400,000</option>
                <option value="400000-600000">RM 400,000 - RM 600,000</option>
                <option value="600000-800000">RM 600,000 - RM 800,000</option>
                <option value="800000-1000000">RM 800,000 - RM 1,000,000</option>
                <option value="1000000">Above RM 1,000,000</option>
              </select>
            </div>
            <button className="advance-search" onClick={() => navigate('/search-results')}>Advance Search</button>
            <button className="search-btn" onClick={handleSearch}>Search</button>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-box">
              <h3>AI Property Assistant</h3>
              <p>Get instant answers to your property questions</p>
            </div>
            <div className="feature-box">
              <h3>Smart Comparisons</h3>
              <p>Compare properties with AI-powered insights</p>
            </div>
            <div className="feature-box">
            <h3>Loan Calculator</h3>
            <p>Calculate your maximum affordable property price</p>
            </div>
          </div>
        </section>

        <RecommendedProperties />
        
        <FeaturedProperties properties={properties} />
      </main>
    </div>
  );
};

export default HomePage;