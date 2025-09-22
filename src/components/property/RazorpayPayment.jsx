import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Box } from '@mui/material';
import { propertyPurchaseService } from '../../services/propertyPurchaseService';
import { useSnackbar } from 'notistack';
import Invoice from '../payment/Invoice';

const RazorpayPayment = ({ open, onClose, request }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        if (open && request && !paymentSuccess) {
            initializeRazorpay();
        }
    }, [open, request]);

    const initializeRazorpay = async () => {
        if (!window.Razorpay) {
            enqueueSnackbar('Razorpay SDK not loaded. Please check your internet connection.', { variant: 'error' });
            onClose(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('Initiating payment for request ID:', request.id);
            const response = await propertyPurchaseService.initiatePayment(request.id);
            console.log('Payment initiation response:', response);
            
            // Format the price for display in a readable format
            const formattedPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            }).format(response.purchasePrice);
            
            // Property details to be included in the payment
            const propertyDetails = {
                propertyId: request.propertyId,
                propertyTitle: request.propertyTitle,
                propertyPrice: response.purchasePrice,
                requestId: request.id
            };
            
            // Ensure the amount is properly converted to paise for Razorpay
            const amountInPaise = Math.round(response.purchasePrice * 100);
            
            const options = {
                key: "rzp_test_pDJ1iM9OmQY99d", // Direct key from application.properties
                amount: amountInPaise, // Razorpay expects amount in paise
                currency: "INR",
                name: "Property Management System",
                description: `Purchase of ${request.propertyTitle} - ${formattedPrice}`,
                image: "https://example.com/your_logo", // You can add your logo here
                order_id: response.razorpayOrderId,
                handler: async function (response) {
                    console.log('Razorpay payment successful:', response);
                    try {
                        const paymentResult = await propertyPurchaseService.processPayment(
                            request.id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            propertyDetails // Include property details
                        );
                        console.log('Payment processing result:', paymentResult);
                        setPaymentData({
                            ...paymentResult,
                            propertyTitle: request.propertyTitle,
                            propertyId: request.propertyId,
                            tenantName: request.tenantName,
                            tenantEmail: request.tenantEmail,
                            amount: response.purchasePrice
                        });
                        setPaymentSuccess(true);
                        enqueueSnackbar('Payment successful!', { variant: 'success' });
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setError('Payment verification failed. Please contact support.');
                        enqueueSnackbar('Payment verification failed', { variant: 'error' });
                        onClose(false);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: request.tenantName,
                    email: request.tenantEmail,
                    contact: request.tenantPhone
                },
                notes: {
                    propertyId: request.propertyId,
                    propertyTitle: request.propertyTitle,
                    propertyPrice: formattedPrice,
                    requestId: request.id
                },
                theme: {
                    color: "#1976d2"
                },
                modal: {
                    ondismiss: function() {
                        console.log('Razorpay modal dismissed');
                        setLoading(false);
                    }
                }
            };

            console.log('Razorpay options:', options);
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Failed to initialize payment:', error);
            setError(error.response?.data?.message || 'Failed to initialize payment');
            enqueueSnackbar('Failed to initialize payment', { variant: 'error' });
            setLoading(false);
            onClose(false);
        }
    };
    
    const handleViewInvoice = () => {
        setShowInvoice(true);
    };
    
    const handleCloseInvoice = () => {
        setShowInvoice(false);
    };
    
    const handleCloseSuccess = () => {
        onClose(true);
    };

    return (
        <>
            <Dialog open={open && !paymentSuccess} onClose={() => onClose(false)}>
                <DialogTitle>Complete Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Property: {request?.propertyTitle}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Amount: ₹{request?.purchasePrice?.toLocaleString('en-IN')}
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="body2" color="textSecondary">
                                You will be redirected to Razorpay's secure payment gateway to complete the transaction.
                            </Typography>
                            {error && (
                                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                                    Error: {error}
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={initializeRazorpay} color="primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Dialog open={open && paymentSuccess} onClose={handleCloseSuccess}>
                <DialogTitle>Payment Successful</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Congratulations! You have successfully purchased {request?.propertyTitle}.
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        The property has been added to your purchased properties list.
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                        You can view or print your invoice for this purchase.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleViewInvoice} color="primary">
                        View Invoice
                    </Button>
                    <Button onClick={handleCloseSuccess} color="primary" autoFocus>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Custom invoice dialog */}
            <Invoice 
                open={showInvoice} 
                onClose={handleCloseInvoice} 
                paymentData={paymentData} 
            />
        </>
    );
};

export default RazorpayPayment; 