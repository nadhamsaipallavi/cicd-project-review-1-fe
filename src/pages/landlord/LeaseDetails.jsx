import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Paper, Divider, Button, Box, 
    CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { 
    ArrowBack, Home as HomeIcon, Person as PersonIcon, Receipt as ReceiptIcon,
    CalendarToday as CalendarIcon, MonetizationOn as MoneyIcon,
    DescriptionOutlined as DocumentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import leaseService from '../../services/leaseService';
import paymentService from '../../services/paymentService';

const LeaseDetails = () => {
    const [lease, setLease] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [error, setError] = useState(null);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [terminationReason, setTerminationReason] = useState('');
    const [showTerminationDialog, setShowTerminationDialog] = useState(false);
    const [terminationDate, setTerminationDate] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchLeaseDetails();
    }, [id]);

    useEffect(() => {
        if (lease && lease.id) {
            fetchPaymentHistory();
        }
    }, [lease]);

    const fetchLeaseDetails = async () => {
        try {
            setLoading(true);
            const data = await leaseService.getLandlordLeaseById(id);
            console.log('Lease details:', data);
            setLease(data);
            setNewStatus(data.status); // Initialize with current status
        } catch (error) {
            console.error('Error fetching lease details:', error);
            setError('Failed to load lease details. Please try again.');
            enqueueSnackbar('Failed to load lease details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            setLoadingPayments(true);
            const propertyId = lease.property?.id;
            if (!propertyId) {
                console.error('Property ID not found in lease data');
                return;
            }
            
            const data = await paymentService.getPaymentsByProperty(propertyId);
            
            // Filter payments for this specific lease
            const leasePayments = data.content.filter(payment => 
                payment.lease && payment.lease.id === lease.id
            );
            
            setPayments(leasePayments);
        } catch (error) {
            console.error('Error fetching payment history:', error);
            enqueueSnackbar('Failed to load payment history', { variant: 'error' });
        } finally {
            setLoadingPayments(false);
        }
    };

    const handleBackToLeases = () => {
        navigate('/landlord/leases');
    };
    
    const handleOpenStatusDialog = () => {
        setOpenStatusDialog(true);
    };
    
    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
    };
    
    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };
    
    const handleUpdateStatus = async () => {
        try {
            await leaseService.updateLeaseStatus(lease.id, newStatus);
            enqueueSnackbar('Lease status updated successfully', { variant: 'success' });
            handleCloseStatusDialog();
            fetchLeaseDetails(); // Refresh lease data
        } catch (error) {
            console.error('Error updating lease status:', error);
            enqueueSnackbar('Failed to update lease status', { variant: 'error' });
        }
    };
    
    const handleOpenTerminationDialog = () => {
        setTerminationDate(format(new Date(), 'yyyy-MM-dd'));
        setTerminationReason('');
        setShowTerminationDialog(true);
    };
    
    const handleCloseTerminationDialog = () => {
        setShowTerminationDialog(false);
    };
    
    const handleTerminateLease = async () => {
        try {
            await leaseService.terminateLease(lease.id, terminationDate, terminationReason);
            enqueueSnackbar('Lease terminated successfully', { variant: 'success' });
            handleCloseTerminationDialog();
            fetchLeaseDetails(); // Refresh lease data
        } catch (error) {
            console.error('Error terminating lease:', error);
            enqueueSnackbar('Failed to terminate lease', { variant: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Not specified';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };
    
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'PENDING':
            case 'PENDING_APPROVAL':
            case 'PENDING_SIGNATURE':
                return 'warning';
            case 'TERMINATED':
            case 'EXPIRED':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={handleBackToLeases}
                    sx={{ mt: 2 }}
                >
                    Back to Leases
                </Button>
            </Container>
        );
    }

    if (!lease) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="info">
                    No lease information found. If you believe this is an error, please try again.
                </Alert>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={handleBackToLeases}
                    sx={{ mt: 2 }}
                >
                    Back to Leases
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={handleBackToLeases}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4" component="h1">
                    <ReceiptIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Lease Details
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Property Information */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            <HomeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Property Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {lease.property ? (
                            <>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {lease.property.title || 'Property Title'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {lease.property.address || ''}{lease.property.city ? `, ${lease.property.city}` : ''}{lease.property.state ? `, ${lease.property.state}` : ''}
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Property Type
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.property.propertyType || 'Not specified'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Bedrooms
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.property.numberOfBedrooms || 'Not specified'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Bathrooms
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.property.numberOfBathrooms || 'Not specified'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Area
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.property.totalArea ? `${lease.property.totalArea} sq ft` : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Property information not available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Tenant Information */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Tenant Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {lease.tenant ? (
                            <>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {`${lease.tenant.firstName} ${lease.tenant.lastName}`}
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.tenant.email || 'Not provided'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.tenant.phone || 'Not provided'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Tenant information not available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Lease Information */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                <ReceiptIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Lease Information
                            </Typography>
                            <Chip 
                                label={lease.status} 
                                color={getStatusChipColor(lease.status)} 
                                size="medium" 
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Start Date
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(lease.startDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            End Date
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(lease.endDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Monthly Rent
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {formatCurrency(lease.monthlyRent)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Security Deposit
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatCurrency(lease.securityDeposit)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Payment Due Day
                                        </Typography>
                                        <Typography variant="body2">
                                            {lease.paymentDueDay ? `${lease.paymentDueDay}th of each month` : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={handleOpenStatusDialog}
                                        startIcon={<ReceiptIcon />}
                                    >
                                        Update Lease Status
                                    </Button>
                                    
                                    {lease.status === 'ACTIVE' && (
                                        <Button 
                                            variant="outlined" 
                                            color="error"
                                            onClick={handleOpenTerminationDialog}
                                        >
                                            Terminate Lease
                                        </Button>
                                    )}
                                    
                                    <Button 
                                        variant="outlined"
                                        startIcon={<DocumentIcon />}
                                    >
                                        View Lease Documents
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                        
                        {lease.additionalTerms && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                    Additional Terms
                                </Typography>
                                <Typography variant="body2">
                                    {lease.additionalTerms}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Payment History */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <MoneyIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Payment History
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {loadingPayments ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : payments.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell>{payment.description}</TableCell>
                                                <TableCell>{payment.paymentMethod}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={payment.status} 
                                                        color={payment.status === 'COMPLETED' ? 'success' : 
                                                              payment.status === 'PENDING' ? 'warning' : 'default'} 
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                No payment records found for this lease.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Status Update Dialog */}
            <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
                <DialogTitle>Update Lease Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: 300, pt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={newStatus}
                            onChange={handleStatusChange}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                            <option value="PENDING_SIGNATURE">Pending Signature</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="TERMINATED">Terminated</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} variant="contained" color="primary">
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Termination Dialog */}
            <Dialog open={showTerminationDialog} onClose={handleCloseTerminationDialog}>
                <DialogTitle>Terminate Lease</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: 300, pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Termination Date"
                            type="date"
                            value={terminationDate}
                            onChange={(e) => setTerminationDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Reason for Termination"
                            multiline
                            rows={4}
                            value={terminationReason}
                            onChange={(e) => setTerminationReason(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTerminationDialog}>Cancel</Button>
                    <Button onClick={handleTerminateLease} variant="contained" color="error">
                        Terminate Lease
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LeaseDetails; 