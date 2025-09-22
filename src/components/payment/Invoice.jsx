import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Divider, Grid, Paper
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

const Invoice = ({ open, onClose, paymentData }) => {
  if (!paymentData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Payment Receipt
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Property Management System</Typography>
              <Typography variant="body2" color="text.secondary">Payment Receipt</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" gutterBottom>RECEIPT</Typography>
              <Typography variant="body2" color="text.secondary">
                #{paymentData.razorpayPaymentId || paymentData.id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Customer & Payment Info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Customer</Typography>
              <Typography variant="body2">{paymentData.tenantName}</Typography>
              {paymentData.tenantEmail && (
                <Typography variant="body2">{paymentData.tenantEmail}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="subtitle2" gutterBottom>Payment Details</Typography>
              <Typography variant="body2">
                Payment Date: {formatDate(paymentData.paymentDate)}
              </Typography>
              <Typography variant="body2">
                Payment Method: Razorpay
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Property Details */}
          <Typography variant="subtitle2" gutterBottom>Property Details</Typography>
          <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1, mb: 3 }}>
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom>
                  Property Title
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom>
                  {paymentData.propertyTitle}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Property ID
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {paymentData.propertyId}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Payment Breakdown */}
          <Typography variant="subtitle2" gutterBottom>Payment Breakdown</Typography>
          <Box sx={{ mb: 4 }}>
            <Grid container sx={{ py: 1, borderBottom: '1px solid #eee' }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Description</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">Amount</Typography>
              </Grid>
            </Grid>
            
            <Grid container sx={{ py: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2">Property Purchase</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">{formatCurrency(paymentData.purchasePrice)}</Typography>
              </Grid>
            </Grid>
            
            <Grid container sx={{ py: 1, borderTop: '1px solid #eee', fontWeight: 'bold' }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Total</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">{formatCurrency(paymentData.purchasePrice)}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for your purchase.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is an automatically generated receipt.
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => window.print()}>
          Print Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Invoice; 