import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileDownload, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // Mock API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPayments = [
          {
            id: 'pay-123456',
            date: '2023-03-15',
            amount: 1200,
            description: 'March 2023 Rent',
            status: 'completed',
            paymentMethod: 'Credit Card (**** 1234)',
            receiptUrl: '#'
          },
          {
            id: 'pay-123457',
            date: '2023-02-15',
            amount: 1200,
            description: 'February 2023 Rent',
            status: 'completed',
            paymentMethod: 'Bank Transfer',
            receiptUrl: '#'
          },
          {
            id: 'pay-123458',
            date: '2023-01-15',
            amount: 1200,
            description: 'January 2023 Rent',
            status: 'completed',
            paymentMethod: 'Credit Card (**** 1234)',
            receiptUrl: '#'
          },
          {
            id: 'pay-123459',
            date: '2022-12-15',
            amount: 1200,
            description: 'December 2022 Rent',
            status: 'completed',
            paymentMethod: 'Credit Card (**** 1234)',
            receiptUrl: '#'
          },
          {
            id: 'pay-123460',
            date: '2022-11-18',
            amount: 1200,
            description: 'November 2022 Rent (Late Payment)',
            status: 'completed',
            paymentMethod: 'Bank Transfer',
            receiptUrl: '#'
          },
          {
            id: 'pay-123461',
            date: '2022-10-15',
            amount: 1200,
            description: 'October 2022 Rent',
            status: 'failed',
            paymentMethod: 'Credit Card (**** 5678)',
            receiptUrl: null
          }
        ];
        
        setPayments(mockPayments);
        setFilteredPayments(mockPayments);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [currentUser]);

  useEffect(() => {
    // Filter payments based on search term and status filter
    const filtered = payments.filter(payment => {
      const matchesSearch = 
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredPayments(filtered);
  }, [searchTerm, filterStatus, payments]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="status-badge completed"><FaCheckCircle /> Completed</span>;
      case 'pending':
        return <span className="status-badge pending"><FaSpinner /> Pending</span>;
      case 'failed':
        return <span className="status-badge failed"><FaTimesCircle /> Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <h1>Payment History</h1>
        <p>View all your past payments and download receipts</p>
      </div>
      
      <div className="payment-history-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="status-filter">
          <select
            value={filterStatus}
            onChange={handleStatusFilterChange}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-state">
          <FaSpinner className="spin" />
          <p>Loading payment history...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <p>No payment records found matching your filters.</p>
        </div>
      ) : (
        <div className="payment-history-table-container">
          <table className="payment-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.date)}</td>
                  <td className="payment-description">{payment.description}</td>
                  <td className="payment-amount">₹{payment.amount.toFixed(2)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    {payment.receiptUrl ? (
                      <a href={payment.receiptUrl} className="receipt-download" title="Download Receipt">
                        <FaFileDownload />
                      </a>
                    ) : (
                      <span className="no-receipt">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 