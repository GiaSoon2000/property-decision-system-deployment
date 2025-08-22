import API_ENDPOINTS from '../config';
import React, { createContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(sessionStorage.getItem('user_id'));

  const isUserLoggedIn = () => {
    return sessionStorage.getItem('user_id') && sessionStorage.getItem('role');
  };

  // Create fetchFavorites as a useCallback function
  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setFavorites([]); // Clear existing favorites

    try {
      if (isUserLoggedIn()) {
        const response = await fetch(API_ENDPOINTS.FAVORITES, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.map(fav => Number(fav.id)));
        }
      } else {
        setFavorites([]); // Clear favorites if not logged in
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Watch for user session changes
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUserId = sessionStorage.getItem('user_id');
      if (currentUserId !== userId) {
        setUserId(currentUserId);
        fetchFavorites(); // Fetch favorites when user changes
      }
    };

    // Add event listeners for both storage and custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userSessionChange', handleStorageChange);

    // Initial fetch
    fetchFavorites();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userSessionChange', handleStorageChange);
    };
  }, [userId, fetchFavorites]);

  const updateFavorites = async (propertyId, addToFavorites) => {
    if (!isUserLoggedIn()) {
      throw new Error('User not logged in');
    }

    try {
      const url = addToFavorites ? API_ENDPOINTS.FAVORITES : `${API_ENDPOINTS.FAVORITES}/${propertyId}`;
      const method = addToFavorites ? 'POST' : 'DELETE';
  
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: addToFavorites ? JSON.stringify({ property_id: propertyId }) : null,
      });
  
      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }
      
      // Immediately fetch updated favorites
      await fetchFavorites();
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw error;
    }
  };

  const handleFavorite = async (property) => {
    if (!isUserLoggedIn()) {
      alert("Please log in to add to favorites.");
      return;
    }
    
    const propertyId = Number(property.id);
    const isFavorite = favorites.includes(propertyId);

    try {
      await updateFavorites(propertyId, !isFavorite);
    } catch (error) {
      alert('An error occurred while updating favorites. Please try again later.');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, handleFavorite, isLoading, fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};