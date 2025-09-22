import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
    Box, Chip, CircularProgress, Divider, Alert, TextField, InputAdornment, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, useTheme, alpha, styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
    Search as SearchIcon, HomeOutlined, Build as BuildIcon, CalendarToday as CalendarIcon,
    PriorityHigh as PriorityIcon, Add as AddIcon, Visibility as VisibilityIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import maintenanceService from '../../services/maintenanceService';
import { motion } from 'framer-motion';

// Styled components for enhanced visual appeal
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
    }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    fontWeight: 'bold',
    borderRadius: '50px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
        padding: '0 10px',
    }
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        '&.Mui-focused': {
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
        }
    }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTabs-indicator': {
        height: '3px',
        borderRadius: '3px',
    },
    '& .MuiTab-root': {
        fontWeight: 'bold',
        textTransform: 'none',
        minWidth: 'auto',
        padding: '12px 16px',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
        }
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        overflow: 'hidden',
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
}));

const TenantMaintenance = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    useEffect(() => {
        fetchMaintenanceRequests();
    }, []);

    const fetchMaintenanceRequests = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getTenantMaintenanceRequests();
            console.log('Tenant maintenance requests:', data);
            
            if (Array.isArray(data)) {
                setMaintenanceRequests(data);
            } else if (data && data.content && Array.isArray(data.content)) {
                setMaintenanceRequests(data.content);
            } else {
                console.error('Unexpected response format:', data);
                setMaintenanceRequests([]);
            }
            
            // Show success notification
            enqueueSnackbar('Maintenance requests loaded successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            setError('Failed to load maintenance requests. Please try again.');
            enqueueSnackbar('Failed to load maintenance requests', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCreateRequest = () => {
        navigate('/tenant/maintenance/new');
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedRequest(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'IN_PROGRESS':
                return 'primary';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPriorityChipColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'error';
            case 'MEDIUM':
                return 'warning';
            case 'LOW':
                return 'info';
            default:
                return 'default';
        }
    };

    const filteredRequests = maintenanceRequests.filter(request => {
        // First filter by search term
        const searchLower = searchTerm.toLowerCase();
        const propertyTitle = request.property?.name?.toLowerCase() || '';
        const title = request.title?.toLowerCase() || '';
        const description = request.description?.toLowerCase() || '';
        const status = request.status?.toLowerCase() || '';
        
        const matchesSearch = propertyTitle.includes(searchLower) || 
                           title.includes(searchLower) ||
                           description.includes(searchLower) || 
                           status.includes(searchLower);
        
        // Then filter by active tab
        if (activeTab === 'all') {
            return matchesSearch;
        } else if (activeTab === 'pending') {
            return matchesSearch && request.status === 'PENDING';
        } else if (activeTab === 'inProgress') {
            return matchesSearch && request.status === 'IN_PROGRESS';
        } else if (activeTab === 'completed') {
            return matchesSearch && request.status === 'COMPLETED';
        }
        
        return matchesSearch;
    });

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
                    <Typography variant="h6" color="text.secondary">Loading maintenance requests...</Typography>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <GradientTypography variant="h4" component="h1">
                        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        My Maintenance Requests
                    </GradientTypography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <AnimatedButton 
                            variant="outlined" 
                            color="primary" 
                            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                            onClick={fetchMaintenanceRequests}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </AnimatedButton>
                        <AnimatedButton 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={handleCreateRequest}
                            sx={{ 
                                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                            }}
                        >
                            New Request
                        </AnimatedButton>
                    </Box>
                </Box>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <StyledPaper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <StyledTextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search maintenance requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    
                    <StyledTabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 3 }}
                    >
                        <Tab label="All Requests" value="all" />
                        <Tab label="Pending" value="pending" />
                        <Tab label="In Progress" value="inProgress" />
                        <Tab label="Completed" value="completed" />
                    </StyledTabs>
                    
                    {filteredRequests.length === 0 ? (
                        <Box sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            borderRadius: 2
                        }}>
                            <BuildIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No maintenance requests found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {searchTerm ? 'Try adjusting your search criteria' : 'Submit a new maintenance request when needed'}
                            </Typography>
                            <AnimatedButton
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateRequest}
                                sx={{ mt: 3 }}
                            >
                                Create New Request
                            </AnimatedButton>
                        </Box>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid container spacing={3}>
                                {filteredRequests.map((request) => (
                                    <Grid item xs={12} md={6} key={request.id}>
                                        <motion.div variants={itemVariants}>
                                            <StyledCard>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                            {request.title}
                                                        </Typography>
                                                        <StyledChip 
                                                            label={request.status} 
                                                            color={getStatusChipColor(request.status)}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <HomeOutlined fontSize="small" color="action" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {request.property?.name || 'Property not specified'}
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Submitted: {formatDate(request.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <PriorityIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                            Priority:
                                                        </Typography>
                                                        <StyledChip 
                                                            label={request.priority} 
                                                            color={getPriorityChipColor(request.priority)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    
                                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                                        mb: 2,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {request.description}
                                                    </Typography>
                                                </CardContent>
                                                <Divider />
                                                <CardActions>
                                                    <AnimatedButton 
                                                        size="small" 
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewRequest(request)}
                                                        sx={{ ml: 'auto' }}
                                                    >
                                                        View Details
                                                    </AnimatedButton>
                                                </CardActions>
                                            </StyledCard>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}
                </StyledPaper>
            </motion.div>
            
            {/* Request Details Dialog */}
            <StyledDialog 
                open={openDetailsDialog} 
                onClose={handleCloseDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedRequest && (
                    <>
                        <StyledDialogTitle>
                            <BuildIcon sx={{ mr: 1 }} />
                            Maintenance Request Details
                        </StyledDialogTitle>
                        <DialogContent sx={{ p: 3, mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                            {selectedRequest.title}
                                        </Typography>
                                        <StyledChip 
                                            label={selectedRequest.status} 
                                            color={getStatusChipColor(selectedRequest.status)}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedRequest.property?.name || 'Not specified'}
                                    </Typography>
                                    
                                    <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {formatDate(selectedRequest.createdAt)}
                                    </Typography>
                                    
                                    <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                                    <StyledChip 
                                        label={selectedRequest.priority} 
                                        color={getPriorityChipColor(selectedRequest.priority)}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    {selectedRequest.updatedAt && (
                                        <>
                                            <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                {formatDate(selectedRequest.updatedAt)}
                                            </Typography>
                                        </>
                                    )}
                                    
                                    {selectedRequest.resolvedAt && (
                                        <>
                                            <Typography variant="subtitle2" color="text.secondary">Resolved On</Typography>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                {formatDate(selectedRequest.resolvedAt)}
                                            </Typography>
                                        </>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                    <Paper variant="outlined" sx={{ 
                                        p: 2, 
                                        borderRadius: '12px', 
                                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                    }}>
                                        <Typography variant="body1">
                                            {selectedRequest.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                
                                {selectedRequest.resolutionNotes && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Resolution Notes</Typography>
                                        <Paper variant="outlined" sx={{ 
                                            p: 2, 
                                            borderRadius: '12px', 
                                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                        }}>
                                            <Typography variant="body1">
                                                {selectedRequest.resolutionNotes}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                                
                                {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Images</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {selectedRequest.imageUrls.map((url, index) => (
                                                <Box 
                                                    key={index}
                                                    component="img"
                                                    src={url}
                                                    alt={`Maintenance request image ${index + 1}`}
                                                    sx={{ 
                                                        width: { xs: '100%', sm: 120 }, 
                                                        height: { xs: 200, sm: 120 }, 
                                                        objectFit: 'cover',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                                                        }
                                                    }}
                                                    onClick={() => window.open(url, '_blank')}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <AnimatedButton onClick={handleCloseDetailsDialog} variant="outlined">
                                Close
                            </AnimatedButton>
                        </DialogActions>
                    </>
                )}
            </StyledDialog>
        </Container>
    );
};

export default TenantMaintenance; 