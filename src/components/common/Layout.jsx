import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaBuilding, FaUser, FaBars, FaTimes, FaSignOutAlt, FaInbox, FaBell, FaList, FaPlus, FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaTools, FaFileContract, FaCreditCard } from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get user's full name
  const getUserFullName = () => {
    if (!currentUser) return '';
    
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    } else if (currentUser.firstName) {
      return currentUser.firstName;
    } else {
      return currentUser.email || 'User';
    }
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { to: '/', icon: <FaHome />, text: 'Home' },
        { to: '/properties', icon: <FaBuilding />, text: 'Available Properties' },
        { to: '/login', icon: <FaUser />, text: 'Login' },
        { to: '/register', icon: <FaUser />, text: 'Register' }
      ];
    }

    const roleBasedLinks = {
      ADMIN: [
        { to: '/admin/dashboard', icon: <FaHome />, text: 'Dashboard' },
        { to: '/admin/users', icon: <FaUser />, text: 'Users' },
        { to: '/admin/properties', icon: <FaBuilding />, text: 'Properties' },
        { to: '/admin/reports', icon: <FaBuilding />, text: 'Reports' },
        { to: '/admin/settings', icon: <FaUser />, text: 'Settings' }
      ],
      LANDLORD: [
        { to: '/landlord/dashboard', icon: <FaHome />, text: 'Dashboard' },
        { to: '/landlord/properties', icon: <FaBuilding />, text: 'Manage Properties' },
        { to: '/landlord/properties/add', icon: <FaPlus />, text: 'Add Property' },
        { to: '/landlord/sold-properties', icon: <FaBuilding />, text: 'Sold Properties' },
        { to: '/purchase-requests', icon: <FaList />, text: 'Purchase Requests' },
        { to: '/landlord/leases', icon: <FaFileContract />, text: 'Leases' },
        { to: '/landlord/payments', icon: <FaCreditCard />, text: 'Payments' },
        { to: '/landlord/maintenance', icon: <FaTools />, text: 'Maintenance' },
        { to: '/landlord/tenants', icon: <FaUser />, text: 'Tenants' },
        { to: '/landlord/settings', icon: <FaUser />, text: 'Settings' }
      ],
      TENANT: [
        { to: '/tenant/dashboard', icon: <FaHome />, text: 'Dashboard' },
        { to: '/tenant/browse-properties', icon: <FaSearch />, text: 'Browse Properties' },
        { to: '/tenant/purchased-properties', icon: <FaBuilding />, text: 'Purchased Properties' },
        { to: '/purchase-requests', icon: <FaList />, text: 'Purchase Requests' },
        { to: '/tenant/lease', icon: <FaFileContract />, text: 'My Lease' },
        { to: '/tenant/payments', icon: <FaCreditCard />, text: 'Payments' },
        { to: '/tenant/maintenance', icon: <FaTools />, text: 'Maintenance' },
        { to: '/tenant/settings', icon: <FaUser />, text: 'Settings' }
      ]
    };

    // Common links for all authenticated users
    const commonLinks = [
      { to: '/messages', icon: <FaInbox />, text: 'Messages' },
      { to: '/profile', icon: <FaUser />, text: 'Profile' }
    ];

    return [...(roleBasedLinks[userRole] || []), ...commonLinks];
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <Link to="/" className="logo">
            Property Management System
          </Link>
        </div>
        <div className="header-right">
          {currentUser && (
            <>
              <Link to="/messages" className="header-icon">
                <FaInbox />
              </Link>
              <Link to="/notifications" className="header-icon">
                <FaBell />
              </Link>
              <div className="user-profile">
                <Link to="/profile" className="profile-link">{getUserFullName()}</Link>
                <button onClick={handleLogout} className="logout-button">
                  <FaSignOutAlt />
                </button>
              </div>
            </>
          )}
          {!currentUser && (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <ul>
              {getNavLinks().map((link, index) => (
                <li key={index}>
                  <Link to={link.to} onClick={() => setSidebarOpen(false)}>
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-text">{link.text}</span>
                  </Link>
                </li>
              ))}
              {currentUser && (
                <li className="sidebar-logout">
                  <button onClick={handleLogout}>
                    <span className="nav-icon"><FaSignOutAlt /></span>
                    <span className="nav-text">Logout</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <h3>Property Management System</h3>
              <div className="footer-social">
                <a href="#" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
            
            <div className="footer-contact">
              <p><FaPhone /> +1 (123) 456-7890</p>
              <p><FaEnvelope /> info@propertymanagementsystem.com</p>
            </div>
          </div>
          
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} Property Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 