import API_ENDPOINTS from '../config';
import React, { useEffect, useState } from 'react';
import { useLocation, Link  } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';  // Import Leaflet CSS
import L from 'leaflet';  // Leaflet for custom marker
import '../styles/SearchResults.css'; // Make sure to create this CSS file
import PropertyComparison from './tailwind/PropertyComparison'; 
import { useFavorites } from './FavoritesContext'; 

// Custom marker icon (optional)
const customIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const HeartIcon = ({ filled }) => (
  <svg 
    className={`heart-icon ${filled ? 'favorited' : ''}`}
    viewBox="0 0 24 24" 
    fill={filled ? "#ff4444" : "none"}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
);

const SearchResults = () => {
  const { search } = useLocation();  // Get query parameters from the URL
  const [properties, setProperties] = useState([]);
  const [propertiesToCompare, setPropertiesToCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const { favorites, handleFavorite, isLoading} = useFavorites(); // Use the favorites context
  const [filters, setFilters] = useState({
    area: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    formOfInterest: '',
    facingDirection: '',
    furnishingStatus: ''
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [salary, setSalary] = useState('');
  const [maxAffordablePrice, setMaxAffordablePrice] = useState(null);
  const [areaOptions, setAreaOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 15;
  const [bedroomOptions, setBedroomOptions] = useState([]);
  const [bathroomOptions, setBathroomOptions] = useState([]);

  // Calculate pagination values
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results when page changes
    document.querySelector('.results-side').scrollTop = 0;
  };

  // Add this new useEffect to fetch areas when component mounts
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AREAS);
        const data = await response.json();
        setAreaOptions(data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    fetchAreas();
  }, []);

  // Add this new useEffect to fetch bedrooms and bathrooms when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bedroomsResponse, bathroomsResponse] = await Promise.all([
          fetch(API_ENDPOINTS.BEDROOMS),
          fetch(API_ENDPOINTS.BATHROOMS)
        ]);
        
        const bedroomsData = await bedroomsResponse.json();
        const bathroomsData = await bathroomsResponse.json();
        
        setBedroomOptions(bedroomsData);
        setBathroomOptions(bathroomsData);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Function to add a property to comparison
  const handleCompare = (property) => {
    if (propertiesToCompare.length >= 3) {
      alert('You can compare up to 3 properties at a time');
      return;
    }
    if (propertiesToCompare.find(p => p.id === property.id)) {
      alert('This property is already in comparison');
      return;
    }
    setPropertiesToCompare([...propertiesToCompare, property]);
    setShowComparison(true);
  };

  // Function to remove a property from comparison
  const removeFromComparison = (propertyId) => {
    const updatedProperties = propertiesToCompare.filter(p => p.id !== propertyId);
    setPropertiesToCompare(updatedProperties);
    if (updatedProperties.length === 0) {
      setShowComparison(false);
    }
  };

  // Function to toggle the comparison popup
  const toggleComparePopup = () => setShowComparison(!showComparison);

  // Function to calculate loan amount based on salary
  const calculateSalaryBasedLoanAmount = (salary) => {
    const annualSalary = salary * 12;
    const thirtyPercentAnnual = annualSalary * 0.3;
    const multiplier = 17.4610; // 35 years multiplier
    return Math.round(thirtyPercentAnnual * multiplier);
  };

  // Function to perform the search
  const performSearch = async (searchParams) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SEARCH}?\${1}`);
      const data = await response.json();
      
      // Filter properties based on maxAffordablePrice if salary is provided
      const affordableProperties = maxAffordablePrice
        ? data.filter(property => property.price <= maxAffordablePrice)
        : data;

      setProperties(affordableProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  // Handle salary input change
  const handleSalaryChange = (e) => {
    const salaryValue = Number(e.target.value);
    setSalary(salaryValue);
    if (salaryValue > 0) {
      const maxLoanAmount = calculateSalaryBasedLoanAmount(salaryValue);
      setMaxAffordablePrice(maxLoanAmount);
    } else {
      setMaxAffordablePrice(null);
    }
  };

  // Initial search when component mounts or URL parameters change
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    
    // Parse price range from URL
    const priceRange = urlParams.get('price');
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      setFilters(prev => ({
        ...prev,
        propertyType: urlParams.get('propertyType') || '',
        bedrooms: urlParams.get('bedrooms') || '',
        bathrooms: urlParams.get('bathrooms') || '',
        formOfInterest: urlParams.get('formOfInterest') || '',
        minPrice: min || '',
        maxPrice: max || min || '' // If max doesn't exist, use min (for "Above X" ranges)
      }));
    }

    // Create new search params for the API call
    const searchParamsForAPI = new URLSearchParams(search);
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      searchParamsForAPI.delete('price'); // Remove the combined price parameter
      if (min) searchParamsForAPI.set('minPrice', min);
      if (max) searchParamsForAPI.set('maxPrice', max);
    }

    // Perform search with modified parameters
    performSearch(searchParamsForAPI);
  }, [search]);

  // Fetch properties when manual search button is clicked
  // Handle manual search button click
  const handleSearch = () => {
    const searchParams = new URLSearchParams(search);
    
    // Add filter values to search parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    performSearch(searchParams);
  };



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  

  const mapContainerStyle = {
    height: '90vh',
    width: '100%',
  };

  const mapCenter = {    
    lat: 1.5657700413287083,
    lng: 103.6867943398611,
  };

  // Add this new function
  const handleWhatsAppClick = (property) => {
    if (property.agent && property.agent.phone) {
      const message = `Hi, I'm interested in your property: ${property.name} (${window.location.origin}/property/${property.id})`;
      
      let phone = property.agent.phone.replace(/\D/g, '');
      if (!phone.startsWith('60')) {
        phone = '60' + phone;
      }
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Agent contact information is not available.');
    }
  };

  const handlePropertyClick = (property) => {
    // If clicking the same property that's already selected, unselect it
    if (selectedProperty?.id === property.id) {
      setSelectedProperty(null);
      // Reset map to default center and zoom
      if (mapRef) {
        mapRef.flyTo([1.5657700413287083, 103.6867943398611], 12);
      }
    } else {
      // Select the new property and focus map on it
      setSelectedProperty(property);
      if (mapRef && property.latitude && property.longitude) {
        mapRef.flyTo([property.latitude, property.longitude], 15);
      }
    }
  };

  return (
    <><div className="search-results-container">
      {/* Left Side - Search Filters & Property Cards */}
      <div className="results-side">
        <h3>Search Results for {new URLSearchParams(search).get('area')}</h3>
        {isLoading ? (
          <p>Loading...</p> // Replace with a more sophisticated loading spinner if desired
        ) : (
          <>
            {/* Search Filter */}
            <div className="filter-container">

              <select name="area" value={filters.area} onChange={handleFilterChange}>
                <option value="">Area</option>
                {areaOptions.map(area => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
                <option value="">Property Type</option>
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

              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price" />

              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price" />

              <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                <option value="">Bedrooms</option>
                {bedroomOptions.map(bedrooms => (
                  <option key={bedrooms} value={bedrooms}>
                    {bedrooms}
                  </option>
                ))}
              </select>

              <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange}>
                <option value="">Bathrooms</option>
                {bathroomOptions.map(bathrooms => (
                  <option key={bathrooms} value={bathrooms}>
                    {bathrooms}
                  </option>
                ))}
              </select>

              <select name="formOfInterest" value={filters.formOfInterest} onChange={handleFilterChange}>
                <option value="">Form of Interest</option>
                <option value="freehold">Freehold</option>
                <option value="leasehold">Leasehold</option>
              </select>

              <select name="facingDirection" value={filters.facingDirection} onChange={handleFilterChange}>
                <option value="">Facing Direction</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North East">North East</option>
                <option value="North West">North West</option>
                <option value="South East">South East</option>
                <option value="South West">South West</option>
              </select>

              <select name="furnishingStatus" value={filters.furnishingStatus} onChange={handleFilterChange}>
                <option value="">Furnishing Status</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Partially Furnished">Partially Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>

              <div className="salary-input-container">
                <input
                  type="number"
                  name="salary"
                  value={salary}
                  onChange={handleSalaryChange}
                  placeholder="Monthly Salary"
                />
                <div className="info-icon">ⓘ
                  <div className="tooltip">
                    This calculator estimates the maximum property loan you might qualify for based on your monthly salary. 
                    It assumes 30% of your monthly income can go towards loan payments over a 35-year period. 
                    Actual loan approval depends on various factors including credit score, existing commitments, and bank policies.
                  </div>
                </div>
              </div>

              <button onClick={handleSearch}>Update Search</button>
            </div>


            {/* Displaying Property Cards */}
            <div className="property-list">
              {currentProperties.length > 0 ? (
                currentProperties.map((property) => (
                  <div 
                    key={property.id} 
                    className={`property-item ${selectedProperty?.id === property.id ? 'selected' : ''}`}
                    onClick={() => handlePropertyClick(property)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="property-image-container">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}
                          alt={property.name}
                          className="property-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                          } } />
                      ) : (
                        <div className="property-no-image">
                          No Image Available
                        </div>
                      )}
                    </div>
                    <div className="search-property-content">
                      <div>
                        <div className="property-title">
                          <h4 className="property-name">{property.name}</h4>
                          <p className="property-location">{property.area}</p>
                        </div>
                        <div className="property-price">
                          RM {typeof property.price === 'number' ?
                            property.price.toLocaleString() :
                            parseFloat(property.price).toLocaleString()}
                        </div>
                        <div className="property-numBed">
                          <span>{property.type}</span>
                          <span> • </span>
                          <span>{property.bedrooms} bedrooms</span>
                          <span> • </span>
                          <span>{property.bathrooms} bathrooms</span>
                        </div>
                      </div>
                      <div className="search-property-details">
                        {/* <div className="property-numBed">
                          <span>{property.bedrooms} bedrooms</span>
                          <span> • </span>
                          <span>{property.bathrooms} bathrooms</span>
                        </div> */}
                      
                        <div className="property-actions">
                          <Link to={`/property/${property.id}`} className="property-actions-button">
                            Details
                          </Link>
                          <button onClick={() => handleWhatsAppClick(property)}>Contact</button>
                          <button
                            className="compare-btn"
                            onClick={() => handleCompare(property)}
                            disabled={propertiesToCompare.length >= 3 && !propertiesToCompare.find(p => p.id === property.id)}
                          >
                            Compare
                          </button>
                          <button
                            className="heart-button"
                            onClick={() => handleFavorite(property)}
                            aria-label={favorites.includes(Number(property.id)) ? 'Remove from Favorites' : 'Add to Favorites'}
                          >
                            <HeartIcon filled={favorites.includes(Number(property.id))} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No properties found.</p>
              )}

              {/* Add pagination controls */}
              {properties.length > propertiesPerPage && (
                <div className="pagination">
                  {currentPage > 1 && (
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="pagination-button"
                    >
                      Previous
                    </button>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}

                  {currentPage < totalPages && (
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="pagination-button"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Side - Map  */}
      <div className="map-side">
        <MapContainer 
          className="leaflet-container" 
          style={mapContainerStyle} 
          center={mapCenter} 
          zoom={12}
          ref={setMapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={selectedProperty?.id === property.id ? redIcon : customIcon}
            >
              <Popup>
                <strong>{property.name}</strong><br />
                {property.type} - {property.bedrooms} bedrooms<br />
                Price: RM {property.price}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Comparison popup */}
      {showComparison && propertiesToCompare.length > 0 && (
        <PropertyComparison
          propertiesToCompare={propertiesToCompare}
          onRemoveProperty={removeFromComparison}
          onClose={() => setShowComparison(false)} />
      )}

      
    </div><div className="hidden-button">
      {propertiesToCompare.length > 0 && !showComparison && (
        <button className="compare-trigger-button" onClick={toggleComparePopup}>
          Compare Properties
        </button>
      )}
    </div></>
  );
};

export default SearchResults;
