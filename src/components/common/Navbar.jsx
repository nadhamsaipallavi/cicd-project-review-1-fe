import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaBars, FaTimes, FaUserCog, FaBuilding, FaClipboardList, FaUsers, FaEnvelope, FaRupeeSign } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Check if isAuthenticated is a function or a boolean
  const checkAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <FaHome className="mr-2" /> },
    { label: 'Properties', path: '/properties', icon: <FaBuilding className="mr-2" /> },
  ];

  // Role-specific menu items
  const getRoleSpecificItems = () => {
    const authenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated;
    if (!currentUser || !authenticated) return [];

    switch (currentUser.role) {
      case 'ADMIN':
        return [
          { label: 'Users', path: '/admin/users', icon: <FaUsers className="mr-2" /> },
          { label: 'Dashboard', path: '/admin/dashboard', icon: <FaClipboardList className="mr-2" /> },
        ];
      case 'LANDLORD':
        return [
          { label: 'My Properties', path: '/landlord/properties', icon: <FaBuilding className="mr-2" /> },
          { label: 'Dashboard', path: '/landlord/dashboard', icon: <FaClipboardList className="mr-2" /> },
        ];
      case 'TENANT':
        return [
          { label: 'Browse', path: '/properties', icon: <FaBuilding className="mr-2" /> },
          { label: 'Dashboard', path: '/tenant/dashboard', icon: <FaClipboardList className="mr-2" /> },
        ];
      default:
        return [];
    }
  };

  const allMenuItems = [...menuItems, ...getRoleSpecificItems()];

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
            <FaBars size={20} />
          </label>
          {isMenuOpen && (
            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
              {allMenuItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
              {currentUser && checkAuthenticated && (
                <>
                  <li>
                    <Link to="/messages" className="flex items-center">
                      <FaEnvelope className="mr-2" />Messages
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="flex items-center">
                      <FaUser className="mr-2" />Profile
                    </Link>
                  </li>
                  <li>
                    <a onClick={handleLogout} className="flex items-center">
                      <FaSignOutAlt className="mr-2" />Logout
                    </a>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          PropertyMS
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {allMenuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        {currentUser && checkAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img 
                  src={currentUser.profileImage || "https://via.placeholder.com/100"} 
                  alt={`${currentUser.firstName}'s profile`} 
                />
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 text-base-content">
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/messages">
                  Messages
                </Link>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex">
            <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-sm btn-ghost">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 