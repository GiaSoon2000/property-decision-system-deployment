import API_ENDPOINTS from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/oldAdminDashboard.css';

const AdminDashboard = () => {
    const [pendingProperties, setPendingProperties] = useState([]);
    const [approvedProperties, setApprovedProperties] = useState([]);
    const [rejectedProperties, setRejectedProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [rens, setRens] = useState([]);
    const [activeTab, setActiveTab] = useState('properties'); // New state for tab management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        fetchPendingProperties();
        fetchApprovedProperties();
        fetchRejectedProperties();
        fetchUsers();
        fetchRens();
    }, []);

    const fetchPendingProperties = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_PENDING_PROPERTIES, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched Pending Properties:', data); // Debug log
                setPendingProperties(data);
            } else {
                console.error('Failed to fetch pending properties.');
            }
        } catch (error) {
            console.error('Error fetching pending properties:', error);
        }
    };

    const fetchApprovedProperties = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_APPROVED_PROPERTIES, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setApprovedProperties(data);
            } else {
                console.error('Failed to fetch approved properties.');
            }
        } catch (error) {
            console.error('Error fetching approved properties:', error);
        }
    };

    const fetchRejectedProperties = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_REJECTED_PROPERTIES, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setRejectedProperties(data);
            } else {
                console.error('Failed to fetch rejected properties.');
            }
        } catch (error) {
            console.error('Error fetching rejected properties:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_USERS, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchRens = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.ADMIN_RENS, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch RENs');
            }
            const data = await response.json();
            setRens(data);
        } catch (error) {
            console.error('Error fetching RENs:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setIsApproving(true);
        try {
            console.log(`Starting approval process for property ID: ${id}`);
            
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_APPROVE}/${id}/approve`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            console.log('Response from server:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to approve property');
            }
            
            // Show success message
            alert(data.message);
            
            // Refresh lists with error handling
            try {
                await Promise.all([
                    fetchPendingProperties(),
                    fetchApprovedProperties()
                ]);
                console.log('Successfully refreshed property lists');
            } catch (refreshError) {
                console.error('Error refreshing lists:', refreshError);
                alert('Property was approved but there was an error refreshing the lists. Please refresh the page.');
            }
            
        } catch (error) {
            console.error('Error in handleApprove:', error);
            alert(`Failed to approve property: ${error.message}`);
        } finally {
            setIsApproving(false);
        }
    };
    
    const handleReject = async (id) => {
        setIsRejecting(true);
        const reason = prompt("Enter the reason for rejection:");
        if (!reason) return; // If no reason is provided, cancel the operation
        
        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_REJECT}/${id}/reject`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason }),
                credentials: 'include',
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reject property');
            }
    
            alert(data.message);
            
            // Refresh both pending and rejected lists
            await Promise.all([
                fetchPendingProperties(),
                fetchRejectedProperties()
            ]);
            
        } catch (error) {
            console.error('Error rejecting property:', error);
            alert(error.message || 'Failed to reject property. Please try again.');
        }finally {
            setIsRejecting(false);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_BAN_USER}/${userId}/ban`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                // Refresh user lists
                fetchUsers();
                fetchRens();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to ban user');
            }
        } catch (error) {
            console.error('Error banning user:', error);
            alert(error.message || 'Failed to ban user. Please try again.');
        }
    };

    const renderUsersList = () => (
        <div className="section">
            <h2>Regular Users</h2>
            <div className="users-grid">
                {users.filter(user => user.role === 'user').map((user) => (
                    <div key={user.id} className="user-card">
                        <h3>Username: {user.username}</h3>
                        <p>Status: <span className={`status-${user.status}`}>{user.status}</span></p>
                        <p>Email: {user.email || 'Not provided'}</p>
                        <p>Join Date: {new Date(user.created_at).toLocaleDateString()}</p>
                        {user.status !== 'banned' && (
                            <button 
                                className="ban-button"
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to ban ${user.username}?`)) {
                                        handleBanUser(user.id);
                                    }
                                }}
                            >
                                Ban User
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const handleVerifyRen = async (renId) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_VERIFY_REN}/${renId}/verify`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const data = await response.json();
            
            if (data.error) {
                console.log("Error message:", data.error);
                // Only alert if it's not "already verified"
                if (data.error !== "REN already verified") {
                    alert(data.error);
                    return;
                }
            }
    
            // Refresh regardless of response
            fetchRens();
            alert(data.message || "REN verification status updated");
    
        } catch (error) {
            console.error('Error verifying REN:', error);
            alert('Failed to verify REN. Please try again.');
        }
    };


    const renderRensList = () => {
        console.log('RENs before filter:', rens.map(ren => ren.role));

        return (
            <div className="section">
                <h2>Real Estate Negotiators (RENs)</h2>
                <div className="users-grid">
                    {rens.map((ren) => (
                        <div key={ren.id} className="user-card ren-card">
                            <h3>Username: {ren.username}</h3>
                            <p>Status: <span className={`status-${ren.status}`}>{ren.status}</span></p>
                            <p>Email: {ren.email || 'Not provided'}</p>
                            <p>REN number: {ren.REN_id || 'Not provided'}</p>
                            <p>Verified status: <span className={`verification-status-${ren.verified_status === 1 ? 'verified' : 'unverified'}`}>
                                {ren.verified_status === 1 ? 'Verified' : 'Not verified'}
                            </span></p>
                            <p>Join Date: {new Date(ren.created_at).toLocaleDateString()}</p>
                            {ren.status !== 'banned' && (
                                <button 
                                    className="ban-button"
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to ban ${ren.username}?`)) {
                                            handleBanUser(ren.id);
                                        }
                                    }}
                                >
                                    Ban REN
                                </button>
                            )}
                            {ren.verified_status !== 1 && (
                                <button 
                                    className="verify-button"
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to verify ${ren.username}?`)) {
                                            handleVerifyRen(ren.id);
                                        }
                                    }}
                                >
                                    Verify REN
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div>Loading RENs...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
            </div>
            
            <div className="dashboard-tabs">
                <button 
                    className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
                    onClick={() => setActiveTab('properties')}
                >
                    Properties
                </button>
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users & RENs
                </button>
            </div>

            {activeTab === 'properties' && (
                <div className="properties-container">
                    {/* Pending Properties Section */}
                    <div className="property-section">
                        <input type="checkbox" id="pending-section" />
                        <label className="section-header" htmlFor="pending-section">
                            <span className="section-title">Pending Properties</span>
                            <span className="section-count">{pendingProperties.length}</span>
                        </label>
                        <div className="section-content">
                            <div className="property-cards">
                                {pendingProperties.length > 0 ? pendingProperties.map((property) => (
                                    <div key={property.id} className="property-card">
                                        <h3>{property.name}</h3>
                                        <div className="property-details">
                                            <div className="property-detail">
                                                <strong>Type</strong>
                                                <span className="property-badge">{property.type}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Price</strong>
                                                <span className="price-value">
                                                    RM {typeof property.price === 'number' ? 
                                                        property.price.toLocaleString() : 
                                                        parseFloat(property.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Area</strong>
                                                <span className="property-badge">{property.area}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Size</strong>
                                                <span>{property.size} sq ft</span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button 
                                                className="action-button approve-button"
                                                onClick={() => handleApprove(property.id)}
                                                disabled={isApproving}
                                            >
                                                {isApproving ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button 
                                                className="action-button reject-button"
                                                onClick={() => handleReject(property.id)}
                                                disabled={isRejecting}
                                            >
                                                {isRejecting ? 'Rejecting...' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                )) : <p>No pending properties.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Approved Properties Section */}
                    <div className="property-section">
                        <input type="checkbox" id="approved-section" />
                        <label className="section-header" htmlFor="approved-section">
                            <span className="section-title">Approved Properties</span>
                            <span className="section-count">{approvedProperties.length}</span>
                        </label>
                        <div className="section-content">
                            <div className="property-cards">
                                {approvedProperties.length > 0 ? approvedProperties.map((property) => (
                                    <div key={property.id} className="property-card">
                                        <h3>{property.name}</h3>
                                        <div className="property-details">
                                            <div className="property-detail">
                                                <strong>Type</strong>
                                                <span className="property-badge">{property.type}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Price</strong>
                                                <span className="price-value">
                                                    RM {typeof property.price === 'number' ? 
                                                        property.price.toLocaleString() : 
                                                        parseFloat(property.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Area</strong>
                                                <span className="property-badge">{property.area}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Size</strong>
                                                <span>{property.size} sq ft</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p>No approved properties.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Rejected Properties Section */}
                    <div className="property-section">
                        <input type="checkbox" id="rejected-section" />
                        <label className="section-header" htmlFor="rejected-section">
                            <span className="section-title">Rejected Properties</span>
                            <span className="section-count">{rejectedProperties.length}</span>
                        </label>
                        <div className="section-content">
                            <div className="property-cards">
                                {rejectedProperties.length > 0 ? rejectedProperties.map((property) => (
                                    <div key={property.id} className="property-card">
                                        <h3>{property.name}</h3>
                                        <div className="property-details">
                                            <div className="property-detail">
                                                <strong>Type</strong>
                                                <span className="property-badge">{property.type}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Price</strong>
                                                <span className="price-value">
                                                    RM {typeof property.price === 'number' ? 
                                                        property.price.toLocaleString() : 
                                                        parseFloat(property.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Area</strong>
                                                <span className="property-badge">{property.area}</span>
                                            </div>
                                            <div className="property-detail">
                                                <strong>Size</strong>
                                                <span>{property.size} sq ft</span>
                                            </div>
                                        </div>
                                        {property.rejection_reason && (
                                            <div className="property-detail rejection-reason">
                                                <strong>Reason for Rejection</strong>
                                                <span className="reason-text">{property.rejection_reason}</span>
                                            </div>
                                        )}
                                    </div>
                                )) : <p>No rejected properties.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users & RENs Section */}
            {activeTab === 'users' && (
                <div className="dashboard-sections">
                    {renderUsersList()}
                    {renderRensList()}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;