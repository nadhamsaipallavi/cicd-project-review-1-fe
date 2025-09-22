import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { propertyPurchaseService } from '../../services/propertyPurchaseService';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import RazorpayPayment from './RazorpayPayment';
import { useAuth } from '../../contexts/AuthContext';

const BuyPropertyButton = ({ propertyId, propertyTitle, price }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [purchaseRequest, setPurchaseRequest] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        // Check user authentication and role on component mount
        console.log('BuyPropertyButton mounted for property:', propertyId);
        console.log('Current user:', currentUser);
        console.log('User role:', userRole);
        
        // Check localStorage directly as a backup
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('userRole');
        
        console.log('Token in localStorage:', storedToken ? 'Present' : 'Missing');
        console.log('User in localStorage:', storedUser ? 'Present' : 'Missing');
        console.log('Role in localStorage:', storedRole);
    }, [propertyId, currentUser, userRole]);

    const handleClickOpen = () => {
        // Verify user is logged in and is a tenant before showing dialog
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const storedRole = localStorage.getItem('userRole');
        
        if (!storedUser.id) {
            enqueueSnackbar('Please log in to purchase properties', { variant: 'warning' });
            navigate('/login');
            return;
        }
        
        if (storedRole !== 'TENANT') {
            enqueueSnackbar('Only tenants can purchase properties', { variant: 'warning' });
            return;
        }
        
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            console.log(`Creating purchase request for property ID: ${propertyId}`);
            
            // Verify token before making request
            const token = localStorage.getItem('token');
            console.log('Using token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token!');
            
            const response = await propertyPurchaseService.createPurchaseRequest(propertyId);
            console.log('Purchase request response:', response);
            setPurchaseRequest(response);
            enqueueSnackbar('Purchase request created successfully!', { variant: 'success' });
            
            // Always show payment dialog as requests are auto-approved now
            setShowPayment(true);
            handleClose();
        } catch (error) {
            console.error('Error creating purchase request:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                'Failed to create purchase request. Please check if you are logged in as a tenant.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
            setLoading(false);
            handleClose();
        }
    };
    
    const handlePaymentComplete = (success) => {
        setShowPayment(false);
        if (success) {
            enqueueSnackbar('Payment successful! Property purchased.', { variant: 'success' });
            navigate('/tenant/purchased-properties');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
                fullWidth
            >
                Buy Property
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirm Property Purchase</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to purchase {propertyTitle}?
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Purchase Price: {formatCurrency(price)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Clicking "Confirm" will initiate the payment process through Razorpay.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {purchaseRequest && (
                <RazorpayPayment
                    open={showPayment}
                    onClose={handlePaymentComplete}
                    request={purchaseRequest}
                />
            )}
        </>
    );
};

export default BuyPropertyButton; 