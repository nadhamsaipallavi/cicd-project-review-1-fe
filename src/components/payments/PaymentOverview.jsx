import React, { useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { FaCreditCard, FaHistory, FaRupeeSign, FaChartLine } from 'react-icons/fa';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import './PaymentOverview.css';

const PaymentOverview = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  function getActiveTab(pathname) {
    if (pathname.includes('/make-payment')) return 'make-payment';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/upcoming')) return 'upcoming';
    if (pathname.includes('/analytics')) return 'analytics';
    return 'make-payment';
  }

  // Mock data for upcoming payments
  const upcomingPayments = [
    {
      id: 'up-1',
      description: 'April 2023 Rent',
      dueDate: '2023-04-01',
      amount: 1200
    },
    {
      id: 'up-2',
      description: 'Water Bill',
      dueDate: '2023-04-10',
      amount: 58.75
    },
    {
      id: 'up-3',
      description: 'Internet Bill',
      dueDate: '2023-04-15',
      amount: 89.99
    }
  ];

  // Mock data for payment analytics
  const paymentAnalytics = {
    totalPaid: 7200,
    averageMonthly: 1200,
    paymentsMade: 6,
    onTimeRate: 83.3
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="payment-overview-container">
      <div className="payment-nav">
        <Link 
          to="/tenant/payments/make-payment" 
          className={`payment-nav-item ${activeTab === 'make-payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('make-payment')}
        >
          <FaCreditCard />
          <span>Make Payment</span>
        </Link>
        <Link 
          to="/tenant/payments/history" 
          className={`payment-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory />
          <span>Payment History</span>
        </Link>
        <Link 
          to="/tenant/payments/upcoming" 
          className={`payment-nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <FaRupeeSign />
          <span>Upcoming Payments</span>
        </Link>
        <Link 
          to="/tenant/payments/analytics" 
          className={`payment-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine />
          <span>Payment Analytics</span>
        </Link>
      </div>

      <div className="payment-content">
        <Routes>
          <Route path="make-payment" element={<PaymentForm />} />
          <Route path="history" element={<PaymentHistory />} />
          <Route path="upcoming" element={
            <div className="upcoming-payments-container">
              <div className="upcoming-header">
                <h1>Upcoming Payments</h1>
                <p>Manage your upcoming payments and due dates</p>
              </div>

              <div className="upcoming-list">
                {upcomingPayments.map(payment => {
                  const daysRemaining = getDaysRemaining(payment.dueDate);
                  const isPastDue = daysRemaining < 0;
                  const isCloseToDue = daysRemaining >= 0 && daysRemaining <= 5;
                  
                  return (
                    <div 
                      key={payment.id} 
                      className={`upcoming-payment-card ${isPastDue ? 'past-due' : ''} ${isCloseToDue ? 'close-to-due' : ''}`}
                    >
                      <div className="payment-info">
                        <h3>{payment.description}</h3>
                        <p>Due: {formatDate(payment.dueDate)}</p>
                        <p className="amount">₹{payment.amount.toFixed(2)}</p>
                      </div>
                      <div className="payment-actions">
                        {isPastDue ? (
                          <div className="due-status past">Past Due</div>
                        ) : (
                          <div className="due-status">
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                          </div>
                        )}
                        <Link to="/tenant/payments/make-payment" className="pay-now-btn">
                          Pay Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          } />
          <Route path="analytics" element={
            <div className="analytics-container">
              <div className="analytics-header">
                <h1>Payment Analytics</h1>
                <p>View insights about your payment history</p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Total Paid</h3>
                  <div className="analytics-value">₹{paymentAnalytics.totalPaid.toFixed(2)}</div>
                </div>
                <div className="analytics-card">
                  <h3>Average Monthly</h3>
                  <div className="analytics-value">₹{paymentAnalytics.averageMonthly.toFixed(2)}</div>
                </div>
                <div className="analytics-card">
                  <h3>Payments Made</h3>
                  <div className="analytics-value">{paymentAnalytics.paymentsMade}</div>
                </div>
                <div className="analytics-card">
                  <h3>On-Time Rate</h3>
                  <div className="analytics-value">{paymentAnalytics.onTimeRate}%</div>
                </div>
              </div>

              <div className="analytics-note">
                <p>
                  Note: These analytics are based on your payment history over the last 6 months.
                  For more detailed information, please check the Payment History tab.
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default PaymentOverview; 