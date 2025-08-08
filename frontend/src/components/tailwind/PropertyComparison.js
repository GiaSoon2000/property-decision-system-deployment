import API_ENDPOINTS from '../config';
import React from 'react';
import { X } from 'lucide-react';

const PropertyComparison = ({ 
  propertiesToCompare, 
  onRemoveProperty,
  onClose 
}) => {
  // Helper function to render comparison row
  const renderComparisonRow = (label, key) => (
    <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-py-2 tw-border-b">
      <div className="tw-font-medium">{label}</div>
      {propertiesToCompare.map((property, index) => (
        <div key={index} className="tw-text-sm">
          {key === 'price' ? `RM ${Number(property.price).toLocaleString()}` : property[key]}
        </div>
      ))}
    </div>
  );

  return (
    <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-shadow-lg tw-z-50 tw-max-h-[80vh] tw-overflow-auto tw-border tw-rounded-t-lg">
      <div className="tw-sticky tw-top-0 tw-bg-white tw-z-10 tw-p-4 tw-border-b">
        <div className="tw-flex tw-items-center tw-justify-between">
          <h2 className="tw-text-lg tw-font-semibold">Compare Properties</h2>
          <button 
            onClick={onClose}
            className="tw-p-2 tw-bg-red-500 hover:tw-bg-red-600 tw-rounded-full tw-text-white"
          >
            <X className="tw-h-4 tw-w-4" />
          </button>
        </div>
      </div>
      
      <div className="tw-p-4">
        {/* Property Images and Names */}
        <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mb-6">
          <div className="tw-font-medium">Properties</div>
          {propertiesToCompare.map((property, index) => (
            <div key={index} className="tw-relative">
              <button 
                className="tw-absolute tw--top-2 tw--right-2 tw-h-6 tw-w-6 tw-bg-red-500 tw-rounded-full tw-shadow hover:tw-bg-red-600 tw-flex tw-items-center tw-justify-center tw-text-white"
                onClick={() => onRemoveProperty(property.id)}
              >
                {/* <X className="tw-h-4 tw-w-4" /> */}
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
        </div>

        {/* Comparison Rows */}
        {renderComparisonRow('Price (RM)', 'price')}
        {renderComparisonRow('Area', 'area')}
        {renderComparisonRow('Property Type', 'type')}
        {renderComparisonRow('Bedrooms', 'bedrooms')}
        {renderComparisonRow('Bathrooms', 'bathrooms')}
        {renderComparisonRow('Furnishing Status', 'furnishing_status')}
        {renderComparisonRow('Facing Direction', 'facing_direction')}
        {renderComparisonRow('Year Built', 'year_built')}
      </div>
    </div>
  );
};

export default PropertyComparison;