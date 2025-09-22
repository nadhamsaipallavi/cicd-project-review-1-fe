import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PaymentOverview from '../components/payments/PaymentOverview';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentHistory from '../components/payments/PaymentHistory';

const PaymentRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="make-payment" replace />} />
      <Route path="/*" element={<PaymentOverview />} />
    </Routes>
  );
};

export default PaymentRoutes; 