import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Card, CardContent, Paper, Divider, Button, Box, 
    CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, useTheme, alpha, styled
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import leaseService from '../../services/leaseService';
import paymentService from '../../services/paymentService';
import axiosInstance from '../../services/axiosConfig';
import RazorpayLeasePayment from '../../components/payments/RazorpayLeasePayment';
import { 
    Home as HomeIcon, 
    Receipt as ReceiptIcon,
    MonetizationOn as MoneyIcon,
    CalendarToday as CalendarIcon,
    DescriptionOutlined as DocumentIcon,
    ArrowBack as ArrowBackIcon,
    Build as BuildIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Styled components for enhanced visual appeal
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    overflow: 'hidden',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
    backdropFilter: 'blur(10px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderRadius: '20px',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    fontWeight: 'bold',
    borderRadius: '50px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
        padding: '0 12px',
    }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: '50px',
    padding: '10px 24px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '16px',
    '& .MuiTableCell-head': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

const LeaseDetails = () => {
    const [lease, setLease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openPayment, setOpenPayment] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

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
            // If we have an ID, use it, otherwise get the active lease for the tenant
            let leaseData;
            if (id) {
                leaseData = await leaseService.getLeaseById(id);
            } else {
                // Use the simplified method for better error handling
                leaseData = await leaseService.getSimplifiedTenantLease();
            }
            
            console.log('Lease details:', leaseData);
            
            // Check if property data is present
            if (!leaseData.property || !leaseData.property.id) {
                console.warn('Property data is missing or incomplete in lease:', leaseData);
                
                // If we have a property ID but not full property data, try to fetch it
                if (leaseData.propertyId) {
                    try {
                        console.log('Attempting to fetch property data for ID:', leaseData.propertyId);
                        const propertyResponse = await axiosInstance.get(`/properties/${leaseData.propertyId}`);
                        
                        if (propertyResponse.data) {
                            console.log('Retrieved property data:', propertyResponse.data);
                            // Merge the property data with the lease data
                            leaseData.property = propertyResponse.data;
                        }
                    } catch (propError) {
                        console.error('Failed to fetch property details:', propError);
                    }
                } else {
                    enqueueSnackbar('Property information may be incomplete', { variant: 'warning' });
                }
            } else {
                console.log('Property data found:', leaseData.property);
            }
            
            setLease(leaseData);
        } catch (error) {
            console.error('Error fetching lease details:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to load lease details. Please try again.');
            enqueueSnackbar('Failed to load lease details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        if (!lease || !lease.id) return;
        
        try {
            setLoadingPayments(true);
            const response = await paymentService.getTenantPayments();
            // Filter payments for this specific lease
            const leasePayments = response.content.filter(payment => 
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

    const handleOpenPayment = () => {
        setOpenPayment(true);
    };

    const handleClosePayment = (success) => {
        setOpenPayment(false);
        if (success) {
            // Refresh lease details and payment history
            fetchLeaseDetails();
            fetchPaymentHistory();
        }
    };

    const handleRaiseMaintenanceRequest = () => {
        navigate('/tenant/maintenance/new', { state: { propertyId: lease.property?.id } });
    };

    const handleBackToLeases = () => {
        navigate('/tenant/leased-properties');
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.1,
                when: "beforeChildren" 
            } 
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '70vh',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <CircularProgress size={60} thickness={4} sx={{
                        color: theme => `${theme.palette.primary.main}`,
                    }} />
                    <Typography variant="h6" color="text.secondary">Loading lease details...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 2, 
                            fontSize: '1rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {error}
                    </Alert>
                    <AnimatedButton 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBackToLeases}
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        Back to Leased Properties
                    </AnimatedButton>
                </motion.div>
            </Container>
        );
    }

    if (!lease) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Alert 
                        severity="info" 
                        sx={{ 
                            mb: 2, 
                            fontSize: '1rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        No lease information found. If you believe this is an error, please contact your landlord.
                    </Alert>
                    <AnimatedButton 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBackToLeases}
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        Back to Leased Properties
                    </AnimatedButton>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBackToLeases}
                        variant="outlined"
                        sx={{ 
                            mr: 2, 
                            borderRadius: '50px',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateX(-5px)'
                            }
                        }}
                    >
                        Back
                    </Button>
                    <GradientTypography variant="h4" component="h1">
                        <ReceiptIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Lease Details
                    </GradientTypography>
                </Box>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Grid container spacing={3}>
                    {/* Property Information */}
                    <Grid item xs={12} md={6}>
                        <motion.div variants={itemVariants}>
                            <StyledPaper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: theme.palette.primary.main,
                                    fontWeight: 'bold'
                                }}>
                                    <HomeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Property Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                {lease.property ? (
                                    <>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                            {lease.property.title || 'Property Title'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.95rem' }}>
                                            {lease.property.address || ''}{lease.property.city ? `, ${lease.property.city}` : ''}{lease.property.state ? `, ${lease.property.state}` : ''}
                                        </Typography>
                                        
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                    Property Type
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {lease.property.propertyType || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                    Bedrooms
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {lease.property.numberOfBedrooms || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                    Bathrooms
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {lease.property.numberOfBathrooms || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                    Total Area
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                            </StyledPaper>
                        </motion.div>
                    </Grid>

                    {/* Lease Information */}
                    <Grid item xs={12} md={6}>
                        <motion.div variants={itemVariants}>
                            <StyledPaper sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" gutterBottom sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        color: theme.palette.primary.main,
                                        fontWeight: 'bold'
                                    }}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Lease Information
                                    </Typography>
                                    <StyledChip 
                                        label={lease.status} 
                                        color={lease.status === 'ACTIVE' ? 'success' : 
                                            lease.status === 'PENDING_SIGNATURE' ? 'warning' : 'default'} 
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            Start Date
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatDate(lease.startDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            End Date
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatDate(lease.endDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            Monthly Rent
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold" sx={{ 
                                            color: theme.palette.primary.main,
                                            fontSize: '1.1rem'
                                        }}>
                                            {formatCurrency(lease.monthlyRent)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            Security Deposit
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatCurrency(lease.securityDeposit)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            Payment Due Day
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {lease.paymentDueDay ? `${lease.paymentDueDay}th of each month` : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </StyledPaper>
                        </motion.div>
                    </Grid>

                    {/* Payment Action Button - Prominent Position */}
                    <Grid item xs={12}>
                        <motion.div variants={itemVariants}>
                            <GlassPaper elevation={3} sx={{ 
                                p: 3, 
                                borderRadius: '20px',
                                borderLeft: `6px solid ${theme.palette.primary.main}`,
                                background: `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, transparent)`
                            }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h6" gutterBottom sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontWeight: 'bold',
                                            color: theme.palette.primary.main
                                        }}>
                                            <PaymentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Monthly Rent Payment
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                            Your monthly rent of <Box component="span" sx={{ fontWeight: 'bold' }}>{formatCurrency(lease.monthlyRent)}</Box> is due on the <Box component="span" sx={{ fontWeight: 'bold' }}>{lease.paymentDueDay || '1st'}</Box> of each month.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <AnimatedButton 
                                                variant="contained" 
                                                color="primary"
                                                size="large"
                                                startIcon={<PaymentIcon />}
                                                onClick={handleOpenPayment}
                                                fullWidth
                                            >
                                                Make Payment
                                            </AnimatedButton>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </GlassPaper>
                        </motion.div>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                        <motion.div variants={itemVariants}>
                            <StyledPaper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    fontWeight: 'bold',
                                    color: theme.palette.secondary.main
                                }}>
                                    Other Actions
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button 
                                        variant="outlined"
                                        startIcon={<BuildIcon />}
                                        onClick={handleRaiseMaintenanceRequest}
                                        sx={{ 
                                            borderRadius: '50px',
                                            fontWeight: 'medium',
                                            px: 3
                                        }}
                                    >
                                        Raise Maintenance Request
                                    </Button>
                                </motion.div>
                            </StyledPaper>
                        </motion.div>
                    </Grid>

                    {/* Payment History */}
                    <Grid item xs={12}>
                        <motion.div variants={itemVariants}>
                            <StyledPaper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: theme.palette.secondary.main,
                                    fontWeight: 'bold'
                                }}>
                                    <PaymentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Payment History
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                {loadingPayments ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={30} />
                                    </Box>
                                ) : payments.length > 0 ? (
                                    <StyledTableContainer>
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
                                                        <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrency(payment.amount)}</TableCell>
                                                        <TableCell>{payment.description}</TableCell>
                                                        <TableCell>{payment.paymentMethod}</TableCell>
                                                        <TableCell>
                                                            <StyledChip 
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
                                    </StyledTableContainer>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                        No payment records found for this lease.
                                    </Typography>
                                )}
                            </StyledPaper>
                        </motion.div>
                    </Grid>

                    {/* Additional Terms */}
                    {lease.additionalTerms && (
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants}>
                                <StyledPaper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        color: theme.palette.primary.main,
                                        fontWeight: 'bold'
                                    }}>
                                        <DocumentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Additional Terms
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        {lease.additionalTerms}
                                    </Typography>
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                    )}
                </Grid>
            </motion.div>

            {/* Payment Dialog */}
            <RazorpayLeasePayment 
                open={openPayment}
                onClose={handleClosePayment}
                lease={lease}
            />
        </Container>
    );
};

export default LeaseDetails; 