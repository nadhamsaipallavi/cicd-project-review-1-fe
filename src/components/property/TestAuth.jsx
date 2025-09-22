import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import axiosInstance from '../../services/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

const TestAuth = () => {
    const [testResult, setTestResult] = useState(null);
    const [error, setError] = useState(null);
    const { currentUser, userRole } = useAuth();

    const testAuthentication = async () => {
        try {
            setError(null);
            setTestResult(null);
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            console.log('Current token:', token ? token.substring(0, 20) + '...' : 'No token');
            console.log('Current user role:', userRole);
            
            // Make a test request to the tenant endpoint
            const response = await axiosInstance.get('/property-purchase-requests/tenant');
            console.log('Authentication test successful:', response.data);
            setTestResult({
                success: true,
                message: 'Authentication successful!',
                data: response.data
            });
        } catch (error) {
            console.error('Authentication test failed:', error);
            setError({
                message: error.response?.data?.message || error.message || 'Authentication failed',
                status: error.response?.status,
                data: error.response?.data
            });
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>Authentication Test</Typography>
            
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    Current User: {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Not logged in'}
                </Typography>
                <Typography variant="body1">
                    Role: {userRole || 'None'}
                </Typography>
            </Box>
            
            <Button 
                variant="contained" 
                color="primary" 
                onClick={testAuthentication}
                sx={{ mb: 2 }}
            >
                Test Authentication
            </Button>
            
            {testResult && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body1">{testResult.message}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Data received: {JSON.stringify(testResult.data).substring(0, 100)}...
                    </Typography>
                </Box>
            )}
            
            {error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body1">Error: {error.message}</Typography>
                    {error.status && (
                        <Typography variant="body2">Status: {error.status}</Typography>
                    )}
                    {error.data && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Details: {JSON.stringify(error.data)}
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default TestAuth; 