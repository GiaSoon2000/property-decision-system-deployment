import API_ENDPOINTS from '../../config';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedProperties = ({ properties = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProperties = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= properties.length ? 0 : prevIndex + 3
    );
  };

  const previousProperties = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 3 < 0 ? Math.max(properties.length - 3, 0) : prevIndex - 3
    );
  };

  return (
    <section className="tw-py-8">
      <h2 className="tw-text-3xl tw-font-bold tw-text-center tw-mb-8">Featured Properties</h2>
      
      <div className="tw-max-w-7xl tw-mx-auto tw-px-4">
        <div className="tw-grid tw-grid-cols-3 tw-gap-6">
          {properties.slice(currentIndex, currentIndex + 3).map((property) => (
            <Link 
              to={`/property/${property.id}`} 
              key={property.id}
              className="tw-block tw-transition-transform hover:tw-scale-[1.02] tw-no-underline tw-text-inherit"
            >
              <div className="tw-bg-white tw-rounded-lg tw-overflow-hidden tw-shadow-lg">
                {/* Image */}
                <div className="tw-aspect-[4/3] tw-relative">
                  <img
                    src={property.imageUrls?.[0]}
                    alt={property.name}
                    onError={(e) => {
                      e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                    }}
                    className="tw-w-full tw-h-full tw-object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="tw-p-6 tw-text-center">
                  <h3 className="tw-text-2xl tw-font-bold tw-mb-2">{property.name}</h3>
                  <p className="tw-text-gray-600 tw-text-lg tw-mb-3">{property.area}</p>
                  <p className="tw-text-2xl tw-font-bold tw-mb-4">
                    RM {typeof property.price === 'number' ?
                      property.price.toLocaleString() :
                      parseFloat(property.price).toLocaleString()}
                  </p>
                  <p className="tw-text-gray-600 tw-text-lg">
                    {property.bedrooms} Bedrooms | {property.type}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="tw-flex tw-justify-between tw-items-center tw-mt-8">
          <button
            onClick={previousProperties}
            className="tw-bg-white tw-rounded-full tw-p-2 tw-shadow-lg tw-opacity-70 hover:tw-opacity-100"
            aria-label="Previous properties"
          >
            <ChevronLeft className="tw-w-6 tw-h-6" />
          </button>

          {/* Pagination Dots */}
          <div className="tw-flex tw-gap-2">
            {Array.from({ length: Math.ceil(properties.length / 3) }).map((_, index) => (
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
    </section>
  );
};

export default FeaturedProperties;