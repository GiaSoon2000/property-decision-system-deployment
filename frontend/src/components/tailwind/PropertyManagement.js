import API_ENDPOINTS from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const PropertyManagement = () => {
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
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
      status: '',
      existingImages: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      loadProperties();
    }, []);
  
    const headers = {
        'Content-Type': 'application/json',
        // Include credentials in requests
        credentials: 'include',
    };

    const loadProperties = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_APPROVED_PROPERTIES,{
            credentials: 'include'
        });
        if (!response.ok) {
            if (response.status === 403) {
              // Handle unauthorized access
              navigate('/login'); // Redirect to login if unauthorized
              return;
            }
            throw new Error('Failed to load properties');
        }
        const data = await response.json();
        console.log('Property data:', data); // Add this line
        setProperties(data);
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    };
  
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
      };
  
      
      const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prevData => ({
          ...prevData,
          images: files
        }));
      };

    const showCreatePropertyForm = () => {
      setShowForm(true);
      setIsEditing(false);
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
        status: '',
        existingImages: []
      });
    };
  
    const handleEdit = async (propertyId) => {
        try {
            setIsEditing(true);
            setEditingId(propertyId);
            
            console.log('Fetching property details for ID:', propertyId);
            
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_EDIT}/${propertyId}/edit`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch property details');
            }
            
            const property = await response.json();
            console.log('Fetched property data:', property);

            // Ensure all values are properly formatted
            const formattedData = {
                name: property.name || '',
                type: property.type || '',
                bedrooms: property.bedrooms?.toString() || '',
                bathrooms: property.bathrooms?.toString() || '',
                size: property.size?.toString() || '',
                price: property.price?.toString() || '',
                latitude: property.latitude?.toString() || '',
                longitude: property.longitude?.toString() || '',
                area: property.area || '',
                form_of_interest: property.form_of_interest || '',
                financing_options: property.financing_options || '',
                description: property.description || '',
                furnishing_status: property.furnishing_status || '',
                facing_direction: property.facing_direction || '',
                year_built: property.year_built?.toString() || '',
                facilities: property.facilities || '',
                status: property.status || '',
                existingImages: []
            };

            console.log('Formatted form data:', formattedData);
            setFormData(formattedData);
            setShowForm(true);

            // Fetch property images
            const imagesResponse = await fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_IMAGES}/${propertyId}/images`, {
                credentials: 'include',
            });
        
            if (!imagesResponse.ok) {
                throw new Error('Failed to fetch property images');
            }
        
            const images = await imagesResponse.json();
            console.log('Fetched images:', images);
            setFormData(prevData => ({ ...prevData, existingImages: images }));
        } catch (error) {
            console.error('Error fetching property details:', error);
            alert('Failed to load property details: ' + error.message);
        }
    };
  
    const handleDelete = async (propertyId) => {
      if (window.confirm('Are you sure you want to delete this property?')) {
        try {
          const response = await fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_DELETE}/${propertyId}/delete`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (response.ok) {
            alert('Property deleted successfully!');
            loadProperties();
          } else {
            throw new Error('Failed to delete property');
          }
        } catch (error) {
          console.error('Error deleting property:', error);
          alert('Failed to delete property');
        }
      }
    };
  
    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await fetch(
                `${API_ENDPOINTS.ADMIN_PROPERTY_IMAGES}/${editingId}/image/${imageId}/delete`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            const data = await response.json();
            
            // Update the formData state to remove the deleted image
            setFormData(prevData => ({
                ...prevData,
                existingImages: prevData.existingImages.filter(img => img.id !== imageId)
            }));

            // Show success message
            alert('Image deleted successfully');

        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image: ' + error.message);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Define the URL based on whether we're editing or creating
        const url = isEditing 
            ? `${API_ENDPOINTS.ADMIN_PROPERTY_EDIT}/${editingId}/edit`
            : API_ENDPOINTS.ADMIN_CREATE_PROPERTY;
        
        const formDataObj = new FormData();
        
        // Convert and validate data before sending
        const fieldsToSend = {
            name: formData.name || '',
            type: formData.type || '',
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : '',
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : '',
            size: formData.size ? parseFloat(formData.size) : '',
            price: formData.price ? parseFloat(formData.price) : '',
            latitude: formData.latitude ? parseFloat(formData.latitude) : '',
            longitude: formData.longitude ? parseFloat(formData.longitude) : '',
            area: formData.area || '',
            form_of_interest: formData.form_of_interest || '',
            financing_options: formData.financing_options || '',
            description: formData.description || '',
            furnishing_status: formData.furnishing_status || '',
            facing_direction: formData.facing_direction || '',
            year_built: formData.year_built ? parseInt(formData.year_built) : '',
            facilities: formData.facilities || ''
        };

        // Append all fields to FormData
        Object.entries(fieldsToSend).forEach(([key, value]) => {
            formDataObj.append(key, value.toString());
        });

        // Preserve existing images by sending their IDs
        if (formData.existingImages && formData.existingImages.length > 0) {
            formData.existingImages.forEach(image => {
                formDataObj.append('existing_images[]', image.id);
            });
        }
        
        // Add any new images
        if (formData.images) {
            const imageFiles = Array.from(formData.images);
            imageFiles.forEach(image => {
                formDataObj.append('images', image);
            });
        }

        try {
            console.log('Sending request to:', url);
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formDataObj
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to save property');
            }

            alert(isEditing ? 'Property updated successfully!' : 'Property created successfully!');
            setShowForm(false);
            loadProperties();
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Failed to save property: ' + error.message);
        }
    };

  return (
    <div className="tw-max-w-7xl tw-mx-auto tw-px-4 tw-py-8 tw-pt-20">
      <button 
        onClick={showCreatePropertyForm}
        className="tw-bg-green-500 hover:tw-bg-green-600 tw-text-white tw-px-6 tw-py-3 tw-rounded-lg 
                  tw-font-medium tw-shadow-sm tw-transition-colors tw-duration-200 tw-mb-8"
      >
        {isEditing ? 'Update Property' : 'Create New Property'}
      </button>

      {showForm && (
        <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-z-50">
          <form 
            onSubmit={handleFormSubmit}
            className="tw-bg-white tw-rounded-lg tw-p-6 tw-w-full tw-max-w-2xl tw-max-h-[90vh] tw-overflow-y-auto"
          >
            <h2 className="tw-text-2xl tw-font-bold tw-mb-6">
              {isEditing ? 'Edit Property' : 'Create New Property'}
            </h2>
            
            <div className="tw-space-y-4 tw-pr-6">
              <input
                type="text"
                name="name"
                placeholder="Property Name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
              />
              {/* <input
                type="text"
                name="type"
                placeholder="Property Type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
              /> */}
                <select className="tw-w-full tw-px-2 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500" 
                    name="type" required value={formData.type} onChange={handleInputChange}>
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
              <div className="tw-grid tw-grid-cols-2 tw-gap-12 ">
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="Bedrooms"
                  required
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="Bathrooms"
                  required
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
            </div>
            <div className="tw-grid tw-grid-cols-2 tw-gap-12 ">
                <input
                    type="number"
                    name="size"
                    placeholder="Size (sq ft)"
                    onChange={handleInputChange}
                    value={formData.size}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    onChange={handleInputChange}
                    value={formData.price}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
            </div>
            <div className="tw-grid tw-grid-cols-2 tw-gap-12 ">
                <input
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    onChange={handleInputChange}
                    value={formData.latitude}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <input
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    onChange={handleInputChange}
                    value={formData.longitude}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
            </div>
            <div className="tw-grid tw-grid-cols-2 tw-gap-12 ">
                <input
                    type="text"
                    name="area"
                    placeholder="Area (e.g. Senai, Kulai)"
                    onChange={handleInputChange}
                    value={formData.area}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <input
                    type="text"
                    name="form_of_interest"
                    placeholder="Form of Interest"
                    onChange={handleInputChange}
                    value={formData.form_of_interest}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
            </div>
            <div className="tw-grid tw-grid-cols-2 tw-gap-12 ">
                <input
                    type="text"
                    name="financing_options"
                    placeholder="Financing Options"
                    onChange={handleInputChange}
                    value={formData.financing_options}
                    required
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
                <input
                    type="text"
                    name="year_built"
                    placeholder="Year Built (Optional)"
                    value={formData.year_built}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                />
              </div>
              <div className="tw-grid tw-grid-cols-2 tw-gap-12">
                <select 
                    name="furnishing_status" 
                    value={formData.furnishing_status} 
                    onChange={handleInputChange}
                    required
                    className="tw-w-full tw-px-2 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
                >
                    <option value="">Select Furnishing Status</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Partially Furnished">Partially Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                </select>

                <select 
                    name="facing_direction" 
                    value={formData.facing_direction} 
                    onChange={handleInputChange}
                    required
                    className="tw-w-full tw-px-2 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
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
            </div>

            <div className="tw-w-full">
                <textarea
                    name="description"
                    placeholder="Property Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 
                               focus:tw-ring-blue-500 tw-resize-none"
                />
            </div>

            <div className="tw-w-full">
                <textarea
                    name="facilities"
                    placeholder="Facilities (comma-separated)"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg focus:tw-ring-2 
                               focus:tw-ring-blue-500 tw-resize-none"
                />
            </div>

            <div className="tw-mt-4">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Property Images
                </label>
                {formData.existingImages && formData.existingImages.length > 0 && (
                    <div className="tw-mb-4 tw-grid tw-grid-cols-2 tw-gap-4">
                        {formData.existingImages.map((img) => (
                            <div key={img.id} className="tw-relative tw-group">
                                <img 
                                    src={`${API_ENDPOINTS.STATIC_IMAGES}/${img.image_path}`}
                                    alt="Property" 
                                    className="tw-w-full tw-h-32 tw-object-cover tw-rounded-md"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="tw-absolute tw-top-2 tw-right-2 tw-bg-red-500 tw-text-white 
                                                tw-rounded-full tw-p-1 
                                                tw-opacity-100 tw-group-hover:tw-bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500"
                />
                </div>
            </div>

            <div className="tw-mt-6 tw-flex tw-gap-4">
              <button
                type="submit"
                className="tw-flex-1 tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg 
                         tw-font-medium tw-shadow-sm tw-transition-colors tw-duration-200"
              >
                {isEditing ? 'Update Property' : 'Create Property'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="tw-flex-1 tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-800 tw-px-6 tw-py-2 
                         tw-rounded-lg tw-font-medium tw-shadow-sm tw-transition-colors tw-duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-mt-8">
        {properties.map((property) => (
            <div 
                key={property.id} 
                className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden hover:tw-shadow-lg 
                          tw-transition-shadow tw-duration-200"
            >
            <div className="tw-w-full tw-h-48">
                {property.images && property.images.length > 0 ? (
                <img
                    className="tw-w-full tw-h-full tw-object-cover"
                    src={`${API_ENDPOINTS.STATIC_IMAGES}/${property.images[0]}`}
                    alt={property.name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;
                    }}
                />
                ) : (
                <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-bg-gray-100">
                    <p className="tw-text-gray-500">No Image Available</p>
                </div>
                )}
            </div>
            <div className="tw-p-4">
              <div className="tw-text-xl tw-font-bold tw-text-blue-600 tw-mb-2">
                RM {Number(property.price).toLocaleString()}
              </div>
              <h3 className="tw-text-lg tw-font-semibold tw-mb-2">{property.name}</h3>
              <div className="tw-text-gray-600 tw-mb-2">{property.area}</div>
              <p className="tw-text-gray-700">
                {property.bedrooms} beds • {property.bathrooms} baths • {property.size} sqft
              </p>
              <div className="tw-mt-4 tw-flex tw-gap-3">
                <button
                  onClick={() => handleEdit(property.id)}
                  className="tw-flex-1 tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 
                           tw-rounded-lg tw-transition-colors tw-duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="tw-flex-1 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-px-4 tw-py-2 
                           tw-rounded-lg tw-transition-colors tw-duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyManagement;