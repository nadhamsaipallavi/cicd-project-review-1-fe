import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Card, CardContent, CardMedia, CardActions, 
    Button, Box, Chip, CircularProgress, Divider, Alert, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { propertyPurchaseService } from '../../services/propertyPurchaseService';
import { useSnackbar } from 'notistack';
import { 
    Home as HomeIcon, 
    LocationOn as LocationIcon,
    DocumentScanner as DocumentIcon
} from '@mui/icons-material';
import PropertyPlaceholder from '../../components/common/PropertyPlaceholder';
import Invoice from '../../components/payment/Invoice';
import { motion } from 'framer-motion';

const PurchasedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [selectedPaymentData, setSelectedPaymentData] = useState(null);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    useEffect(() => {
        fetchPurchasedProperties();
    }, []);

    const fetchPurchasedProperties = async () => {
        try {
            setLoading(true);
            const data = await propertyPurchaseService.getPurchasedProperties();
            console.log('Purchased properties:', data);
            setProperties(data);
        } catch (error) {
            console.error('Error fetching purchased properties:', error);
            setError('Failed to load purchased properties. Please try again.');
            enqueueSnackbar('Failed to load purchased properties', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewProperty = (propertyId) => {
        navigate(`/properties/${propertyId}`);
    };

    const handleViewInvoice = async (propertyId) => {
        try {
            // Find the purchase request for this property
            const requests = await propertyPurchaseService.getTenantRequests();
            const request = requests.find(
                req => req.propertyId === propertyId && req.status === 'PAYMENT_COMPLETED'
            );
            
            if (!request) {
                enqueueSnackbar('Invoice not found for this property', { variant: 'error' });
                return;
            }
            
            // Get the invoice data
            const property = properties.find(prop => prop.id === propertyId);
            if (!property) {
                enqueueSnackbar('Property details not found', { variant: 'error' });
                return;
            }
            
            setSelectedPaymentData({
                ...request,
                propertyTitle: property.title,
                propertyId: property.id,
                purchasePrice: property.salePrice
            });
            
            setShowInvoice(true);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            enqueueSnackbar('Failed to get invoice. Please try again.', { variant: 'error' });
        }
    };

    const handleCloseInvoice = () => {
        setShowInvoice(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
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
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={60} thickness={4} />
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
                    <Alert severity="error" sx={{ fontSize: '1rem' }}>{error}</Alert>
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
                    <Typography variant="h4" component="h1" gutterBottom sx={{ 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        <HomeIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        My Purchased Properties
                    </Typography>
                    <Divider sx={{ 
                        height: '4px', 
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '2px',
                        width: '80px',
                        mb: 3
                    }} />
                </Box>
            </motion.div>

            {properties.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Alert severity="info" sx={{ mt: 2, fontSize: '1rem' }}>
                        You haven't purchased any properties yet.
                    </Alert>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={3}>
                        {properties.map((property, index) => (
                            <Grid item xs={12} sm={6} md={4} key={property.id}>
                                <motion.div
                                    variants={itemVariants}
                                    custom={index}
                                >
                                    <Card 
                                        elevation={3} 
                                        sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.2)}`
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component={property.images && property.images.length > 0 
                                                    ? "img"
                                                    : PropertyPlaceholder}
                                                height="220"
                                                image={property.images && property.images.length > 0 
                                                    ? property.images[0] 
                                                    : undefined}
                                                alt={property.title}
                                                sx={{ 
                                                    transition: 'transform 0.5s',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            />
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: 16, 
                                                right: 16,
                                                zIndex: 1
                                            }}>
                                                <Chip 
                                                    label="Purchased" 
                                                    color="success" 
                                                    size="small" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        borderRadius: '50px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                {property.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                                    {property.address}, {property.city}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.95rem' }}>
                                                {property.numberOfBedrooms} beds • {property.numberOfBathrooms} baths • {property.totalArea} sq.ft
                                            </Typography>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                mt: 2
                                            }}>
                                                <Typography variant="h6" sx={{ 
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 'bold',
                                                    fontSize: '1.25rem'
                                                }}>
                                                    {formatCurrency(property.salePrice)}
                                                </Typography>
                                                <Chip 
                                                    label="Purchased" 
                                                    color="success" 
                                                    size="small" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        borderRadius: '50px'
                                                    }} 
                                                />
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ 
                                            p: 2, 
                                            pt: 0,
                                            background: alpha(theme.palette.background.default, 0.6)
                                        }}>
                                            <Button 
                                                size="small" 
                                                onClick={() => handleViewProperty(property.id)}
                                                variant="outlined"
                                                sx={{ 
                                                    borderRadius: '50px',
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<DocumentIcon />} 
                                                    onClick={() => handleViewInvoice(property.id)}
                                                    color="secondary"
                                                    sx={{ 
                                                        borderRadius: '50px',
                                                        ml: 1
                                                    }}
                                                >
                                                    View Invoice
                                                </Button>
                                            </motion.div>
                                        </CardActions>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            )}
            
            {/* Custom invoice dialog */}
            <Invoice 
                open={showInvoice} 
                onClose={handleCloseInvoice} 
                paymentData={selectedPaymentData} 
            />
        </Container>
    );
};

export default PurchasedProperties; 