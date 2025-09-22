import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makePayment, createRazorpayOrder } from '../../services/paymentService';
import { useSnackbar } from 'notistack';
import Invoice from '../payment/Invoice';

const RazorpayLeasePayment = ({ open, onClose, lease, amount, description = 'Monthly Rent Payment' }) => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderCreationAttempted, setOrderCreationAttempted] = useState(false);

    useEffect(() => {
        if (open && lease && !paymentSuccess) {
            // Reset states when dialog opens
            setError(null);
            setPaymentSuccess(false);
            setOrderCreationAttempted(false);

            // Check if the required script is loaded
            if (!window.Razorpay && !document.getElementById('razorpay-script')) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.id = 'razorpay-script';
                script.async = true;
                script.onload = () => console.log('Razorpay script loaded successfully');
                script.onerror = () => {
                    console.error('Failed to load Razorpay script');
                    setError('Failed to load payment gateway. Please try again later.');
                };
                document.body.appendChild(script);
            }
        }
    }, [open, lease]);

    const initializeRazorpay = async () => {
        if (!window.Razorpay) {
            enqueueSnackbar('Razorpay SDK not loaded. Please check your internet connection.', { variant: 'error' });
            setError('Payment gateway not available. Please try again later.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setOrderCreationAttempted(true);
            console.log('Initiating lease payment for lease ID:', lease.id);
            
            // Use the provided amount or fallback to monthly rent
            const paymentAmount = amount || lease.monthlyRent;
            
            if (!paymentAmount) {
                throw new Error("Payment amount is not specified");
            }
            
            // Format the price for display in a readable format
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            }).format(paymentAmount);
            
            // Get property details for display
            const propertyTitle = lease.property?.title || 'Your Leased Property';
            const propertyAddress = lease.property?.address ? 
                `${lease.property.address}, ${lease.property.city}` : 
                'Property Address';
                
            // Create a real Razorpay order
            console.log('Creating Razorpay order with amount:', paymentAmount, 'for lease:', lease.id);
            const orderResponse = await createRazorpayOrder(paymentAmount, lease.id, description);
            console.log('Razorpay order created:', orderResponse);
            
            if (!orderResponse || !orderResponse.razorpayOrderId) {
                throw new Error("Failed to create order: " + JSON.stringify(orderResponse));
            }
            
            const propertyDetails = lease.property ? {
                propertyId: lease.property.id,
                propertyTitle: lease.property.title || 'Property',
                propertyAddress: lease.property.address ? 
                    `${lease.property.address}, ${lease.property.city || ''}` : 
                    'Property Address',
                leaseId: lease.id
            } : { leaseId: lease.id };
            
            // Ensure the amount is properly converted to paise for Razorpay
            const amountInPaise = Math.round(paymentAmount * 100);
            
            const options = {
                key: "rzp_test_pDJ1iM9OmQY99d", // Direct key from application.properties
                amount: amountInPaise, // Razorpay expects amount in paise
                currency: "INR",
                name: "Property Management System",
                description: `${description} - ${propertyTitle}`,
                image: "https://example.com/your_logo", // You can add your logo here
                order_id: orderResponse.razorpayOrderId,
                handler: async function (response) {
                    console.log('Razorpay payment successful:', response);
                    try {
                        // Process the payment on the server with better error handling
                        console.log('Sending payment data to server:', {
                            amount: paymentAmount,
                            description,
                            leaseId: lease.id,
                            razorpayData: {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                propertyDetails
                            }
                        });
                        
                        const paymentResult = await makePayment(
                            paymentAmount,
                            description,
                            lease.id,
                            null, // No saved payment method
                            {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                propertyDetails: propertyDetails
                            }
                        );
                        
                        console.log('Payment processing result:', paymentResult);
                        setPaymentData({
                            ...paymentResult,
                            propertyTitle: propertyDetails.propertyTitle,
                            propertyId: lease.property?.id,
                            amount: paymentAmount,
                            razorpayPaymentId: response.razorpay_payment_id
                        });
                        setPaymentSuccess(true);
                        enqueueSnackbar('Payment successful!', { variant: 'success' });
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        console.error('Response status:', error.response?.status);
                        console.error('Response details:', error.response?.data || 'No response data');
                        
                        if (error.response?.status === 400) {
                            setError(`Payment verification failed: ${error.response.data?.error || 'Bad request'}`);
                        } else if (error.response?.status === 403) {
                            setError('Payment authorization failed. You may not have permission to make this payment.');
                        } else if (error.response?.status === 500) {
                            setError('Server error while processing payment. Please contact support.');
                        } else {
                            setError('Payment verification failed. Please contact support with reference: ' + 
                                    response.razorpay_payment_id);
                        }
                        
                        enqueueSnackbar('Payment verification failed', { variant: 'error' });
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: lease.tenant?.firstName + ' ' + lease.tenant?.lastName,
                    email: lease.tenant?.email,
                    contact: lease.tenant?.phone
                },
                notes: {
                    propertyId: lease.property?.id,
                    propertyTitle: propertyTitle,
                    propertyAddress: propertyAddress,
                    leaseId: lease.id,
                    amount: formattedAmount,
                    paymentType: description
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
            console.error('Response details:', error.response?.data);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to initialize payment';
            setError(errorMsg);
            enqueueSnackbar('Payment initialization failed: ' + errorMsg, { variant: 'error' });
            setLoading(false);
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
        // Navigate to payment history after success
        navigate('/tenant/payments', {
            state: { message: 'Payment completed successfully!' }
        });
    };

    const retryPayment = () => {
        setError(null);
        setOrderCreationAttempted(false);
        setLoading(false);
    };

    return (
        <>
            <Dialog open={open && !paymentSuccess} onClose={() => onClose(false)}>
                <DialogTitle>Make Rent Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Property: {lease?.property?.title || 'Your Leased Property'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Address: {lease?.property?.address}, {lease?.property?.city}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Amount: ₹{(amount || lease?.monthlyRent)?.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Description: {description}
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
                                You will be redirected to Razorpay's secure payment gateway to complete the transaction.
                            </Typography>
                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                    {orderCreationAttempted && (
                                        <Box sx={{ mt: 1 }}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="error" 
                                                onClick={retryPayment}
                                            >
                                                Retry
                                            </Button>
                                        </Box>
                                    )}
                                </Alert>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={initializeRazorpay} color="primary" variant="contained" disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Dialog open={open && paymentSuccess} onClose={handleCloseSuccess}>
                <DialogTitle>Payment Successful</DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Your payment was processed successfully!
                    </Alert>
                    <Typography variant="body1" gutterBottom>
                        Your rent payment has been successfully processed.
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        A receipt has been generated for your records.
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                        You can view or print your receipt for this payment.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleViewInvoice} color="primary">
                        View Receipt
                    </Button>
                    <Button onClick={handleCloseSuccess} color="primary" variant="contained" autoFocus>
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

export default RazorpayLeasePayment; 