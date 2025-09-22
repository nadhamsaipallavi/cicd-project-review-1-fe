import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { useSnackbar } from 'notistack';
import BuyPropertyButton from '../components/property/BuyPropertyButton';
import RazorpayPayment from '../components/property/RazorpayPayment';

const PropertyDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            setProperty(response);
        } catch (error) {
            enqueueSnackbar('Failed to fetch property details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!property) {
        return <Typography>Property not found</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            {property.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {property.address}, {property.city}, {property.state}
                        </Typography>
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Chip
                                label={property.available ? 'Available' : 'Sold'}
                                color={property.available ? 'success' : 'error'}
                                sx={{ mr: 1 }}
                            />
                            <Chip
                                label={property.propertyType}
                                color="primary"
                                sx={{ mr: 1 }}
                            />
                        </Box>

                        <Typography variant="h6" gutterBottom>
                            Property Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                    <strong>Bedrooms:</strong> {property.numberOfBedrooms}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Bathrooms:</strong> {property.numberOfBathrooms}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Total Area:</strong> {property.totalArea} sq ft
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                    <strong>Monthly Rent:</strong> ₹{property.monthlyRent}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Security Deposit:</strong> ₹{property.securityDeposit}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Available From:</strong> {new Date(property.availableFrom).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {property.description}
                        </Typography>

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Amenities
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {property.amenities.map((amenity, index) => (
                                <Chip key={index} label={amenity} />
                            ))}
                        </Box>

                        {user?.role === 'TENANT' && property.available && (
                            <Box sx={{ mt: 4 }}>
                                <BuyPropertyButton
                                    propertyId={property.id}
                                    propertyTitle={property.title}
                                    price={property.monthlyRent * 12}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default PropertyDetailsPage; 