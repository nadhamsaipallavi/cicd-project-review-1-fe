import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
    Box, Chip, CircularProgress, Divider, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, InputAdornment, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
    Select, MenuItem, TextareaAutosize, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
    Search as SearchIcon, HomeOutlined, Build as BuildIcon, Person as PersonIcon,
    CalendarToday as CalendarIcon, PriorityHigh as PriorityIcon, Comment as CommentIcon,
    Visibility as VisibilityIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon, Save as SaveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import maintenanceService from '../../services/maintenanceService';
import { motion } from 'framer-motion';

const MaintenanceRequestStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
];

const ManageMaintenance = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');
    
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    useEffect(() => {
        fetchMaintenanceRequests();
    }, []);

    const fetchMaintenanceRequests = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getLandlordMaintenanceRequests();
            console.log('Landlord maintenance requests:', data);
            
            if (Array.isArray(data)) {
                setMaintenanceRequests(data);
            } else if (data && data.content && Array.isArray(data.content)) {
                setMaintenanceRequests(data.content);
            } else {
                console.error('Unexpected response format:', data);
                setMaintenanceRequests([]);
            }
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

    const handleViewRequest = (requestId) => {
        navigate(`/landlord/maintenance/${requestId}`);
    };

    const handleOpenStatusDialog = (request) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setComment('');
        setOpenStatusDialog(true);
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
        setSelectedRequest(null);
    };

    const handleUpdateStatus = async () => {
        if (!selectedRequest) return;
        
        try {
            await maintenanceService.updateMaintenanceRequestStatus(
                selectedRequest.id,
                newStatus,
                comment
            );
            
            enqueueSnackbar(`Maintenance request status updated to ${newStatus}`, { variant: 'success' });
            fetchMaintenanceRequests(); // Refresh the list
            handleCloseStatusDialog();
        } catch (error) {
            console.error('Error updating maintenance request status:', error);
            enqueueSnackbar('Failed to update status', { variant: 'error' });
        }
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
        const propertyTitle = request.property?.title?.toLowerCase() || '';
        const description = request.description?.toLowerCase() || '';
        const tenantName = `${request.tenant?.firstName || ''} ${request.tenant?.lastName || ''}`.toLowerCase();
        const status = request.status?.toLowerCase() || '';
        
        const matchesSearch = propertyTitle.includes(searchLower) || 
                           description.includes(searchLower) || 
                           tenantName.includes(searchLower) || 
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
                    <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Maintenance Requests
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
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by property, description, tenant or status..."
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
                        
                        <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange} 
                            aria-label="maintenance request tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    fontWeight: 'medium',
                                    minWidth: 100,
                                    transition: 'all 0.3s',
                                    borderRadius: '50px',
                                    mx: 0.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    },
                                },
                                '& .Mui-selected': {
                                    color: `${theme.palette.primary.main} !important`,
                                    fontWeight: 'bold',
                                },
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px',
                                    backgroundColor: theme.palette.primary.main,
                                }
                            }}
                        >
                            <Tab label="All Requests" value="all" />
                            <Tab label="Pending" value="pending" />
                            <Tab label="In Progress" value="inProgress" />
                            <Tab label="Completed" value="completed" />
                        </Tabs>
                    </Box>
                    
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
                                {searchTerm ? 'Try adjusting your search criteria' : 'There are no maintenance requests at this time'}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tenant</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRequests.map((request) => (
                                        <TableRow 
                                            key={request.id}
                                            sx={{ 
                                                '&:hover': { 
                                                    bgcolor: alpha(theme.palette.primary.light, 0.1) 
                                                },
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {request.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" 
                                                    sx={{ 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {request.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <HomeOutlined fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {request.property?.name || request.property?.title || 'Property #' + request.propertyId}
                                                        </Typography>
                                                        {request.property?.address && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {request.property.address}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                                                    <Typography variant="body2">
                                                        {request.tenant?.firstName 
                                                            ? `${request.tenant.firstName} ${request.tenant.lastName || ''}`
                                                            : 'Unknown Tenant'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                                    <Typography variant="body2">
                                                        {formatDate(request.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Chip 
                                                    label={request.priority} 
                                                    color={getPriorityChipColor(request.priority)}
                                                    size="small"
                                                    sx={{ fontWeight: 'medium' }}
                                                />
                                            </TableCell>
                                            <TableCell onClick={() => handleViewRequest(request.id)}>
                                                <Chip 
                                                    label={request.status} 
                                                    color={getStatusChipColor(request.status)}
                                                    size="small"
                                                    sx={{ fontWeight: 'medium' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button 
                                                        size="small" 
                                                        variant="outlined" 
                                                        onClick={() => handleViewRequest(request.id)}
                                                        sx={{ minWidth: 0, p: 1 }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </Button>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        onClick={() => handleOpenStatusDialog(request)}
                                                        sx={{ minWidth: 0, p: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </motion.div>
            
            {/* Status Update Dialog */}
            <Dialog 
                open={openStatusDialog} 
                onClose={handleCloseStatusDialog}
                maxWidth="sm"
                fullWidth
            >
                {selectedRequest && (
                    <>
                        <DialogTitle sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <BuildIcon sx={{ mr: 1 }} />
                            Update Maintenance Request Status
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {selectedRequest.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <HomeOutlined fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedRequest.property?.name || selectedRequest.property?.title || 'Unknown Property'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            Tenant: {selectedRequest.tenant?.firstName 
                                                ? `${selectedRequest.tenant.firstName} ${selectedRequest.tenant.lastName || ''}`
                                                : 'Unknown Tenant'}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel id="status-label">Status</InputLabel>
                                        <Select
                                            labelId="status-label"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            label="Status"
                                        >
                                            {MaintenanceRequestStatusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Chip 
                                                        label={option.label} 
                                                        color={getStatusChipColor(option.value)}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <TextField
                                        label="Comment (optional)"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add additional notes or comments about this status update"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                    <CommentIcon color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, pt: 0 }}>
                            <Button onClick={handleCloseStatusDialog} variant="outlined">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdateStatus} 
                                variant="contained"
                                color="primary"
                                startIcon={newStatus === 'COMPLETED' ? <CheckCircleIcon /> : <SaveIcon />}
                            >
                                {newStatus === 'COMPLETED' ? 'Mark as Completed' : 'Update Status'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Recent High Priority Requests */}
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
                        High Priority Requests
                    </Typography>
                    <Grid container spacing={3}>
                        {filteredRequests
                            .filter(request => request.priority === 'HIGH' && request.status !== 'COMPLETED')
                            .slice(0, 3)
                            .map((request, index) => (
                                <Grid item xs={12} md={4} key={`priority-${request.id}`}>
                                    <motion.div variants={itemVariants}>
                                        <Card elevation={3} sx={{ 
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: `0 10px 25px ${alpha(theme.palette.error.main, 0.2)}`
                                            },
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                                        }}>
                                            <Box sx={{ 
                                                p: 1, 
                                                px: 2, 
                                                background: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.light, 0.7)})`,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    High Priority
                                                </Typography>
                                                <Chip 
                                                    label={request.status} 
                                                    color={getStatusChipColor(request.status)} 
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        borderRadius: '50px'
                                                    }}
                                                />
                                            </Box>
                                            <CardContent>
                                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                    {request.property?.title || 'Unknown Property'}
                                                </Typography>
                                                <Box sx={{ 
                                                    mt: 1, 
                                                    p: 1.5, 
                                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                                    borderRadius: '8px',
                                                    border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`
                                                }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {request.description}
                                                    </Typography>
                                                </Box>
                                                <Divider sx={{ my: 1.5 }} />
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Reported By
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <PersonIcon sx={{ mr: 0.5, fontSize: '1rem', color: theme.palette.secondary.main }} />
                                                            {request.tenant ? `${request.tenant.firstName} ${request.tenant.lastName}` : 'Unknown'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            Submitted On
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <CalendarIcon sx={{ mr: 0.5, fontSize: '1rem', color: theme.palette.primary.main }} />
                                                            {formatDate(request.createdDate)}
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
                                                        onClick={() => handleOpenStatusDialog(request)}
                                                        color="primary"
                                                        variant="contained"
                                                        sx={{ 
                                                            borderRadius: '50px',
                                                            fontWeight: 'medium',
                                                            boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                                                        }}
                                                    >
                                                        Update Status
                                                    </Button>
                                                </motion.div>
                                                <Button 
                                                    size="small"
                                                    onClick={() => handleViewRequest(request.id)}
                                                    variant="outlined"
                                                    sx={{ 
                                                        borderRadius: '50px',
                                                        ml: 1
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        {filteredRequests.filter(request => request.priority === 'HIGH' && request.status !== 'COMPLETED').length === 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ fontSize: '1rem' }}>No high priority maintenance requests.</Alert>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </motion.div>
        </Container>
    );
};

export default ManageMaintenance; 