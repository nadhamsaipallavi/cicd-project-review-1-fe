import React, { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaMoneyBillWave, FaTools, FaUserCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';


const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    payments: 0,
    maintenanceRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: <FaUsers className="text-primary text-3xl" />,
      link: '/admin/users',
      color: 'bg-blue-100',
    },
    {
      title: 'Properties',
      value: stats.properties,
      icon: <FaBuilding className="text-secondary text-3xl" />,
      link: '/admin/properties',
      color: 'bg-green-100',
    },
    {
      title: 'Payments',
      value: stats.payments,
      icon: <FaMoneyBillWave className="text-accent text-3xl" />,
      link: '/admin/payments',
      color: 'bg-yellow-100',
    },
    {
      title: 'Maintenance Requests',
      value: stats.maintenanceRequests,
      icon: <FaTools className="text-error text-3xl" />,
      link: '/admin/maintenance',
      color: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link to="/admin/settings">
            <button className="btn btn-outline btn-sm">
              <FaUserCog className="mr-2" /> Settings
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <div className={`card shadow-md hover:shadow-lg transition-shadow ${card.color}`}>
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">{card.title}</h2>
                  {card.icon}
                </div>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Placeholder data - would be replaced with actual data from API */}
                  <tr>
                    <td>John Doe</td>
                    <td>Landlord</td>
                    <td>2 days ago</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>Tenant</td>
                    <td>1 week ago</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Alex Johnson</td>
                    <td>Landlord</td>
                    <td>2 weeks ago</td>
                    <td><span className="badge badge-warning">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-actions justify-end">
              <Link to="/admin/users" className="btn btn-primary btn-sm">View All</Link>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Properties</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Placeholder data - would be replaced with actual data from API */}
                  <tr>
                    <td>Maple Apartments</td>
                    <td>John Doe</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td>3 days ago</td>
                  </tr>
                  <tr>
                    <td>Sunset Villas</td>
                    <td>Jane Smith</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td>1 week ago</td>
                  </tr>
                  <tr>
                    <td>Urban Heights</td>
                    <td>Alex Johnson</td>
                    <td><span className="badge badge-warning">Pending</span></td>
                    <td>2 weeks ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-actions justify-end">
              <Link to="/admin/properties" className="btn btn-primary btn-sm">View All</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 