import API_ENDPOINTS from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Bed, Bath, CalendarDays, Home, MapPin, Square, CheckCircle, Badge } from 'lucide-react';
import { useFavorites } from '../FavoritesContext';

const FACILITY_ICONS = {
  'yoga room': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  'jogging track': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  'landscaped garden': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 4c0 1-1.356 3-1.832 3-.476 0-2.168-2-2.168-3a2 2 0 114 0z"/>
    </svg>
  ),
  'multi-purpose hall': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  ),
  'bbq': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
    </svg>
  ),
  'covered car park': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
    </svg>
  ),
  'clubhouse': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  ),
  'gym': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  ),
  'jacuzzi': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  ),
  'lounge': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  ),
  'playground': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  'sauna': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  ),
  '24 hours security': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  ),
  'swimming pool': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  ),
  'tennis courts': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  'default': (
    <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  )
};

const HeartIcon = ({ filled }) => (
  <svg 
    className={`tw-w-6 tw-h-6 ${filled ? 'tw-fill-red-500' : 'tw-fill-none tw-stroke-current'}`}
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth="2"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
);

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 200; // Adjust this value as needed
  const { favorites, handleFavorite } = useFavorites();

  // Function to check if description needs truncation
  const needsTruncation = (text) => text && text.length > MAX_DESCRIPTION_LENGTH;

  // Function to get truncated text
  const getTruncatedText = (text) => {
    if (!text) return '';
    if (!needsTruncation(text) || showFullDescription) return text;
    return text.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PROPERTY_DETAIL}/\${1}`);
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return <div className="tw-flex tw-items-center tw-justify-center tw-h-screen">Loading...</div>;
  }

  if (!property) {
    return <div className="tw-text-center">Property not found</div>;
  }

  return (
    <div className="tw-max-w-7xl tw-mx-auto tw-px-4 tw-py-8 tw-pt-24">
      {/* Back Button - Modified to remove heart button */}
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <button
          onClick={() => navigate('/search-results')}
          className="tw-flex tw-items-center tw-gap-2 tw-text-blue-600 hover:tw-text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Listings
        </button>
      </div>

      {/* Image Gallery */}
      <div className="tw-max-w-4xl tw-mx-auto">
        <div className="tw-grid tw-grid-cols-12 tw-gap-4 tw-mb-8">
          <div className="tw-col-span-8">
            <div className="tw-aspect-[4/3] tw-relative tw-overflow-hidden tw-rounded-lg tw-shadow-lg tw-h-[280px]">
              <img
                src={property.images && property.images.length > 0
                  ? ``${API_ENDPOINTS.STATIC_IMAGES}/${property.images[activeImage].image_path}`
                  : '`${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg'}
                alt={`Property ${property.name}`}
                className="tw-w-full tw-h-full tw-object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                }}
              />
            </div>
          </div>
          <div className="tw-col-span-4 tw-grid tw-grid-rows-3 tw-gap-4">
            {property.images && property.images
              .filter((_, index) => index !== activeImage)
              .slice(0, 3)
              .map((image, index) => (
                <div 
                  key={image.id} 
                  className="tw-aspect-[4/3] tw-relative tw-overflow-hidden tw-rounded-lg tw-shadow-lg tw-h-[85px]"
                >
                  <img
                    src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}
                    alt={`Property ${property.name}`}
                    className="tw-w-full tw-h-full tw-object-cover tw-cursor-pointer"
                    onClick={() => {
                      const actualIndex = property.images.findIndex(img => img.id === image.id);
                      setActiveImage(actualIndex);
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                    }}
                  />
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="tw-grid tw-grid-cols-12 tw-gap-8">
        {/* Left Column */}
        <div className="tw-col-span-8">
          <Card>
            <CardContent className="tw-p-6">
              <h1 className="tw-text-2xl tw-font-bold tw-mb-4">{property.name}</h1>
              <div className="tw-flex tw-items-center tw-gap-6 tw-mb-6">
                <span className="tw-flex tw-items-center tw-gap-2">
                  <MapPin className="tw-w-5 tw-h-5" />
                  {property.area}
                </span>
                <span className="tw-text-2xl tw-font-bold tw-text-blue-600">
                  RM {property.price.toLocaleString()}
                </span>
              </div>

              {/* Add heart button and property type in a flex container */}
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Home className="tw-w-5 tw-h-5" />
                  <span>{property.type}</span>
                </div>
                <button
                  onClick={() => property && handleFavorite(property)}
                  className="tw-p-2 tw-rounded-full hover:tw-bg-gray-100 tw-transition-colors"
                  aria-label={favorites.includes(Number(property?.id)) ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <HeartIcon filled={favorites.includes(Number(property?.id))} />
                </button>
              </div>

              <div className="tw-grid tw-grid-cols-3 tw-gap-4 tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Bed className="tw-w-5 tw-h-5" />
                  <span>{property.bedrooms} Beds</span>
                </div>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Bath className="tw-w-5 tw-h-5" />
                  <span>{property.bathrooms} Baths</span>
                </div>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Square className="tw-w-5 tw-h-5" />
                  <span>{property.size} sqft</span>
                </div>
              </div>

              {/* About this Property */}
              <div className="tw-border-t tw-pt-6 tw-mt-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">About this property</h2>
                <div className="tw-mb-4">
                  <p className="tw-text-gray-600 tw-text-justify">
                    {getTruncatedText(property.description)}
                  </p>
                  {needsTruncation(property.description) && (
                    <button 
                      className="tw-text-blue-600 hover:tw-text-blue-800 tw-mt-2"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? '~ Show less' : '~ Show more'}
                    </button>
                  )}
                </div>
              </div>

              {/* More details */}
              <div className="tw-border-t tw-pt-6 tw-mt-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">More details</h2>
                <div className="tw-grid tw-grid-cols-2 tw-gap-y-4">
                  <div>
                    <div className="tw-text-gray-600">Property Type</div>
                    <div>{property.type}</div>
                  </div>
                  <div>
                    <div className="tw-text-gray-600">Completion Year</div>
                    <div>{property.year_built || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="tw-text-gray-600">Tenure</div>
                    <div>{property.form_of_interest}</div>
                  </div>
                  <div>
                    <div className="tw-text-gray-600">Project Stage</div>
                    <div>New launch</div>
                  </div>
                  <div>
                    <div className="tw-text-gray-600">Listing ID</div>
                    <div>{property.id}</div>
                  </div>
                  <div>
                    <div className="tw-text-gray-600">Listed On</div>
                    <div>{new Date(property.submitted_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Facilities & Amenities */}
              <div className="tw-border-t tw-pt-6 tw-mt-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Facilities & Amenities</h2>
                <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                  {property.facilities && property.facilities !== '-' && 
                    property.facilities.split(',').map((facility, index) => {
                      const facilityKey = facility.trim().toLowerCase();
                      return (
                        <div key={index} className="tw-flex tw-items-center tw-gap-2">
                          {FACILITY_ICONS[facilityKey] || FACILITY_ICONS.default}
                          <span className="tw-capitalize">{facility.trim()}</span>
                        </div>
                      );
                  })}
                  {(!property.facilities || property.facilities === '-') && (
                    <div className="tw-col-span-2 tw-text-gray-500 tw-italic">
                      No facilities information available
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="tw-col-span-4">
          <Card>
            <CardContent className="tw-p-6">
              <div className="tw-flex tw-flex-col tw-gap-4 tw-mb-6">
              <div>
                <h3 className="tw-font-semibold">
                  {property.agent?.name || 'Contact Agent'}
                </h3>
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600">
                  <CalendarDays className="tw-w-4 tw-h-4" />
                  {new Date(property.submitted_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                <Badge className="tw-w-4 tw-h-4" />
                <span className="tw-font-medium">REN Code:</span>
                <span>{property.agent?.ren_code || 'N/A'}</span>
              </div>
            </div>
              <button 
                onClick={() => {
                  const message = `Hi, I'm interested in your property: ${property.name} (${window.location.href})`;
                  let phone = property.agent?.phone.replace(/\D/g, '');
                  if (!phone.startsWith('60')) {
                    phone = '60' + phone;
                  }
                  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="tw-w-full tw-bg-blue-600 tw-text-white tw-py-3 tw-rounded-lg hover:tw-bg-blue-700"
              >
                WhatsApp Now
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;