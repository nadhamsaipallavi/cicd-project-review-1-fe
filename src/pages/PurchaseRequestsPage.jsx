import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import PurchaseRequestList from '../components/property/PurchaseRequestList';
import { useAuth } from '../contexts/AuthContext';

const PurchaseRequestsPage = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Property Purchase Requests
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="My Requests" />
                    {user?.role === 'LANDLORD' && <Tab label="Received Requests" />}
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <PurchaseRequestList isLandlord={false} />
            )}

            {tabValue === 1 && user?.role === 'LANDLORD' && (
                <PurchaseRequestList isLandlord={true} />
            )}
        </Container>
    );
};

export default PurchaseRequestsPage; 