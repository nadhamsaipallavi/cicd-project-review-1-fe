import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import propertyService from '../../services/propertyService';
import leaseService from '../../services/leaseService';
import maintenanceService from '../../services/maintenanceService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Description as DocumentIcon,
  Construction as ConstructionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  Build as BuildIcon,
  Add as AddIcon,
  DocumentScanner as LeaseIcon
} from '@mui/icons-material';

// Tab panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Status badges for maintenance requests
const MaintenanceStatusBadge = ({ status }) => {
  const statusColors = {
    NEW: { color: 'warning', icon: <ClockIcon fontSize="small" /> },
    IN_PROGRESS: { color: 'info', icon: <BuildIcon fontSize="small" /> },
    COMPLETED: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    CANCELLED: { color: 'error', icon: <WarningIcon fontSize="small" /> }
  };
  
  const statusConfig = statusColors[status] || statusColors.NEW;
  
  return (
    <Chip
      icon={statusConfig.icon}
      label={status.replace('_', ' ')}
      color={statusConfig.color}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [leases, setLeases] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const isLandlord = user?.role === 'LANDLORD';
  const isAdmin = user?.role === 'ADMIN';
  const isTenant = user?.role === 'TENANT';

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch property details
        let propertyData;
        if (isLandlord) {
          propertyData = await propertyService.getLandlordPropertyById(propertyId);
        } else if (isAdmin) {
          propertyData = await propertyService.getPropertyById(propertyId);
        } else if (isTenant) {
          propertyData = await propertyService.getTenantPropertyById(propertyId);
        }
        
        if (propertyData) {
          setProperty(propertyData);
        } else {
          setError('Property not found or you do not have access to view it.');
        }
        
        // Fetch leases for the property
        if ((isLandlord || isAdmin) && propertyData) {
          const leasesData = await leaseService.getLeasesByProperty(propertyId);
          setLeases(leasesData || []);
        }
        
        // Fetch maintenance requests for the property
        let maintenanceData;
        if (isLandlord || isAdmin) {
          maintenanceData = await maintenanceService.getMaintenanceRequestsByProperty(propertyId);
        } else if (isTenant) {
          maintenanceData = await maintenanceService.getTenantMaintenanceRequests();
          // Filter for only this property
          maintenanceData = maintenanceData.filter(req => req.propertyId === parseInt(propertyId));
        }
        setMaintenanceRequests(maintenanceData || []);
      } catch (err) {
        console.error('Error fetching property data:', err);
        setError('Failed to load property details. Please try again later.');
        
        // Sample data for development if API calls fail
        setProperty({
          id: parseInt(propertyId),
          name: 'Sunset Apartments',
          address: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          description: 'A beautiful apartment complex with modern amenities, located in a peaceful neighborhood with easy access to public transportation, shopping centers, and parks.',
          yearBuilt: 2010,
          squareFeet: 25000,
          numberOfUnits: 12,
          amenities: 'Swimming Pool, Fitness Center, Covered Parking, Elevator, Laundry Facilities',
          imageUrl: 'https://via.placeholder.com/800x400',
          landlord: {
            id: 5,
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael@example.com',
            phone: '555-123-4567'
          }
        });
        
        if (isLandlord || isAdmin) {
          setLeases([
            {
              id: 1,
              tenant: { firstName: 'John', lastName: 'Doe', id: 1, email: 'john@example.com', phone: '555-111-2222' },
              unit: '101',
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              monthlyRent: 1200.00,
              securityDeposit: 2400.00,
              status: 'ACTIVE'
            },
            {
              id: 2,
              tenant: { firstName: 'Jane', lastName: 'Smith', id: 2, email: 'jane@example.com', phone: '555-222-3333' },
              unit: '102',
              startDate: '2023-02-01',
              endDate: '2024-01-31',
              monthlyRent: 1300.00,
              securityDeposit: 2600.00,
              status: 'ACTIVE'
            }
          ]);
        }
        
        setMaintenanceRequests([
          {
            id: 1,
            title: 'Leaking Faucet',
            description: 'The kitchen sink faucet is leaking.',
            tenant: { firstName: 'John', lastName: 'Doe', id: 1 },
            status: 'NEW',
            priority: 'MEDIUM',
            createdAt: '2023-05-10T10:30:00Z'
          },
          {
            id: 2,
            title: 'Broken Light Switch',
            description: 'The light switch in the hallway is not working.',
            tenant: { firstName: 'Jane', lastName: 'Smith', id: 2 },
            status: 'IN_PROGRESS',
            priority: 'LOW',
            createdAt: '2023-05-15T14:45:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [propertyId, isLandlord, isAdmin, isTenant]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProperty = () => {
    navigate(`/landlord/properties/${propertyId}/edit`);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmation('');
  };

  const handleDeleteProperty = async () => {
    if (deleteConfirmation !== property.name) {
      return;
    }
    
    try {
      await propertyService.deleteProperty(propertyId);
      navigate('/landlord/properties');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again later.');
    } finally {
      handleDeleteDialogClose();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !property) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Property Header */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          position: 'relative',
          backgroundImage: property?.imageUrl ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3)), url(${property.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: property?.imageUrl ? 'white' : 'inherit',
          height: property?.imageUrl ? 250 : 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          p: 3
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {property?.name || property?.address}
            </Typography>
            
            {(isLandlord || isAdmin) && (
              <Box>
                <IconButton 
                  color="inherit" 
                  onClick={handleEditProperty}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                
                {isLandlord && (
                  <IconButton 
                    color="error" 
                    onClick={handleDeleteDialogOpen}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
          
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ mr: 1 }} />
            {property?.address}, {property?.city}, {property?.state} {property?.zipCode}
          </Typography>
          
          {(isLandlord || isAdmin) && (
            <Box sx={{ display: 'flex', mt: 2 }}>
              <Chip
                icon={<ApartmentIcon />}
                label={`${property?.numberOfUnits || 0} Units`}
                color="primary"
                sx={{ mr: 1, color: 'white', bgcolor: 'rgba(25, 118, 210, 0.7)' }}
              />
              
              <Chip
                icon={<PersonIcon />}
                label={`${leases?.filter(lease => lease.status === 'ACTIVE').length || 0} Tenants`}
                color="primary"
                sx={{ mr: 1, color: 'white', bgcolor: 'rgba(25, 118, 210, 0.7)' }}
              />
              
              <Chip
                icon={<ConstructionIcon />}
                label={`${maintenanceRequests?.filter(req => req.status !== 'COMPLETED').length || 0} Open Requests`}
                color="primary"
                sx={{ color: 'white', bgcolor: 'rgba(25, 118, 210, 0.7)' }}
              />
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Property Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="property tabs">
            <Tab label="Overview" id="property-tab-0" aria-controls="property-tabpanel-0" />
            {(isLandlord || isAdmin) && (
              <Tab label="Leases" id="property-tab-1" aria-controls="property-tabpanel-1" />
            )}
            <Tab label="Maintenance" id="property-tab-2" aria-controls="property-tabpanel-2" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  About This Property
                </Typography>
                <Typography variant="body1" paragraph>
                  {property?.description || 'No description available.'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Year Built
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {property?.yearBuilt || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Square Feet
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {property?.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Number of Units
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {property?.numberOfUnits || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Occupied Units
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {leases?.filter(lease => lease.status === 'ACTIVE').length || 0}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {property?.amenities ? 
                    property.amenities.split(',').map((amenity, index) => (
                      <Chip key={index} label={amenity.trim()} size="small" />
                    )) : 
                    <Typography variant="body1">No amenities listed.</Typography>
                  }
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Property Owner
                </Typography>
                
                {property?.landlord && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
                    >
                      {`${property.landlord.firstName.charAt(0)}${property.landlord.lastName.charAt(0)}`}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {`${property.landlord.firstName} ${property.landlord.lastName}`}
                      </Typography>
                      {(isAdmin || isLandlord) && (
                        <>
                          <Typography variant="body2">
                            {property.landlord.email}
                          </Typography>
                          <Typography variant="body2">
                            {property.landlord.phone}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                )}
                
                {isTenant && property?.landlord && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => navigate('/tenant/messages')}
                  >
                    Contact Landlord
                  </Button>
                )}
              </Paper>
              
              {isTenant && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Quick Actions
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/tenant/maintenance/new')}
                    startIcon={<ConstructionIcon />}
                  >
                    Submit Maintenance Request
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => navigate('/tenant/payments')}
                    startIcon={<MoneyIcon />}
                  >
                    Make a Payment
                  </Button>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Leases Tab */}
        {(isLandlord || isAdmin) && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate(`/landlord/properties/${propertyId}/leases/add`)}
              >
                Add New Lease
              </Button>
            </Box>
            
            {leases.length > 0 ? (
              <Grid container spacing={2}>
                {leases.map(lease => (
                  <Grid item xs={12} md={6} key={lease.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">
                            Unit {lease.unit}
                          </Typography>
                          <Chip 
                            label={lease.status} 
                            color={lease.status === 'ACTIVE' ? 'success' : 'default'} 
                            size="small"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
                          >
                            {lease.tenant?.firstName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {`${lease.tenant?.firstName} ${lease.tenant?.lastName}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {lease.tenant?.email} • {lease.tenant?.phone}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Start Date
                            </Typography>
                            <Typography variant="body1">
                              {lease.startDate}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              End Date
                            </Typography>
                            <Typography variant="body1">
                              {lease.endDate}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Monthly Rent
                            </Typography>
                            <Typography variant="body1">
                              ₹{lease.monthlyRent?.toFixed(2)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Security Deposit
                            </Typography>
                            <Typography variant="body1">
                              ₹{lease.securityDeposit?.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<LeaseIcon />}
                          onClick={() => navigate(`/landlord/leases/${lease.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/landlord/leases/${lease.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No leases found for this property.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/landlord/properties/${propertyId}/leases/add`)}
                >
                  Add New Lease
                </Button>
              </Paper>
            )}
          </TabPanel>
        )}
        
        {/* Maintenance Tab */}
        <TabPanel value={tabValue} index={isLandlord || isAdmin ? 2 : 1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {isTenant && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/tenant/maintenance/new')}
              >
                New Maintenance Request
              </Button>
            )}
          </Box>
          
          {maintenanceRequests.length > 0 ? (
            <Grid container spacing={2}>
              {maintenanceRequests.map(request => (
                <Grid item xs={12} md={6} key={request.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">
                          {request.title}
                        </Typography>
                        <MaintenanceStatusBadge status={request.status} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Submitted {new Date(request.createdAt).toLocaleDateString()} • Priority: {request.priority}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body1" paragraph>
                        {request.description}
                      </Typography>
                      
                      {(isLandlord || isAdmin) && request.tenant && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Reported by:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {`${request.tenant.firstName} ${request.tenant.lastName}`}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => isLandlord || isAdmin ? 
                          navigate(`/landlord/maintenance/${request.id}`) : 
                          navigate(`/tenant/maintenance/${request.id}`)}
                      >
                        View Details
                      </Button>
                      
                      {(isLandlord || isAdmin) && request.status === 'NEW' && (
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => navigate(`/landlord/maintenance/${request.id}/update`)}
                        >
                          Update Status
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No maintenance requests found for this property.
              </Typography>
              {isTenant && (
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/tenant/maintenance/new')}
                >
                  New Maintenance Request
                </Button>
              )}
            </Paper>
          )}
        </TabPanel>
      </Box>
      
      {/* Delete Property Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Property Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete this property? This action cannot be undone and will affect all associated leases and maintenance requests.
          </Typography>
          <Typography variant="body1" paragraph>
            To confirm, please type the property name: <strong>{property?.name}</strong>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type property name to confirm"
            variant="outlined"
            error={deleteConfirmation !== '' && deleteConfirmation !== property?.name}
            helperText={deleteConfirmation !== '' && deleteConfirmation !== property?.name ? 'Property name does not match' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteProperty}
            color="error" 
            disabled={deleteConfirmation !== property?.name}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyDetails; 