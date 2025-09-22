import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, 
    Box, Chip, CircularProgress, Divider, Alert, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, InputAdornment, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Search as SearchIcon, HomeOutlined, PersonOutline, ReceiptLong, 
         CalendarMonth, Payments, ArrowForward } from '@mui/icons-material';
import { format } from 'date-fns';
import leaseService from '../../services/leaseService';
import { motion } from 'framer-motion';

const ManageLeases = () => {
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    useEffect(() => {
        fetchLeases();
    }, []);

    const fetchLeases = async () => {
        try {
            setLoading(true);
            const data = await leaseService.getLandlordLeases();
            console.log('Landlord leases raw data:', data);
            
            let processedLeases = [];
            
            if (Array.isArray(data)) {
                processedLeases = data;
                console.log('Data is an array with', data.length, 'leases');
            } else if (data && data.content && Array.isArray(data.content)) {
                processedLeases = data.content;
                console.log('Data has content array with', data.content.length, 'leases');
            } else {
                console.error('Unexpected response format:', data);
                processedLeases = [];
            }
            
            // Log the first lease to understand its structure
            if (processedLeases.length > 0) {
                console.log('Sample lease structure:', JSON.stringify(processedLeases[0], null, 2));
                
                // Check if property and tenant data is nested or flattened
                const sampleLease = processedLeases[0];
                if (sampleLease.property) {
                    console.log('Property data is nested:', sampleLease.property);
                } else if (sampleLease.propertyId) {
                    console.log('Property data is referenced by ID:', sampleLease.propertyId);
                    console.log('Property title might be in:', sampleLease.propertyTitle);
                }
                
                if (sampleLease.tenant) {
                    console.log('Tenant data is nested:', sampleLease.tenant);
                } else if (sampleLease.tenantId) {
                    console.log('Tenant data is referenced by ID:', sampleLease.tenantId);
                    console.log('Tenant name might be in:', 
                        sampleLease.tenantFirstName, 
                        sampleLease.tenantLastName,
                        sampleLease.tenantName
                    );
                }
            }
            
            setLeases(processedLeases);
        } catch (error) {
            console.error('Error fetching leases:', error);
            setError('Failed to load leases. Please try again.');
            enqueueSnackbar('Failed to load leases', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewLease = (leaseId) => {
        navigate(`/landlord/leases/${leaseId}`);
    };

    const handleViewProperty = (propertyId) => {
        navigate(`/landlord/properties/${propertyId}`);
    };

    const handleViewTenant = (tenantId) => {
        // Implement this when tenant details page is available
        enqueueSnackbar('Tenant details view is not implemented yet', { variant: 'info' });
    };

    const handleUpdateStatus = async (leaseId, status) => {
        try {
            await leaseService.updateLeaseStatus(leaseId, status);
            enqueueSnackbar(`Lease status updated to ${status}`, { variant: 'success' });
            fetchLeases(); // Refresh the list
        } catch (error) {
            console.error('Error updating lease status:', error);
            enqueueSnackbar('Failed to update lease status', { variant: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Enhanced helper function to safely get property title
    const getPropertyTitle = (lease) => {
        if (!lease) return 'Unknown Property';
        
        // Check all possible property name locations
        if (lease.property && lease.property.title) {
            return lease.property.title;
        }
        
        if (lease.propertyTitle) {
            return lease.propertyTitle;
        }
        
        if (lease.property && lease.property.name) {
            return lease.property.name;
        }
        
        if (lease.propertyName) {
            return lease.propertyName;
        }
        
        // If we have property details but no title field
        if (lease.property && typeof lease.property === 'object') {
            // Try to find any field that might contain the title
            const possibleTitleFields = ['name', 'description', 'address'];
            for (const field of possibleTitleFields) {
                if (lease.property[field]) {
                    return lease.property[field];
                }
            }
        }
        
        return 'Unnamed Property';
    };

    // Enhanced helper function to safely get tenant name
    const getTenantName = (lease) => {
        if (!lease) return 'Unknown Tenant';
        
        // Check if tenant object exists with firstName/lastName
        if (lease.tenant) {
            if (lease.tenant.firstName || lease.tenant.lastName) {
                const firstName = lease.tenant.firstName || '';
                const lastName = lease.tenant.lastName || '';
                return `${firstName} ${lastName}`.trim();
            }
            
            // Check if tenant has fullName or name
            if (lease.tenant.fullName) {
                return lease.tenant.fullName;
            }
            
            if (lease.tenant.name) {
                return lease.tenant.name;
            }
            
            // Check if tenant has username or email as fallback
            if (lease.tenant.username) {
                return lease.tenant.username;
            }
            
            if (lease.tenant.email) {
                return lease.tenant.email;
            }
        }
        
        // Check flattened tenant properties
        if (lease.tenantFirstName || lease.tenantLastName) {
            const firstName = lease.tenantFirstName || '';
            const lastName = lease.tenantLastName || '';
            return `${firstName} ${lastName}`.trim();
        }
        
        // Check for tenantName field
        if (lease.tenantName) {
            return lease.tenantName;
        }
        
        // Check for tenantEmail as last resort
        if (lease.tenantEmail) {
            return lease.tenantEmail;
        }
        
        return 'Unknown Tenant';
    };

    const filteredLeases = leases.filter(lease => {
        const searchLower = searchTerm.toLowerCase();
        const propertyTitle = getPropertyTitle(lease).toLowerCase();
        const tenantName = getTenantName(lease).toLowerCase();
        const status = lease.status?.toLowerCase() || '';
        
        return propertyTitle.includes(searchLower) || 
               tenantName.includes(searchLower) || 
               status.includes(searchLower);
    });

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'PENDING':
            case 'PENDING_SIGNATURE':
            case 'PENDING_APPROVAL':
                return 'warning';
            case 'TERMINATED':
            case 'EXPIRED':
                return 'error';
            default:
                return 'default';
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
                <Typography variant="h4" component="h1" gutterBottom sx={{ 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    <ReceiptLong sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Manage Leases
                </Typography>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Paper elevation={3} sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by property, tenant or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                            sx: { 
                                borderRadius: '50px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                },
                            }
                        }}
                        sx={{ mb: 3 }}
                    />
                    
                    {leases.length === 0 ? (
                        <Alert severity="info" sx={{ fontSize: '1rem' }}>You don't have any leases yet.</Alert>
                    ) : filteredLeases.length === 0 ? (
                        <Alert severity="info" sx={{ fontSize: '1rem' }}>No leases match your search.</Alert>
                    ) : (
                        <TableContainer sx={{ 
                            borderRadius: '8px',
                            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.1)}`,
                            overflow: 'hidden'
                        }}>
                            <Table aria-label="leases table" sx={{
                                '& .MuiTableCell-root': {
                                    fontSize: '0.95rem',
                                    py: 1.5
                                },
                                '& .MuiTableRow-root:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                                }
                            }}>
                                <TableHead sx={{ 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiTableCell-root': {
                                        color: theme.palette.primary.main,
                                        fontWeight: 'bold'
                                    }
                                }}>
                                    <TableRow>
                                        <TableCell>Property</TableCell>
                                        <TableCell>Tenant</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>End Date</TableCell>
                                        <TableCell>Monthly Rent</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLeases.map((lease, index) => (
                                        <TableRow key={lease.id} sx={{
                                            animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                                            '@keyframes fadeIn': {
                                                '0%': { opacity: 0, transform: 'translateY(10px)' },
                                                '100%': { opacity: 1, transform: 'translateY(0)' }
                                            }
                                        }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <HomeOutlined sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {getPropertyTitle(lease)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonOutline sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                                    <Typography variant="body2">
                                                        {getTenantName(lease)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={lease.status} 
                                                    color={getStatusChipColor(lease.status)} 
                                                    size="small" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        borderRadius: '50px'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarMonth sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                                    {formatDate(lease.startDate)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarMonth sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                                    {formatDate(lease.endDate)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Payments sx={{ mr: 1, fontSize: 'small', color: theme.palette.primary.main }} />
                                                    <Typography sx={{ fontWeight: 'medium', color: theme.palette.primary.main }}>
                                                        {formatCurrency(lease.monthlyRent)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        onClick={() => handleViewLease(lease.id)}
                                                        endIcon={<ArrowForward />}
                                                        sx={{ 
                                                            borderRadius: '50px',
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </motion.div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </motion.div>
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.secondary.main
                    }}>
                        Recent Lease Requests
                    </Typography>
                    <Grid container spacing={3}>
                        {filteredLeases
                            .filter(lease => ['PENDING', 'PENDING_APPROVAL', 'PENDING_SIGNATURE'].includes(lease.status))
                            .slice(0, 3)
                            .map((lease, index) => (
                                <Grid item xs={12} md={4} key={`request-${lease.id}`}>
                                    <motion.div variants={itemVariants}>
                                        <Card elevation={3} sx={{ 
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.2)}`
                                            }
                                        }}>
                                            <Box sx={{ 
                                                p: 1, 
                                                px: 2, 
                                                background: `linear-gradient(90deg, ${theme.palette.warning.light}, ${alpha(theme.palette.warning.main, 0.7)})`,
                                                color: 'white'
                                            }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    Pending Approval
                                                </Typography>
                                            </Box>
                                            <CardContent>
                                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                    {getPropertyTitle(lease)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 1
                                                }}>
                                                    <PersonOutline sx={{ mr: 0.5, fontSize: '1rem' }} />
                                                    {getTenantName(lease)}
                                                </Typography>
                                                <Divider sx={{ my: 1.5 }} />
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Status
                                                        </Typography>
                                                        <Box>
                                                            <Chip 
                                                                label={lease.status} 
                                                                color={getStatusChipColor(lease.status)} 
                                                                size="small" 
                                                                sx={{ 
                                                                    fontWeight: 'bold',
                                                                    borderRadius: '50px'
                                                                }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Monthly Rent
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                                                            {formatCurrency(lease.monthlyRent)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <CardActions sx={{ 
                                                p: 2, 
                                                pt: 0,
                                                background: alpha(theme.palette.background.default, 0.6)
                                            }}>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button 
                                                        size="small" 
                                                        onClick={() => handleUpdateStatus(lease.id, 'ACTIVE')}
                                                        color="success"
                                                        variant="contained"
                                                        sx={{ 
                                                            borderRadius: '50px',
                                                            fontWeight: 'medium',
                                                            boxShadow: `0 4px 10px ${alpha(theme.palette.success.main, 0.3)}`
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                </motion.div>
                                                <Button 
                                                    size="small" 
                                                    onClick={() => handleUpdateStatus(lease.id, 'REJECTED')}
                                                    color="error"
                                                    sx={{ 
                                                        borderRadius: '50px',
                                                        ml: 1
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button 
                                                    size="small"
                                                    onClick={() => handleViewLease(lease.id)}
                                                    sx={{ 
                                                        borderRadius: '50px',
                                                        ml: 'auto'
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        {filteredLeases.filter(lease => ['PENDING', 'PENDING_APPROVAL', 'PENDING_SIGNATURE'].includes(lease.status)).length === 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ fontSize: '1rem' }}>No pending lease requests.</Alert>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </motion.div>
        </Container>
    );
};

export default ManageLeases; 