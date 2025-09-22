import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import theme from './theme';

// Public Pages
import HomePage from './pages/public/HomePage';
import PropertyListing from './pages/public/PropertyListing';
import PropertyDetail from './pages/public/PropertyDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

// User Pages
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Landlord Pages
import LandlordDashboard from './pages/landlord/Dashboard';
import ManageProperties from './pages/landlord/ManageProperties';
import PropertyForm from './pages/landlord/PropertyForm';
import SoldProperties from './pages/landlord/SoldProperties';
import ManageLeases from './pages/landlord/ManageLeases';
import LandlordLeaseDetails from './pages/landlord/LeaseDetails';
import ManageMaintenance from './pages/landlord/ManageMaintenance';

// Tenant Pages
import TenantDashboard from './pages/tenant/Dashboard';
import BrowseProperties from './pages/tenant/BrowseProperties';
import PurchasedProperties from './pages/tenant/PurchasedProperties';
import LeaseProperties from './pages/tenant/LeaseProperties';
import LeaseDetails from './pages/tenant/LeaseDetails';
import TenantMaintenance from './pages/tenant/TenantMaintenance';

// Property Details Page (shared)
import PropertyDetails from './pages/PropertyDetails';

// Messaging Component
import Messenger from './components/messaging/Messenger';

// Maintenance Components
import MaintenanceRequestForm from './components/maintenance/MaintenanceRequestForm';

// Payment Components
import PaymentRoutes from './routes/PaymentRoutes';
import PaymentForm from './components/payments/PaymentForm';
import MakePaymentForm from './components/payment/MakePaymentForm';
import PaymentHistory from './components/payments/PaymentHistory';
import PaymentOverview from './components/payments/PaymentOverview';

// CSS imports
import './App.css';
import './styles/currency.css';
import './styles/responsive.css';
import PurchaseRequestsPage from './pages/PurchaseRequestsPage';
import TestAuth from './components/property/TestAuth';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="properties" element={<PropertyListing />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                
                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="admin/dashboard" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<div>Users Management Page</div>} />
                  <Route path="admin/properties" element={<div>Properties Management Page</div>} />
                  <Route path="admin/reports" element={<div>Reports Page</div>} />
                  <Route path="admin/settings" element={<div>Admin Settings Page</div>} />
                </Route>
                
                {/* Landlord Routes */}
                <Route element={<ProtectedRoute allowedRoles={['LANDLORD']} />}>
                  <Route path="landlord/dashboard" element={<LandlordDashboard />} />
                  <Route path="landlord/properties" element={<ManageProperties />} />
                  <Route path="landlord/properties/add" element={<PropertyForm />} />
                  <Route path="landlord/properties/:id" element={<PropertyDetails />} />
                  <Route path="landlord/properties/edit/:id" element={<PropertyForm />} />
                  <Route path="landlord/sold-properties" element={<SoldProperties />} />
                  <Route path="landlord/leases" element={<ManageLeases />} />
                  <Route path="landlord/leases/:id" element={<LandlordLeaseDetails />} />
                  
                  {/* Landlord Payment Routes */}
                  <Route path="landlord/payments" element={<PaymentOverview />} />
                  <Route path="landlord/payments/history" element={<PaymentHistory />} />
                  <Route path="landlord/payments/:id" element={<div>Payment Details Page</div>} />
                  
                  {/* Landlord Maintenance Routes */}
                  <Route path="landlord/maintenance" element={<ManageMaintenance />} />
                  <Route path="landlord/maintenance/:id" element={<div>Maintenance Request Details Page</div>} />
                  
                  <Route path="landlord/tenants" element={<div>Tenants Management Page</div>} />
                  <Route path="landlord/settings" element={<div>Landlord Settings Page</div>} />
                </Route>
                
                {/* Tenant Routes */}
                <Route element={<ProtectedRoute allowedRoles={['TENANT']} />}>
                  <Route path="tenant/dashboard" element={<TenantDashboard />} />
                  <Route path="tenant/browse-properties" element={<BrowseProperties />} />
                  <Route path="tenant/purchased-properties" element={<PurchasedProperties />} />
                  <Route path="tenant/leased-properties" element={<LeaseProperties />} />
                  <Route path="tenant/lease" element={<LeaseDetails />} />
                  <Route path="tenant/lease/:id" element={<LeaseDetails />} />
                  
                  {/* Tenant Payment Routes */}
                  <Route path="tenant/payments" element={<PaymentOverview />} />
                  <Route path="tenant/payments/make-payment" element={<MakePaymentForm />} />
                  <Route path="tenant/payments/make-payment/:leaseId" element={<MakePaymentForm />} />
                  <Route path="tenant/payments/history" element={<PaymentHistory />} />
                  <Route path="tenant/payments/:id" element={<div>Payment Details Page</div>} />
                  
                  {/* Tenant Maintenance Routes */}
                  <Route path="tenant/maintenance" element={<TenantMaintenance />} />
                  <Route path="tenant/maintenance/new" element={<MaintenanceRequestForm />} />
                  <Route path="tenant/maintenance/:id" element={<div>Maintenance Request Details Page</div>} />
                  
                  <Route path="tenant/application/new" element={<div>New Rental Application Page</div>} />
                  <Route path="tenant/settings" element={<div>Tenant Settings Page</div>} />
                </Route>
                
                {/* Messaging - available to all authenticated users */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'LANDLORD', 'TENANT']} />}>
                  <Route path="messages" element={<Messenger />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<div>Account Settings Page</div>} />
                </Route>
                
                {/* Purchase Requests Route */}
                <Route
                  path="/purchase-requests"
                  element={
                    <ProtectedRoute allowedRoles={['TENANT', 'LANDLORD']}>
                      <PurchaseRequestsPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Test Auth Route */}
                <Route path="/test-auth" element={<TestAuth />} />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
