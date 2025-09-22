import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUserTie, 
  FaUsers, 
  FaClipboardList, 
  FaMoneyBillWave, 
  FaTools, 
  FaChartLine,
  FaArrowRight
} from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Simplify Your Property Management</h1>
          <p>A comprehensive solution for landlords and tenants</p>
          <div className="hero-buttons">
            <Link to="/properties" className="btn btn-primary">
              Browse Properties
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaHome />
              </div>
              <h3>Property Listings</h3>
              <p>Browse available properties with detailed information and high-quality images.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaUserTie />
              </div>
              <h3>Landlord Dashboard</h3>
              <p>Manage all your properties, tenants, and maintenance requests in one place.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Tenant Portal</h3>
              <p>Pay rent, submit maintenance requests, and communicate with your landlord.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaClipboardList />
              </div>
              <h3>Lease Management</h3>
              <p>Create, sign, and manage lease agreements electronically.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaMoneyBillWave />
              </div>
              <h3>Online Payments</h3>
              <p>Secure and convenient online rent payments with transaction history.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaTools />
              </div>
              <h3>Maintenance Tracking</h3>
              <p>Submit, track, and resolve maintenance issues efficiently.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Financial Reports</h3>
              <p>Generate detailed financial reports for better property management.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaHome />
              </div>
              <h3>Rental Applications</h3>
              <p>Accept and review rental applications online with background checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up as a landlord or tenant in just a few minutes.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Add Properties</h3>
              <p>Landlords can add properties with details and photos.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Tenants can browse properties and submit applications.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Manage</h3>
              <p>Handle leases, payments, and maintenance all in one platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to streamline your property management?</h2>
          <p>Join thousands of landlords and tenants who trust our platform.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Today <FaArrowRight className="btn-icon" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 