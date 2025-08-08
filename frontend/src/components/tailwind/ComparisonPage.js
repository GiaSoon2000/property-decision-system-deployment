import API_ENDPOINTS from '../../config';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const ComparisonPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_APPROVED_PROPERTIES);
        const data = await response.json();
        setAvailableProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProperties();
  }, []);

  const navigate = useNavigate();

  const handleAddProperty = (property) => {
    if (selectedProperties.length >= 3) {
      alert('You can compare up to 3 properties at a time');
      return;
    }
    if (selectedProperties.find(p => p.id === property.id)) {
      alert('This property is already in comparison');
      return;
    }
    setSelectedProperties([...selectedProperties, property]);
  };

  const handleRemoveProperty = (propertyId) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const filteredProperties = availableProperties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get the first image path or default
  const getFirstImagePath = (property) => {
    if (property.images && property.images.length > 0) {
      // For admin route where images is an array of objects
      if (typeof property.images[0] === 'object') {
        return property.images[0].image_path;
      }
      // For regular route where images is an array of strings
      return property.images[0];
    }
    return 'default-property.jpg';
  };
  
  const getPropertyAnalysis = async () => {
    if (selectedProperties.length < 2) return;
    
    setIsAnalyzing(true);
    try {
      // Check if user is logged in
      const isLoggedIn = sessionStorage.getItem('user_id') && sessionStorage.getItem('role');
      
      const response = await fetch(API_ENDPOINTS.COMPARE_PROPERTIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyIds: selectedProperties.map(p => p.id),
          includePreferences: isLoggedIn // Only include preferences if logged in
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAnalysisResults(data.analysis_results);
        setAiInsights(data.ai_insights);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error getting analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (selectedProperties.length >= 2) {
      getPropertyAnalysis();
    } else {
      setAnalysisResults(null);
      setAiInsights(null);
    }
  }, [selectedProperties]);

  const getMatchColor = (propertyId, feature) => {
    if (!analysisResults || !analysisResults.length || !sessionStorage.getItem('user_id')) return '';
    
    const propertyAnalysis = analysisResults.find(r => r.property_id === propertyId);
    if (!propertyAnalysis || !propertyAnalysis.matches) return '';
    
    const featureMatch = propertyAnalysis.matches.find(m => m.feature === feature);
    if (featureMatch?.matches) {
      return 'tw-bg-green-100';
    }
    return '';
  };

  // Helper function to render comparison row
  const renderComparisonRow = (label, key) => (
    <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-py-2 tw-border-b">
      <div className="tw-font-medium">{label}</div>
      {selectedProperties.map((property, index) => (
        <div 
          key={index} 
          className={`tw-text-sm ${getMatchColor(property.id, key)}`}
        >
          {key === 'price' ? `RM ${Number(property.price).toLocaleString()}` : property[key]}
        </div>
      ))}
      {[...Array(3 - selectedProperties.length)].map((_, index) => (
        <div key={`empty-${index}`} className="tw-text-sm tw-text-gray-300">
          -
        </div>
      ))}
    </div>
  );

  const renderMatchPercentages = () => {
    if (!analysisResults || !sessionStorage.getItem('user_id')) return null;
    
    return (
      <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mb-6 tw-mt-4">
        <div className="tw-font-medium">Match Score</div>
        {selectedProperties.map((property, index) => {
          const analysis = analysisResults.find(r => r.property_id === property.id);
          return (
            <div key={index} className="tw-text-sm">
              <div className="tw-font-bold tw-text-lg tw-text-blue-600">
                {analysis?.match_percentage}%
              </div>
              <div className="tw-text-xs tw-text-gray-500">
                match with your preferences
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAiInsights = () => {
    return (
      <div className="tw-bg-blue-50 tw-rounded-lg tw-shadow tw-p-6">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">
          {analysisResults?.has_preferences ? 'Personalized Analysis' : 'Property Comparison'}
        </h2>
        <div className="tw-prose tw-max-w-none tw-text-left">
          <div className="tw-text-gray-700">
            {isAnalyzing ? (
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-600">
                <svg className="tw-animate-spin tw-h-5 tw-w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AI is analyzing the properties...</span>
              </div>
            ) : aiInsights ? (
              <ReactMarkdown>{aiInsights}</ReactMarkdown>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tw-min-h-80 tw-bg-gray-50 tw-p-6 tw-pt-20">
      <div className="tw-max-w-7xl tw-mx-auto">
        {/* Header */}
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-2xl tw-font-bold">Property Comparison</h1>
          <button
            onClick={() => navigate('/search-results')}
            className="tw-px-4 tw-py-2 tw-bg-gray-200 hover:tw-bg-gray-300 tw-rounded-md"
          >
            Back to Search
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading properties...</p>
          </div>
        ) : (
          <>
            {/* Main comparison section */}
            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-mb-6">
              {/* Property Selection Panel */}
              <div className="lg:tw-col-span-1 tw-bg-white tw-p-4 tw-rounded-lg tw-shadow">
                <h2 className="tw-text-lg tw-font-semibold tw-mb-4">Add Properties to Compare</h2>
                <div className="tw-mb-4">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="tw-w-11/12 tw-p-2 tw-border tw-rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="tw-space-y-2 tw-max-h-[600px] tw-overflow-y-auto">
                  {filteredProperties.map(property => (
                    <div
                      key={property.id}
                      className="tw-p-3 tw-border tw-rounded-md hover:tw-bg-gray-50 tw-cursor-pointer"
                      onClick={() => handleAddProperty(property)}
                    >
                      <div className="tw-flex tw-items-center">
                        <img
                          src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}
                          alt={property.name}
                          className="tw-w-16 tw-h-16 tw-object-cover tw-rounded-md tw-mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                          }}
                        />
                        <div>
                          <div className="tw-font-medium">{property.name}</div>
                          <div className="tw-text-sm tw-text-gray-500">RM {Number(property.price).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Comparison Panel */}
              <div className="lg:tw-col-span-2 tw-bg-white tw-p-4 tw-rounded-lg tw-shadow">
                {selectedProperties.length === 0 ? (
                  <div className="tw-text-center tw-py-12 tw-text-gray-500">
                    Select properties from the left panel to start comparing
                  </div>
                ) : (
                  <div>
                    {/* Selected Properties Display */}
                    <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mb-6">
                      <div className="tw-font-medium">Properties</div>
                      {selectedProperties.map((property, index) => (
                        <div key={index} className="tw-relative">
                          <button
                            className="tw-absolute tw--top-2 tw--right-2 tw-h-6 tw-w-6 tw-bg-red-500 tw-text-white tw-rounded-full tw-shadow hover:tw-bg-red-600 tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveProperty(property.id)}
                          >
                            &times;
                          </button>
                          <img
                            src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}
                            alt={property.name}
                            className="tw-w-full tw-h-32 tw-object-cover tw-rounded-md tw-mb-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                            }}
                          />
                          <div className="tw-text-sm tw-font-medium">{property.name}</div>
                        </div>
                      ))}
                      {[...Array(3 - selectedProperties.length)].map((_, index) => (
                        <div key={`empty-${index}`} className="tw-border-2 tw-border-dashed tw-border-gray-200 tw-rounded-md tw-h-32 tw-flex tw-items-center tw-justify-center tw-text-gray-400">
                          Add Property
                        </div>
                      ))}
                    </div>
                    {renderMatchPercentages()}
                    {renderComparisonRow('Price (RM)', 'price')}
                    {renderComparisonRow('Area', 'area')}
                    {renderComparisonRow('Property Type', 'type')}
                    {renderComparisonRow('Bedrooms', 'bedrooms')}
                    {renderComparisonRow('Bathrooms', 'bathrooms')}
                    {renderComparisonRow('Furnishing Status', 'furnishing_status')}
                    {renderComparisonRow('Facing Direction', 'facing_direction')}
                    {renderComparisonRow('Year Built', 'year_built')}
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Section - Now as a separate section */}
            {selectedProperties.length >= 2 && (
              <div className="tw-bg-blue-50 tw-rounded-lg tw-shadow tw-p-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">
                  {analysisResults?.has_preferences ? 'Personalized Analysis' : 'Property Comparison'}
                </h2>
                <div className="tw-prose tw-max-w-none tw-text-left">
                  <div className="tw-text-gray-700">
                    {isAnalyzing ? (
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-600">
                        <svg className="tw-animate-spin tw-h-5 tw-w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>AI is analyzing the properties...</span>
                      </div>
                    ) : aiInsights ? (
                      <ReactMarkdown>{aiInsights}</ReactMarkdown>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;