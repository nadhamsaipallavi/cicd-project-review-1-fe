import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaCreditCard, FaRegCreditCard, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { makePayment, getTenantPaymentMethods } from '../../services/paymentService';
import { getTenantLease } from '../../services/leaseService';
import RazorpayLeasePayment from './RazorpayLeasePayment';
import {
  Box,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Collapse,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Divider
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCardIcon from '@mui/icons-material/AddCard';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lease, setLease] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: '',
    description: 'Monthly Rent Payment',
    saveCard: true,
    leaseId: '',
  });
  
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: true,
  });

  useEffect(() => {
    fetchLeaseAndPaymentMethods();
  }, []);

  const fetchLeaseAndPaymentMethods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch tenant's lease
      const leaseResponse = await getTenantLease();
      if (leaseResponse.data) {
        setLease(leaseResponse.data);
        setFormData({
          ...formData,
          amount: leaseResponse.data.monthlyRent,
          leaseId: leaseResponse.data.id
        });
      } else {
        // Fallback to sample data
        setLease(sampleLease);
        setFormData({
          ...formData,
          amount: sampleLease.monthlyRent,
          leaseId: sampleLease.id
        });
      }
      
      // Fetch tenant's payment methods
      const methodsResponse = await getTenantPaymentMethods();
      if (methodsResponse.data && methodsResponse.data.length > 0) {
        setPaymentMethods(methodsResponse.data);
        
        // Set default payment method if available
        const defaultMethod = methodsResponse.data.find(method => method.isDefault);
        if (defaultMethod) {
          setFormData({
            ...formData,
            paymentMethodId: defaultMethod.id
          });
        }
      } else {
        // Fallback to sample data
        setPaymentMethods(samplePaymentMethods);
        setFormData({
          ...formData,
          paymentMethodId: samplePaymentMethods[0].id
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment information. Please try again.');
      
      // Fallback to sample data
      setLease(sampleLease);
      setPaymentMethods(samplePaymentMethods);
      setFormData({
        ...formData,
        amount: sampleLease.monthlyRent,
        leaseId: sampleLease.id,
        paymentMethodId: samplePaymentMethods[0].id
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCardData({
      ...newCardData,
      [name]: value,
    });
  };

  const handleCardCheckbox = (e) => {
    const { name, checked } = e.target;
    setNewCardData({
      ...newCardData,
      [name]: checked,
    });
  };

  const handleSaveCardCheckbox = (e) => {
    setFormData({
      ...formData,
      saveCard: e.target.checked,
    });
  };

  const toggleAddCard = () => {
    setShowAddCard(!showAddCard);
  };

  const validateNewCard = () => {
    // Simple validation for demo purposes
    if (!newCardData.cardNumber || newCardData.cardNumber.length < 15) {
      setError('Please enter a valid card number');
      return false;
    }
    
    if (!newCardData.cardName) {
      setError('Please enter the cardholder name');
      return false;
    }
    
    if (!newCardData.expiryMonth || !newCardData.expiryYear) {
      setError('Please enter a valid expiration date');
      return false;
    }
    
    if (!newCardData.cvv || newCardData.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.amount || !formData.leaseId) {
      setError('Please fill all required fields');
      return;
    }
    
    // If adding a new card, validate it
    if (showAddCard) {
      if (!validateNewCard()) {
        return;
      }
    } else if (!formData.paymentMethodId) {
      setError('Please select a payment method');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create payment data
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
      // If adding a new card, include the card data
      if (showAddCard) {
        paymentData.newCard = newCardData;
        paymentData.paymentMethodId = null;
      }
      
      // Submit payment
      await makePayment(paymentData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form and redirect after a delay
      setTimeout(() => {
        navigate('/tenant/payments/history', {
          state: { message: 'Payment completed successfully!' }
        });
      }, 3000);
    } catch (error) {
      console.error('Error making payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayWithRazorpay = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.amount || !formData.leaseId) {
      setError('Please fill all required fields');
      return;
    }
    
    setShowRazorpay(true);
  };

  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
        return <FaCcVisa size={24} />;
      case 'mastercard':
        return <FaCcMastercard size={24} />;
      case 'amex':
        return <FaCcAmex size={24} />;
      default:
        return <FaRegCreditCard size={24} />;
    }
  };

  // Sample data for fallback
  const sampleLease = {
    id: 1,
    propertyId: 1,
    propertyName: 'Luxury Apartment in Downtown',
    propertyAddress: '123 Main St, Downtown, New York, NY',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    monthlyRent: 1500,
    securityDeposit: 1500,
    status: 'ACTIVE'
  };
  
  const samplePaymentMethods = [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2024,
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2025,
      isDefault: false
    }
  ];

  if (isLoading) {
    return (
      <div className="payment-loading">
        <FaSpinner className="spinner" />
        <p>Loading payment information...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your payment of ₹{formData.amount} has been processed successfully.</p>
        <p>You will be redirected to the payment history page.</p>
      </div>
    );
  }

  return (
    <Container maxWidth="md" className="payment-form-container">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Make a Payment
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          
          {lease && (
            <Card variant="outlined" sx={{ mb: 3, width: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Property: {lease.propertyName || lease.propertyAddress || 'Your Rental'}
                </Typography>
                <Typography variant="body2">
                  Monthly Rent: ₹{lease.monthlyRent?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2">
                  Lease Period: {lease.startDate} to {lease.endDate}
                </Typography>
              </CardContent>
            </Card>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="amount"
                  label="Payment Amount"
                  name="amount"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  value={formData.amount}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="description"
                  label="Payment Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Method
                </Typography>
                
                <FormControl component="fieldset">
                  <RadioGroup
                    name="paymentMethod"
                    value={showAddCard ? 'new_card' : formData.paymentMethodId}
                    onChange={(e) => {
                      if (e.target.value === 'new_card') {
                        setShowAddCard(true);
                        setFormData({
                          ...formData,
                          paymentMethodId: ''
                        });
                      } else {
                        setShowAddCard(false);
                        setFormData({
                          ...formData,
                          paymentMethodId: e.target.value
                        });
                      }
                    }}
                  >
                    {paymentMethods.map(method => (
                      <FormControlLabel
                        key={method.id}
                        value={method.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span">
                              {getCardIcon(method.type)} •••• {method.last4} | Expires: {method.expiryMonth}/{method.expiryYear}
                              {method.isDefault && (
                                <Typography component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'primary.main' }}>
                                  (Default)
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        }
                        disabled={isLoading}
                      />
                    ))}
                    <FormControlLabel
                      value="new_card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AddCardIcon sx={{ mr: 1 }} />
                          <Typography>Use a new card</Typography>
                        </Box>
                      }
                      disabled={isLoading}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Collapse in={showAddCard}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      New Card Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="cardNumber"
                          label="Card Number"
                          name="cardNumber"
                          value={newCardData.cardNumber}
                          onChange={handleNewCardChange}
                          placeholder="1234 5678 9012 3456"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCardIcon />
                              </InputAdornment>
                            ),
                          }}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="cardName"
                          label="Cardholder Name"
                          name="cardName"
                          value={newCardData.cardName}
                          onChange={handleNewCardChange}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              id="expiryMonth"
                              label="Expiry Month"
                              name="expiryMonth"
                              type="number"
                              value={newCardData.expiryMonth}
                              onChange={handleNewCardChange}
                              placeholder="MM"
                              inputProps={{ min: 1, max: 12 }}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              id="expiryYear"
                              label="Expiry Year"
                              name="expiryYear"
                              type="number"
                              value={newCardData.expiryYear}
                              onChange={handleNewCardChange}
                              placeholder="YYYY"
                              inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }}
                              disabled={isSubmitting}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="cvv"
                          label="CVV/CVC"
                          name="cvv"
                          type="password"
                          value={newCardData.cvv}
                          onChange={handleNewCardChange}
                          inputProps={{ maxLength: 4 }}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={formData.saveCard}
                              onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
                              name="saveCard"
                              disabled={isSubmitting}
                            />
                          }
                          label="Save this card for future payments"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Collapse>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="primary"
                  disabled={isSubmitting}
                  icon={<CreditCardIcon />}
                >
                  {isSubmitting ? 'Processing...' : 'Pay with Card'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  type="button"
                  fullWidth
                  variant="secondary"
                  onClick={handlePayWithRazorpay}
                  disabled={isSubmitting}
                  icon={<PaymentIcon />}
                >
                  Pay with Razorpay
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
      
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
          lease={lease}
          amount={parseFloat(formData.amount)}
          description={formData.description}
        />
      )}
    </Container>
  );
};

export default PaymentForm; 