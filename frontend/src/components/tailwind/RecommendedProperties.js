import API_ENDPOINTS from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../FavoritesContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecommendedProperties = () => {
  const [recommendations, setRecommendations] = useState({ preferences: null, recommended_properties: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { favorites, handleFavorite } = useFavorites();

  const nextProperties = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= recommendations.recommended_properties.length ? 0 : prevIndex + 3
    );
  };

  const previousProperties = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 3 < 0 ? Math.max(recommendations.recommended_properties.length - 3, 0) : prevIndex - 3
    );
  };

  const isUserLoggedIn = () => {
    return sessionStorage.getItem('user_id') && sessionStorage.getItem('role');
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (!isUserLoggedIn()) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.RECOMMENDED_PROPERTIES, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [sessionStorage.getItem('user_id')]);

  if (!isUserLoggedIn()) return null;
  if (isLoading) return <div className="tw-text-center tw-py-4">Loading...</div>;
  if (error) return null;
  if (!recommendations.recommended_properties.length) return null;

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <div className="tw-mb-6">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">Properties You Might Like</h2>
        <p className="tw-text-gray-600">
          Based on your preferences: {recommendations.preferences.preferred_area} area, 
          {recommendations.preferences.preferred_property_type} properties,
          and the budget of between RM {Number(recommendations.preferences.price_range_min).toLocaleString()} and RM 
          {Number(recommendations.preferences.price_range_max).toLocaleString()}
        </p>
      </div>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        {recommendations.recommended_properties.slice(currentIndex, currentIndex + 3).map((property) => (
          <div 
            key={property.id}
            className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden tw-transition-transform hover:tw-scale-[1.02] tw-duration-300"
          >
            <div 
              className="tw-cursor-pointer"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="tw-relative tw-h-48">
                <img
                  src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}
                  alt={property.name}
                  className="tw-w-full tw-h-full tw-object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(property);
                  }}
                  className="tw-absolute tw-top-2 tw-right-2 tw-p-2 tw-rounded-full tw-bg-white/80 hover:tw-bg-white"
                >
                  <svg 
                    className={`tw-w-6 tw-h-6 ${favorites.includes(Number(property.id)) ? 'tw-text-red-500' : 'tw-text-gray-500'}`}
                    fill={favorites.includes(Number(property.id)) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="tw-p-4">
                <h3 className="tw-text-lg tw-font-semibold tw-mb-2">{property.name}</h3>
                <p className="tw-text-gray-600 tw-mb-2">{property.area}</p>
                <p className="tw-text-gray-800 tw-font-bold">
                  RM {Number(property.price).toLocaleString()}
                </p>
                <div className="tw-mt-2 tw-text-sm tw-text-gray-600">
                  <span>{property.bedrooms} Bedrooms</span>
                  <span className="tw-mx-2">•</span>
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="tw-mt-2 tw-text-sm tw-text-gray-500">
                  {property.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tw-flex tw-justify-between tw-items-center tw-mt-8">
        <button
          onClick={previousProperties}
          className="tw-bg-white tw-rounded-full tw-p-2 tw-shadow-lg tw-opacity-70 hover:tw-opacity-100"
          aria-label="Previous properties"
        >
          <ChevronLeft className="tw-w-6 tw-h-6" />
        </button>

        <div className="tw-flex tw-gap-2">
          {Array.from({ length: Math.ceil(recommendations.recommended_properties.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 3)}
              className={`tw-w-2 tw-h-2 tw-rounded-full tw-transition-colors ${
                Math.floor(currentIndex / 3) === index ? 'tw-bg-[#18B497]' : 'tw-bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextProperties}
          className="tw-bg-white tw-rounded-full tw-p-2 tw-shadow-lg tw-opacity-70 hover:tw-opacity-100"
          aria-label="Next properties"
        >
          <ChevronRight className="tw-w-6 tw-h-6" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedProperties; 