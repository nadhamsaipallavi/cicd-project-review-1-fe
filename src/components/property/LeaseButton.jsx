import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import leaseService from '../../services/leaseService';
import { format, addMonths } from 'date-fns';

const LeaseButton = ({ propertyId, propertyTitle, monthlyRent }) => {
    // Handle case where monthlyRent is null/undefined
    const rent = monthlyRent || 0;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [leaseData, setLeaseData] = useState({
        startDate: new Date(),
        endDate: addMonths(new Date(), 12), // Default 12-month lease
        securityDeposit: rent * 2, // Standard 2-month security deposit
        monthlyRent: rent // Store the monthly rent even if it's 0 
    });
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        // Check user authentication and role on component mount
        console.log('LeaseButton mounted for property:', propertyId);
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
            enqueueSnackbar('Please log in to lease properties', { variant: 'warning' });
            navigate('/login');
            return;
        }
        
        if (storedRole !== 'TENANT') {
            enqueueSnackbar('Only tenants can lease properties', { variant: 'warning' });
            return;
        }
        
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLeaseData({
            ...leaseData,
            [name]: value
        });
    };

    const handleDateChange = (name, date) => {
        setLeaseData({
            ...leaseData,
            [name]: date
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            console.log(`Creating lease request for property ID: ${propertyId}`);
            
            // Verify token before making request
            const token = localStorage.getItem('token');
            console.log('Using token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token!');
            
            const leaseRequest = {
                propertyId: propertyId,
                startDate: format(leaseData.startDate, 'yyyy-MM-dd'),
                endDate: format(leaseData.endDate, 'yyyy-MM-dd'),
                monthlyRent: leaseData.monthlyRent || null, // Handle case when monthly rent might be edited to 0
                securityDeposit: leaseData.securityDeposit
            };
            
            console.log('Lease request payload:', leaseRequest);
            
            const response = await leaseService.createTenantLease(leaseRequest);
            console.log('Lease request response:', response);
            
            enqueueSnackbar('Lease request created successfully!', { variant: 'success' });
            handleClose();
            
            // Navigate to tenant leases page
            navigate('/tenant/leased-properties');
        } catch (error) {
            console.error('Error creating lease request:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                'Failed to create lease request. Please try again.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
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
                color="secondary"
                onClick={handleClickOpen}
                fullWidth
            >
                Lease Property
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Lease Property Request</DialogTitle>
                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        {propertyTitle}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Monthly Rent: {rent > 0 ? formatCurrency(rent) : 'Not specified'}
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Lease Start Date"
                                value={leaseData.startDate}
                                onChange={(date) => handleDateChange('startDate', date)}
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                            />
                            
                            <DatePicker
                                label="Lease End Date"
                                value={leaseData.endDate}
                                onChange={(date) => handleDateChange('endDate', date)}
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                            />
                        </LocalizationProvider>
                        
                        <TextField
                            label="Monthly Rent"
                            type="number"
                            name="monthlyRent"
                            value={leaseData.monthlyRent}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                startAdornment: <Typography variant="body2">₹</Typography>
                            }}
                        />
                        
                        <TextField
                            label="Security Deposit"
                            type="number"
                            name="securityDeposit"
                            value={leaseData.securityDeposit}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                startAdornment: <Typography variant="body2">₹</Typography>
                            }}
                        />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        By submitting this request, you are expressing interest in leasing this property.
                        The landlord will review your application and may contact you for additional information.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LeaseButton; 