import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Card, CardContent, CardMedia, CardActions, 
    Button, Box, Chip, CircularProgress, Divider, Alert, Paper, useTheme, alpha, styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import leaseService from '../../services/leaseService';
import { 
    Home as HomeIcon, 
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import PropertyPlaceholder from '../../components/common/PropertyPlaceholder';
import { motion } from 'framer-motion';

// Styled components for enhanced visual appeal
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
    '&:hover': {
        transform: 'translateY(-12px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)'
    }
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: '220px',
    transition: 'transform 0.6s ease',
    '&:hover': {
        transform: 'scale(1.08)'
    }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    fontWeight: 'bold',
    borderRadius: '50px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
        padding: '0 12px',
    }
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '2px',
    width: '80px',
    marginBottom: theme.spacing(3),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    }
}));

const LeaseProperties = () => {
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    useEffect(() => {
        fetchLeaseProperties();
    }, []);

    const fetchLeaseProperties = async () => {
        try {
            setLoading(true);
            const data = await leaseService.getTenantLease();
            console.log('Leased properties:', data);
            
            // Ensure we're always dealing with an array of leases
            const leaseArray = Array.isArray(data) ? data : [data].filter(Boolean);
            
            // Log the number of leases found
            console.log(`Found ${leaseArray.length} leased properties`);
            
            // Set the leases in state
            setLeases(leaseArray);
        } catch (error) {
            console.error('Error fetching leased properties:', error);
            setError('Failed to load leased properties. Please try again.');
            enqueueSnackbar('Failed to load leased properties', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewLease = (leaseId) => {
        navigate(`/tenant/lease/${leaseId}`);
    };

    const handleViewProperty = (propertyId) => {
        navigate(`/properties/${propertyId}`);
    };

    const handleMakePayment = (leaseId) => {
        navigate(`/tenant/payments/make-payment/${leaseId}`);
    };

    const handleRaiseMaintenanceRequest = (propertyId) => {
        navigate(`/tenant/maintenance/new`, { state: { propertyId } });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
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
                    <Typography variant="h6" color="text.secondary">Loading your leased properties...</Typography>
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
                            fontSize: '1rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {error}
                    </Alert>
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
                <Box sx={{ mb: 4 }}>
                    <GradientTypography variant="h4" component="h1" gutterBottom sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <HomeIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        My Leased Properties
                    </GradientTypography>
                    <GradientDivider />
                </Box>
            </motion.div>

            {leases.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper 
                        elevation={3}
                        sx={{
                            p: 6,
                            borderRadius: '20px',
                            textAlign: 'center',
                            background: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.8)})`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            You don't have any leased properties yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            When you lease a property, it will appear here
                        </Typography>
                        <AnimatedButton 
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ 
                                px: 4, 
                                py: 1.5,
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                            }}
                            onClick={() => navigate('/properties')}
                        >
                            Browse Available Properties
                        </AnimatedButton>
                    </Paper>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={4}>
                        {leases.map((lease, index) => (
                            <Grid item xs={12} md={6} key={lease.id}>
                                <motion.div
                                    variants={itemVariants}
                                    custom={index}
                                >
                                    <StyledCard elevation={3}>
                                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                            <StyledCardMedia
                                                component={lease.property?.images && lease.property.images.length > 0 
                                                    ? "img"
                                                    : PropertyPlaceholder}
                                                image={lease.property?.images && lease.property.images.length > 0 
                                                    ? lease.property.images[0] 
                                                    : undefined}
                                                alt={lease.property?.title}
                                            />
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: 16, 
                                                right: 16,
                                                zIndex: 1
                                            }}>
                                                <StyledChip 
                                                    label={lease.status} 
                                                    color={lease.status === 'ACTIVE' ? 'success' : 'default'} 
                                                />
                                            </Box>
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                {lease.property?.title || 'Property Title'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                                    {lease.property?.address}, {lease.property?.city}
                                                </Typography>
                                            </Box>
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle1" sx={{ 
                                                    fontWeight: 'bold',
                                                    color: theme.palette.secondary.main,
                                                    mb: 1
                                                }}>
                                                    Lease Details
                                                </Typography>
                                                
                                                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Monthly Rent
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ 
                                                            fontWeight: 'bold',
                                                            color: theme.palette.primary.main,
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {formatCurrency(lease.monthlyRent)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Status
                                                        </Typography>
                                                        <Box>
                                                            <StyledChip 
                                                                label={lease.status} 
                                                                color={lease.status === 'ACTIVE' ? 'success' : 'default'} 
                                                                size="small" 
                                                            />
                                                        </Box>
                                                    </Grid>
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
                                                </Grid>
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ 
                                            flexWrap: 'wrap', 
                                            gap: 1, 
                                            p: 2, 
                                            pt: 0,
                                            background: alpha(theme.palette.background.default, 0.6),
                                            justifyContent: { xs: 'center', sm: 'flex-start' }
                                        }}>
                                            <AnimatedButton 
                                                size="small" 
                                                onClick={() => handleViewProperty(lease.property?.id)}
                                                sx={{ borderRadius: '50px' }}
                                            >
                                                View Property
                                            </AnimatedButton>
                                            <AnimatedButton 
                                                size="small"
                                                startIcon={<ReceiptIcon />}
                                                color="secondary"
                                                onClick={() => handleViewLease(lease.id)}
                                                sx={{ borderRadius: '50px' }}
                                            >
                                                View Lease Details
                                            </AnimatedButton>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <AnimatedButton 
                                                    size="small" 
                                                    startIcon={<MoneyIcon />} 
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleMakePayment(lease.id)}
                                                    sx={{ 
                                                        borderRadius: '50px',
                                                        boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Make Payment
                                                </AnimatedButton>
                                            </motion.div>
                                            <AnimatedButton 
                                                size="small" 
                                                startIcon={<BuildIcon />}
                                                onClick={() => handleRaiseMaintenanceRequest(lease.property?.id)}
                                                sx={{ borderRadius: '50px' }}
                                            >
                                                Request Maintenance
                                            </AnimatedButton>
                                        </CardActions>
                                    </StyledCard>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            )}
        </Container>
    );
};

export default LeaseProperties; 