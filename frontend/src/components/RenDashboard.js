import API_ENDPOINTS from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RenDashboard.css';

const RenDashboard = () => {
    const [showApproved, setShowApproved] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showRejected, setShowRejected] = useState(false);
    const [properties, setProperties] = useState({
        approved_properties: [],
        pending_rejected_properties: []
    });
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.USER_INFO, {
                credentials: 'include'
            });
            const userData = await response.json();
            
            if (userData.error) {
                throw new Error(userData.error);
            }
            
            if (userData.id) {
                setUserId(userData.id);
                fetchRenProperties(userData.id);
            }
        } catch (err) {
            setError('Failed to fetch user information');
            setIsLoading(false);
        }
    };
    
    const fetchRenProperties = async (renId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.REN_PROPERTIES}/${renId}`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            
            setProperties({
                approved_properties: data.approved_properties || [],
                pending_rejected_properties: data.pending_rejected_properties || []
            });
        } catch (err) {
            setError('Failed to fetch properties. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(price);
    };

    // Update the PropertyCard component with better styling for the rejection reason
    const PropertyCard = ({ property }) => (
        <div className={`property-card ${property.status === 'rejected' ? 'rejected-property' : ''}`}>
            <div className="property-header">
                <h3 className="property-title">{property.name}</h3>
                <span className={`property-status ${property.status}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
            </div>
            
            <div className="property-info">
                <div className="info-item">
                    <span className="info-label">Area</span>
                    <span className="info-value">{property.area}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Size</span>
                    <span className="info-value">{property.size} sq ft</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Price</span>
                    <span className="info-value price">{formatPrice(property.price)}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{property.form_of_interest}</span>
                </div>
            </div>

            <div className="property-specs">
                <div className="spec-item">
                    <span>🛏️ {property.bedrooms} Beds</span>
                </div>
                <div className="spec-item">
                    <span>🚿 {property.bathrooms} Baths</span>
                </div>
            </div>

            {property.status === 'rejected' && property.rejection_reason && (
              
                <div className="rejection-reason">
                    <p><strong>Rejection Reason:</strong> {property.rejection_reason}</p>
                    {property.rejected_at && (
                        <p className="rejection-date">
                            Rejected on: {new Date(property.rejected_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    const SectionHeader = ({ title, count, isOpen, onToggle }) => (
        <div className={`section-header ${isOpen ? 'open' : ''}`} onClick={onToggle}>
            <div className="header-content">
                <h3>{title}</h3>
                <span className="property-count">{count}</span>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    const pendingProperties = properties.pending_rejected_properties.filter(
        prop => prop.status === 'pending'
    );
    
    const rejectedProperties = properties.pending_rejected_properties.filter(
        prop => prop.status === 'rejected'
    );

    return (
        <div className="ren-dashboard">
            <div className="dashboard-header">
                <h2>REN Dashboard</h2>
                <button 
                    className="submit-property-btn"
                    onClick={() => navigate('/submit-new-property')}
                >
                    Submit New Property
                </button>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            <div className="dashboard-sections">
                {/* Approved Properties Section */}
                <div className="dashboard-section">
                    <SectionHeader
                        title="Approved Properties"
                        count={properties.approved_properties.length}
                        isOpen={showApproved}
                        onToggle={() => setShowApproved(!showApproved)}
                    />
                    {showApproved && (
                        <div className="properties-list">
                            {properties.approved_properties.length > 0 ? (
                                properties.approved_properties.map(property => (
                                    <PropertyCard key={property.id} property={property} />
                                ))
                            ) : (
                                <p className="no-properties">No approved properties found</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pending Properties Section */}
                <div className="dashboard-section">
                    <SectionHeader
                        title="Pending Properties"
                        count={pendingProperties.length}
                        isOpen={showPending}
                        onToggle={() => setShowPending(!showPending)}
                    />
                    {showPending && (
                        <div className="properties-list">
                            {pendingProperties.length > 0 ? (
                                pendingProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} />
                                ))
                            ) : (
                                <p className="no-properties">No pending properties found</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Rejected Properties Section */}
                <div className="dashboard-section">
                    <SectionHeader
                        title="Rejected Properties"
                        count={rejectedProperties.length}
                        isOpen={showRejected}
                        onToggle={() => setShowRejected(!showRejected)}
                    />
                    {showRejected && (
                        <div className="properties-list">
                            {rejectedProperties.length > 0 ? (
                                rejectedProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} />
                                ))
                            ) : (
                                <p className="no-properties">No rejected properties found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RenDashboard;