import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaHome, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <FaLock />
        </div>
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-buttons">
          <Link to="/" className="btn btn-primary">
            <FaHome /> Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-secondary"
          >
            <FaArrowLeft /> Go Back
          </button>
          <Link to="/login" className="btn btn-outline">
            <FaSignInAlt /> Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 