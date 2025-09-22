import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent,
  CardActionArea,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  CreditScore as CreditScoreIcon
} from '@mui/icons-material';
import paymentService from '../../services/paymentService';
import leaseService from '../../services/leaseService';
import authService from '../../services/authService';
import RazorpayLeasePayment from '../payments/RazorpayLeasePayment';

const MakePaymentForm = () => {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  
  const [paymentData, setPaymentData] = useState({
    leaseId: leaseId || '',
    amount: 0,
    paymentMethod: 'EXISTING_CARD',
    paymentMethodId: '',
    description: 'Monthly Rent Payment',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardholderName: '',
    saveCard: true
  });
  
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Only tenants can make payments
    if (user && user.role === 'TENANT') {
      fetchPaymentData();
    } else {
      setInitialLoading(false);
      setError('Only tenants can make payments');
    }
  }, [leaseId]);
  
  const fetchPaymentData = async () => {
    setInitialLoading(true);
    
    try {
      // Fetch lease details if leaseId is provided
      if (leaseId) {
        const leaseResponse = await leaseService.getLeaseById(leaseId);
        const lease = leaseResponse.data;
        setLeaseDetails(lease);
        
        // Set default payment amount to rent amount
        setPaymentData(prev => ({
          ...prev,
          amount: lease.rentAmount || 0
        }));
      } else {
        // If no leaseId, fetch active lease for tenant
        const activeLeasesResponse = await leaseService.getTenantLeases();
        const activeLeases = activeLeasesResponse.data;
        
        if (activeLeases && activeLeases.length > 0) {
          const activeLease = activeLeases[0]; // Use the first active lease
          setLeaseDetails(activeLease);
          setPaymentData(prev => ({
            ...prev,
            leaseId: activeLease.id,
            amount: activeLease.rentAmount || 0
          }));
        } else {
          setError('No active leases found. You cannot make a payment at this time.');
        }
      }
      
      // Fetch payment methods
      const paymentMethodsResponse = await paymentService.getTenantPaymentMethods();
      if (paymentMethodsResponse.data && paymentMethodsResponse.data.length > 0) {
        setPaymentMethods(paymentMethodsResponse.data);
        
        // Select first payment method as default
        const defaultMethod = paymentMethodsResponse.data.find(method => method.isDefault) || 
                              paymentMethodsResponse.data[0];
        
        setPaymentData(prev => ({
          ...prev,
          paymentMethodId: defaultMethod.id
        }));
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment information. Please try again.');
      
      // Sample data for development
      setLeaseDetails({
        id: leaseId || '123',
        propertyName: 'Luxury Apartment',
        propertyAddress: '123 Main St, New York, NY 10001',
        rentAmount: 1500,
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        status: 'ACTIVE'
      });
      
      setPaymentMethods([
        {
          id: '1',
          cardType: 'VISA',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        },
        {
          id: '2',
          cardType: 'MASTERCARD',
          last4: '8888',
          expiryMonth: 10,
          expiryYear: 2024,
          isDefault: false
        }
      ]);
      
      setPaymentData(prev => ({
        ...prev,
        leaseId: leaseId || '123',
        amount: 1500,
        paymentMethodId: '1'
      }));
    } finally {
      setInitialLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };
  
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits and limit to 19 chars (16 digits + 3 spaces)
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setPaymentData({ ...paymentData, [name]: formattedValue });
    } else if (name === 'cardExpiry') {
      // Format expiry date as MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formattedValue = cleaned;
      
      if (cleaned.length > 2) {
        formattedValue = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      }
      
      setPaymentData({ ...paymentData, [name]: formattedValue });
    } else if (name === 'cardCvc') {
      // Allow only numbers and max 4 digits for CVC
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      setPaymentData({ ...paymentData, [name]: formattedValue });
    } else {
      setPaymentData({ ...paymentData, [name]: value });
    }
  };
  
  const validateForm = () => {
    if (!paymentData.leaseId) {
      setError('Lease selection is required');
      return false;
    }
    
    if (paymentData.amount <= 0) {
      setError('Payment amount must be greater than 0');
      return false;
    }
    
    if (paymentData.paymentMethod === 'EXISTING_CARD' && !paymentData.paymentMethodId) {
      setError('Please select a payment method');
      return false;
    }
    
    if (paymentData.paymentMethod === 'NEW_CARD') {
      // Validate card details
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number');
        return false;
      }
      
      if (!paymentData.cardExpiry || paymentData.cardExpiry.length < 5) {
        setError('Please enter a valid expiration date (MM/YY)');
        return false;
      }
      
      if (!paymentData.cardCvc || paymentData.cardCvc.length < 3) {
        setError('Please enter a valid CVC code');
        return false;
      }
      
      if (!paymentData.cardholderName) {
        setError('Please enter the cardholder name');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    // Open confirmation dialog
    setConfirmDialogOpen(true);
  };
  
  const processPayment = async () => {
    setLoading(true);
    setConfirmDialogOpen(false);
    
    try {
      let response;
      
      if (paymentData.paymentMethod === 'EXISTING_CARD') {
        // Make payment with existing card
        response = await paymentService.makePayment({
          leaseId: paymentData.leaseId,
          amount: paymentData.amount,
          paymentMethodId: paymentData.paymentMethodId,
          description: paymentData.description
        });
      } else {
        // Make payment with new card
        response = await paymentService.makePaymentWithNewCard({
          leaseId: paymentData.leaseId,
          amount: paymentData.amount,
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
          cardExpiry: paymentData.cardExpiry,
          cardCvc: paymentData.cardCvc,
          cardholderName: paymentData.cardholderName,
          saveCard: paymentData.saveCard,
          description: paymentData.description
        });
      }
      
      setSuccess('Payment processed successfully! Payment ID: ' + (response.data.id || 'N/A'));
      
      // Navigate to payment receipt or history after a delay
      setTimeout(() => {
        if (response.data && response.data.id) {
          navigate(`/payments/${response.data.id}`);
        } else {
          navigate('/payments');
        }
      }, 2000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please check your payment details and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
  };
  
  const handlePayWithRazorpay = () => {
    if (!validateForm()) {
      return;
    }
    
    // Close the confirmation dialog if it's open
    setConfirmDialogOpen(false);
    
    // Use the RazorpayLeasePayment component to handle Razorpay integration
    setShowRazorpay(true);
  };
  
  // Return empty or error state if not a tenant
  if (currentUser && currentUser.role !== 'TENANT') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Only tenants can make payments.
        </Alert>
      </Container>
    );
  }
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaymentIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5">
            Make a Payment
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {leaseDetails && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {leaseDetails.propertyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {leaseDetails.propertyAddress}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Monthly Rent: ₹{leaseDetails.rentAmount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lease Period: {new Date(leaseDetails.startDate).toLocaleDateString()} - {new Date(leaseDetails.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Payment Amount */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Payment Details
              </Typography>
            </Grid>
            
            {!leaseId && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="lease-select-label">Select Lease</InputLabel>
                  <Select
                    labelId="lease-select-label"
                    id="leaseId"
                    name="leaseId"
                    value={paymentData.leaseId}
                    onChange={handleChange}
                    label="Select Lease"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a lease</em>
                    </MenuItem>
                    {/* This would typically be populated with multiple leases if the tenant has more than one */}
                    <MenuItem value={leaseDetails?.id}>
                      {leaseDetails?.propertyName} - {leaseDetails?.propertyAddress}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="amount"
                name="amount"
                label="Payment Amount"
                type="number"
                value={paymentData.amount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Payment Description"
                value={paymentData.description}
                onChange={handleChange}
                placeholder="e.g., Rent for July 2023"
              />
            </Grid>
            
            {/* Payment Method Selection */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Payment Method
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <RadioGroup
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handleChange}
                >
                  <FormControlLabel 
                    value="EXISTING_CARD" 
                    control={<Radio />} 
                    label="Pay with saved card" 
                    disabled={paymentMethods.length === 0}
                  />
                  <FormControlLabel 
                    value="NEW_CARD" 
                    control={<Radio />} 
                    label="Pay with new card" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {/* Existing Payment Method Selection */}
            {paymentData.paymentMethod === 'EXISTING_CARD' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select a card:
                </Typography>
                <Grid container spacing={2}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={6} key={method.id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          borderColor: paymentData.paymentMethodId === method.id ? 'primary.main' : 'grey.300',
                          boxShadow: paymentData.paymentMethodId === method.id ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none'
                        }}
                      >
                        <CardActionArea 
                          onClick={() => setPaymentData({ ...paymentData, paymentMethodId: method.id })}
                          sx={{ p: 2 }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CreditCardIcon sx={{ mr: 1 }} />
                                <Typography variant="subtitle1">
                                  {method.cardType} •••• {method.last4}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </Typography>
                            </Box>
                            {paymentData.paymentMethodId === method.id && (
                              <CheckCircleIcon color="primary" />
                            )}
                          </Box>
                          {method.isDefault && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                              Default Payment Method
                            </Typography>
                          )}
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
            
            {/* New Card Information */}
            {paymentData.paymentMethod === 'NEW_CARD' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="cardholderName"
                    name="cardholderName"
                    label="Cardholder Name"
                    value={paymentData.cardholderName}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="cardNumber"
                    name="cardNumber"
                    label="Card Number"
                    value={paymentData.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="cardExpiry"
                    name="cardExpiry"
                    label="Expiration Date (MM/YY)"
                    value={paymentData.cardExpiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="cardCvc"
                    name="cardCvc"
                    label="CVC"
                    value={paymentData.cardCvc}
                    onChange={handleCardChange}
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={paymentData.saveCard}
                        onChange={(e) => setPaymentData({ ...paymentData, saveCard: e.target.checked })}
                        name="saveCard"
                      />
                    }
                    label="Save this card for future payments"
                  />
                </Grid>
              </>
            )}
            
            {/* Submit Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<CreditScoreIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Make Payment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Payment Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to make this payment?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Property:</strong> {leaseDetails?.propertyName}
            </Typography>
            <Typography variant="body2">
              <strong>Amount:</strong> ₹{paymentData.amount}
            </Typography>
            <Typography variant="body2">
              <strong>Payment Method:</strong> {paymentData.paymentMethod === 'EXISTING_CARD' 
                ? `Saved Card (ending in ${paymentMethods.find(m => m.id === paymentData.paymentMethodId)?.last4 || '****'})` 
                : 'New Card'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={processPayment} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Pay with Card'}
          </Button>
          <Button
            onClick={handlePayWithRazorpay}
            color="secondary"
            variant="contained"
            disabled={loading}
          >
            Pay with Razorpay
          </Button>
        </DialogActions>
      </Dialog>
      
      {showRazorpay && (
        <RazorpayLeasePayment
          open={showRazorpay}
          onClose={(success) => {
            setShowRazorpay(false);
            if (success) {
              // Redirect to payment history if payment was successful
              navigate('/tenant/payments/history', {
                state: { message: 'Payment completed successfully!' }
              });
            }
          }}
          lease={leaseDetails}
          amount={parseFloat(paymentData.amount)}
          description={paymentData.description}
        />
      )}
    </Container>
  );
};

export default MakePaymentForm; 