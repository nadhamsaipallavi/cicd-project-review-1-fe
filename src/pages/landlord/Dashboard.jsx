import React, { useState, useEffect } from 'react';
import { FaBuilding, FaRupeeSign, FaTools, FaCalendarAlt, FaPlus, FaBug, FaUser, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { toggleMockDataMode, isMockDataModeEnabled } from '../../utils/mockData';
import './Dashboard.css';

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
  });
  const [properties, setProperties] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mockModeEnabled, setMockModeEnabled] = useState(isMockDataModeEnabled());
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleToggleMockMode = () => {
    const isEnabled = toggleMockDataMode();
    setMockModeEnabled(isEnabled);
    // Refresh the page to apply mock mode
    window.location.reload();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics
        const statsRes = await api.get('/landlord/dashboard/stats');
        setStats(statsRes.data);

        // Fetch properties
        const propertiesRes = await api.get('/landlord/properties');
        setProperties(propertiesRes.data);

        // Fetch recent payments
        const paymentsRes = await api.get('/landlord/payments/recent');
        setRecentPayments(paymentsRes.data);

        // Fetch maintenance requests
        const maintenanceRes = await api.get('/landlord/maintenance-requests/recent');
        setMaintenanceRequests(maintenanceRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner animate-pulse">
          <span className="loading-icon"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Landlord Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, <span className="font-semibold">{user?.firstName}</span>!</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/profile" className="btn btn-outline btn-info" title="View or edit your profile">
            <FaUser /> My Profile
          </Link>
          {isDevelopment && (
            <button 
              onClick={handleToggleMockMode} 
              className="debug-btn"
              title={mockModeEnabled ? "Mock Mode Enabled - Click to disable" : "Mock Mode Disabled - Click to enable"}
            >
              <FaBug className={mockModeEnabled ? "text-green-500" : "text-gray-400"} />
            </button>
          )}
          <Link to="/landlord/properties/add">
            <button className="btn btn-primary">
              <FaPlus /> Add Property
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid animate-slide-up">
        <div className="stat-card property">
          <div className="stat-header">
            <h2 className="stat-title">Properties</h2>
            <div className="stat-icon property">
              <FaBuilding />
            </div>
          </div>
          <p className="stat-value">{stats.properties}</p>
          <div>
            <Link to="/landlord/properties" className="stat-link">
              View All <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="stat-card tenant">
          <div className="stat-header">
            <h2 className="stat-title">Tenants</h2>
            <div className="stat-icon tenant">
              <FaUser />
            </div>
          </div>
          <p className="stat-value">{stats.tenants}</p>
          <div>
            <Link to="/landlord/tenants" className="stat-link">
              View All <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="stat-card payment">
          <div className="stat-header">
            <h2 className="stat-title">Pending Payments</h2>
            <div className="stat-icon payment">
              <FaRupeeSign />
            </div>
          </div>
          <p className="stat-value">{stats.pendingPayments}</p>
          <div>
            <Link to="/landlord/payments" className="stat-link">
              View All <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="stat-card maintenance">
          <div className="stat-header">
            <h2 className="stat-title">Maintenance</h2>
            <div className="stat-icon maintenance">
              <FaTools />
            </div>
          </div>
          <p className="stat-value">{stats.maintenanceRequests}</p>
          <div>
            <Link to="/landlord/maintenance" className="stat-link">
              View All <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Properties List */}
        <div className="content-card">
          <div className="card-body">
            <div className="card-header">
              <div className="card-icon">
                <FaBuilding className="text-primary" />
              </div>
              <h2 className="card-title">My Properties</h2>
            </div>
            {properties.length > 0 ? (
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Address</th>
                      <th>Units</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample data - would be replaced with actual API data */}
                    <tr>
                      <td className="font-medium">Maple Apartments</td>
                      <td>123 Maple St, City</td>
                      <td>8</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td className="font-medium">Sunset Villas</td>
                      <td>456 Sunset Blvd, City</td>
                      <td>6</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td className="font-medium">Urban Heights</td>
                      <td>789 Urban Ave, City</td>
                      <td>12</td>
                      <td><span className="badge badge-warning">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaBuilding />
                </div>
                <p className="empty-text">You haven't added any properties yet.</p>
                <Link to="/landlord/properties/add">
                  <button className="btn btn-primary animate-pulse">Add Your First Property</button>
                </Link>
              </div>
            )}
            {properties.length > 0 && (
              <div className="card-actions">
                <Link to="/landlord/properties" className="btn btn-primary btn-sm">
                  View All Properties <FaArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="content-card">
          <div className="card-body">
            <div className="card-header">
              <div className="card-icon">
                <FaRupeeSign className="text-accent" />
              </div>
              <h2 className="card-title">Recent Payments</h2>
            </div>
            {recentPayments.length > 0 ? (
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Property</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample data - would be replaced with actual API data */}
                    <tr>
                      <td className="font-medium">John Smith</td>
                      <td>Maple Apt #101</td>
                      <td><FaRupeeSign className="rupee-icon" /> {formatCurrency(12000)}</td>
                      <td><span className="badge badge-success">Paid</span></td>
                    </tr>
                    <tr>
                      <td className="font-medium">Mary Johnson</td>
                      <td>Maple Apt #203</td>
                      <td><FaRupeeSign className="rupee-icon" /> {formatCurrency(11500)}</td>
                      <td><span className="badge badge-success">Paid</span></td>
                    </tr>
                    <tr>
                      <td className="font-medium">Robert Davis</td>
                      <td>Sunset Villa #3B</td>
                      <td><FaRupeeSign className="rupee-icon" /> {formatCurrency(15000)}</td>
                      <td><span className="badge badge-warning">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaRupeeSign />
                </div>
                <p className="empty-text">No recent payment records found.</p>
              </div>
            )}
            {recentPayments.length > 0 && (
              <div className="card-actions">
                <Link to="/landlord/payments" className="btn btn-accent btn-sm">
                  View All Payments <FaArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Requests */}
      <div className="content-card">
        <div className="card-body">
          <div className="card-header">
            <div className="card-icon">
              <FaTools className="text-error" />
            </div>
            <h2 className="card-title">Maintenance Requests</h2>
          </div>
          {maintenanceRequests.length > 0 ? (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Property</th>
                    <th>Tenant</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data - would be replaced with actual API data */}
                  <tr>
                    <td className="font-medium">#12345</td>
                    <td>Maple Apt #101</td>
                    <td>John Smith</td>
                    <td>Leaking faucet</td>
                    <td><span className="badge badge-warning">Medium</span></td>
                    <td><span className="badge badge-info">In Progress</span></td>
                    <td>2 days ago</td>
                  </tr>
                  <tr>
                    <td className="font-medium">#12346</td>
                    <td>Sunset Villa #3B</td>
                    <td>Robert Davis</td>
                    <td>AC not working</td>
                    <td><span className="badge badge-error">High</span></td>
                    <td><span className="badge badge-warning">Pending</span></td>
                    <td>1 day ago</td>
                  </tr>
                  <tr>
                    <td className="font-medium">#12347</td>
                    <td>Maple Apt #203</td>
                    <td>Mary Johnson</td>
                    <td>Light bulb replacement</td>
                    <td><span className="badge badge-success">Low</span></td>
                    <td><span className="badge badge-success">Completed</span></td>
                    <td>1 week ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FaTools />
              </div>
              <p className="empty-text">No maintenance requests at this time.</p>
            </div>
          )}
          {maintenanceRequests.length > 0 && (
            <div className="card-actions">
              <Link to="/landlord/maintenance" className="btn btn-error btn-sm">
                View All Requests <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard; 