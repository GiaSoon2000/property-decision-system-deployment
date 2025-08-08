import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../FavoritesContext';

const FavoritePages = () => {
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleFavorite } = useFavorites();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:5000/favorites', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavoriteProperties(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (property) => {
    try {
      await handleFavorite(property);
      // Remove from local state
      setFavoriteProperties(prev => prev.filter(p => p.id !== property.id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="favorites-error">Error: {error}</div>;
  }

  // Helper function to get the first image or default
  const getFirstImage = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return 'default-property.jpg';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tw-container tw-mx-auto tw-p-4 tw-pt-20">
      {/* <h1 className="tw-text-2xl tw-font-bold tw-mb-6">My Favorites</h1> */}
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6 tw-px-12">
          <h1 className="tw-text-2xl tw-font-bold">My Favorites</h1>
          <button
            onClick={() => navigate('/search-results')}
            className="tw-px-4 tw-py-2 tw-bg-gray-200 hover:tw-bg-gray-300 tw-rounded-md"
          >
            Back to Search
          </button>
      </div>
      
      {favoriteProperties.length === 0 ? (
        <div className="tw-text-center tw-py-8">
          <p className="tw-text-gray-500">No favorites added yet</p>
        </div>
      ) : (
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-px-12">
          {favoriteProperties.map((property) => (
            <div 
              key={property.id} 
              className="tw-bg-white tw-rounded-lg tw-shadow hover:tw-shadow-lg tw-transition-shadow tw-duration-300"
            //   onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="tw-relative tw-h-48">
                <img
                  src={`http://localhost:5000/static/images/property_images/${getFirstImage(property)}`}
                  alt={property.name}
                  className="tw-w-full tw-h-full tw-object-cover tw-rounded-t-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:5000/static/images/property_images/default-property.jpg';
                  }}
                />
              </div>
              <div className="tw-p-4">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-2">{property.name}</h2>
                <p className="tw-text-gray-600">{property.area}</p>
                <p className="tw-text-gray-800 tw-font-bold tw-mt-2">
                  RM {Number(property.price).toLocaleString()}
                </p>
                <div className="tw-mt-2 tw-text-sm tw-text-gray-600">
                  <span>{property.bedrooms} Bedrooms</span>
                  <span className="tw-mx-2">•</span>
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="tw-flex tw-gap-4 tw-mt-4 tw-justify-center tw-items-center">
                    <button
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="tw-py-2 tw-px-4 tw-w-46 tw-h-8 tw-border-none tw-rounded-md tw-cursor-pointer tw-font-medium tw-transition-colors tw-duration-200 tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-flex tw-items-center tw-justify-center"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => removeFavorite(property)}
                        className="tw-bg-red-600 tw-text-white tw-w-46 tw-h-8 tw-border-none tw-rounded-md tw-cursor-pointer tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-red-700 tw-flex tw-items-center tw-justify-center"
                    >
                        Remove from Favorites
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePages;