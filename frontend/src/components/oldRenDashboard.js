import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RenDashboard.css'; // We'll create this CSS file

const RenDashboard = () => {
    const [showApproved, setShowApproved] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showRejected, setShowRejected] = useState(false);
    const navigate = useNavigate();

    const toggleSection = (section) => {
        if (section === 'approved') setShowApproved(!showApproved);
        if (section === 'pending') setShowPending(!showPending);
        if (section === 'rejected') setShowRejected(!showRejected);
    };

    const handleSubmitNewProperty = () => {
        navigate('/submit-new-property');
    };

    return (
        <div className="ren-dashboard">
            <h2>REN Dashboard</h2>
            <button className="submit-new-property-btn" onClick={handleSubmitNewProperty}>
                Submit New Property
            </button>

            <div className="dashboard-section">
                <h3 onClick={() => toggleSection('approved')}>Approved Properties</h3>
                {showApproved && <p>List of Approved Properties (to be implemented)</p>}
            </div>

            <div className="dashboard-section">
                <h3 onClick={() => toggleSection('pending')}>Pending Properties</h3>
                {showPending && <p>List of Pending Properties (to be implemented)</p>}
            </div>

            <div className="dashboard-section">
                <h3 onClick={() => toggleSection('rejected')}>Rejected Properties</h3>
                {showRejected && <p>List of Rejected Properties (to be implemented)</p>}
            </div>
        </div>
    );
};

export default RenDashboard;