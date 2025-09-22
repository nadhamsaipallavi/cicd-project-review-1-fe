import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import leaseService from '../../services/leaseService';
import propertyService from '../../services/propertyService';
import authService from '../../services/authService';

const LeaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: null,
    endDate: null,
    rentAmount: 0,
    depositAmount: 0,
    status: 'PENDING',
    paymentDueDay: 1,
    isPetAllowed: false,
    isUtilitiesIncluded: false,
    isAutoRenewal: false,
    notes: ''
  });
  
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [documentsToDelete, setDocumentsToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const leaseStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'TERMINATED', label: 'Terminated' },
    { value: 'RENEWAL', label: 'Renewal' }
  ];
  
  useEffect(() => {
    // Get current user for role checks
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Fetch properties and tenants
    fetchProperties();
    fetchTenants();
    
    // If editing, fetch the lease data
    if (isEditing) {
      fetchLeaseData();
    } else {
      setInitialLoading(false);
    }
  }, [id]);

  const fetchProperties = async () => {
    try {
      let response;
      // Fetch properties based on user role
      if (currentUser?.role === 'ADMIN') {
        response = await propertyService.getAllProperties();
      } else {
        response = await propertyService.getLandlordProperties();
      }
      
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      
      // Sample data for development
      setProperties([
        { id: '1', name: 'Luxury Downtown Apartment', address: '123 Main St, New York, NY 10001' },
        { id: '2', name: 'Modern Condo', address: '456 Park Ave, New York, NY 10022' },
        { id: '3', name: 'Suburban House', address: '789 Oak St, New Jersey, NJ 07001' }
      ]);
    }
  };
  
  const fetchTenants = async () => {
    try {
      // This would typically fetch tenants from the user service
      const response = await authService.getTenants(searchTerm);
      setTenants(response.data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      
      // Sample data for development
      setTenants([
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
        { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com' }
      ]);
    }
  };

  const fetchLeaseData = async () => {
    setInitialLoading(true);
    try {
      const response = await leaseService.getLeaseById(id);
      const lease = response.data;
      
      // Convert dates to Date objects for the date picker
      const startDate = lease.startDate ? new Date(lease.startDate) : null;
      const endDate = lease.endDate ? new Date(lease.endDate) : null;
      
      setFormData({
        propertyId: lease.propertyId || '',
        tenantId: lease.tenantId || '',
        startDate: startDate,
        endDate: endDate,
        rentAmount: lease.rentAmount || 0,
        depositAmount: lease.depositAmount || 0,
        status: lease.status || 'PENDING',
        paymentDueDay: lease.paymentDueDay || 1,
        isPetAllowed: lease.isPetAllowed || false,
        isUtilitiesIncluded: lease.isUtilitiesIncluded || false,
        isAutoRenewal: lease.isAutoRenewal || false,
        notes: lease.notes || ''
      });
      
      // Find the selected property
      if (lease.propertyId) {
        const property = properties.find(p => p.id === lease.propertyId);
        if (property) {
          setSelectedProperty(property);
        }
      }
      
      // Set documents if available
      if (lease.documents && lease.documents.length > 0) {
        setDocuments(lease.documents);
      }
    } catch (err) {
      console.error('Error fetching lease data:', err);
      setError('Failed to load lease data. Please try again.');
      
      // Sample data for development
      setFormData({
        propertyId: '1',
        tenantId: '1',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        rentAmount: 1500,
        depositAmount: 1500,
        status: 'ACTIVE',
        paymentDueDay: 1,
        isPetAllowed: true,
        isUtilitiesIncluded: false,
        isAutoRenewal: false,
        notes: 'Sample lease notes for development purposes.'
      });
      
      setDocuments([
        { id: '1', name: 'Lease_Agreement.pdf', uploadDate: '2023-01-01T10:00:00' },
        { id: '2', name: 'Property_Inspection.pdf', uploadDate: '2023-01-01T11:00:00' }
      ]);
      
      // Find the selected property
      const property = properties.find(p => p.id === '1');
      if (property) {
        setSelectedProperty(property);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? '' : Number(value);
    setFormData({ ...formData, [name]: numberValue });
  };
  
  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };
  
  const handlePropertyChange = (event, newValue) => {
    setSelectedProperty(newValue);
    setFormData({ ...formData, propertyId: newValue?.id || '' });
  };
  
  const handleTenantSearch = (event) => {
    setSearchTerm(event.target.value);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchTenants();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };
  
  const handleDocumentChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Create preview data for documents
      const newDocs = selectedFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString()
      }));
      
      setNewDocuments([...newDocuments, ...newDocs]);
    }
  };
  
  const handleRemoveDocument = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
    setDocumentsToDelete([...documentsToDelete, documentId]);
  };
  
  const handleRemoveNewDocument = (index) => {
    const updatedDocs = [...newDocuments];
    updatedDocs.splice(index, 1);
    setNewDocuments(updatedDocs);
  };

  const validateForm = () => {
    if (!formData.propertyId) {
      setError('Property selection is required');
      return false;
    }
    
    if (!formData.tenantId) {
      setError('Tenant selection is required');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Lease start date is required');
      return false;
    }
    
    if (!formData.endDate) {
      setError('Lease end date is required');
      return false;
    }
    
    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      return false;
    }
    
    if (formData.rentAmount <= 0) {
      setError('Rent amount must be greater than 0');
      return false;
    }
    
    if (formData.paymentDueDay < 1 || formData.paymentDueDay > 31) {
      setError('Payment due day must be between 1 and 31');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format dates for API
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
        endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null
      };
      
      // Create FormData for file uploads
      const formDataObj = new FormData();
      
      // Add lease data
      Object.keys(formattedData).forEach(key => {
        formDataObj.append(key, formattedData[key]);
      });
      
      // Add new documents
      newDocuments.forEach((doc) => {
        formDataObj.append('documents', doc.file);
      });
      
      // Add document IDs to delete
      if (documentsToDelete.length > 0) {
        formDataObj.append('documentsToDelete', JSON.stringify(documentsToDelete));
      }
      
      let response;
      if (isEditing) {
        response = await leaseService.updateLease(id, formDataObj);
      } else {
        response = await leaseService.createLease(formDataObj);
      }
      
      setSuccess(`Lease ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate after success
      setTimeout(() => {
        if (isEditing) {
          navigate(`/leases/${id}`);
        } else if (response.data && response.data.id) {
          navigate(`/leases/${response.data.id}`);
        } else {
          navigate('/leases');
        }
      }, 1500);
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} lease:`, err);
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} lease. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteLease = async () => {
    setLoading(true);
    
    try {
      await leaseService.terminateLease(id);
      setSuccess('Lease terminated successfully!');
      
      // Navigate after success
      setTimeout(() => {
        navigate('/leases');
      }, 1500);
    } catch (err) {
      console.error('Error terminating lease:', err);
      setError(err.response?.data?.message || 'Failed to terminate lease. Please try again.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Only landlords and admins can add/edit leases
  if (currentUser && (currentUser.role !== 'LANDLORD' && currentUser.role !== 'ADMIN')) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to {isEditing ? 'edit' : 'add'} leases.
        </Alert>
      </Container>
    );
  }

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DescriptionIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
            <Typography variant="h5">
              {isEditing ? 'Edit Lease' : 'Create New Lease'}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Property and Tenant Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Property and Tenant Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  options={properties}
                  getOptionLabel={(option) => `${option.name} - ${option.address}`}
                  value={selectedProperty}
                  onChange={handlePropertyChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Select Property"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="tenant-select-label">Select Tenant</InputLabel>
                  <Select
                    labelId="tenant-select-label"
                    id="tenantId"
                    name="tenantId"
                    value={formData.tenantId}
                    onChange={handleChange}
                    label="Select Tenant"
                    onOpen={() => fetchTenants()}
                  >
                    <MenuItem value="">
                      <em>Select a tenant</em>
                    </MenuItem>
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName} ({tenant.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Lease Terms */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Lease Terms
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} required fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} required fullWidth />
                  )}
                  minDate={formData.startDate}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="rentAmount"
                  name="rentAmount"
                  label="Monthly Rent"
                  type="number"
                  value={formData.rentAmount}
                  onChange={handleNumberChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="depositAmount"
                  name="depositAmount"
                  label="Security Deposit"
                  type="number"
                  value={formData.depositAmount}
                  onChange={handleNumberChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="paymentDueDay"
                  name="paymentDueDay"
                  label="Payment Due Day"
                  type="number"
                  value={formData.paymentDueDay}
                  onChange={handleNumberChange}
                  helperText="Day of the month when payment is due (1-31)"
                  InputProps={{
                    inputProps: { min: 1, max: 31 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="status-label">Lease Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Lease Status"
                  >
                    {leaseStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isPetAllowed}
                      onChange={handleChange}
                      name="isPetAllowed"
                    />
                  }
                  label="Pets Allowed"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isUtilitiesIncluded}
                      onChange={handleChange}
                      name="isUtilitiesIncluded"
                    />
                  }
                  label="Utilities Included in Rent"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isAutoRenewal}
                      onChange={handleChange}
                      name="isAutoRenewal"
                    />
                  }
                  label="Auto-Renewal (Lease will automatically renew if not terminated)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes or terms for the lease..."
                />
              </Grid>
              
              {/* Lease Documents */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Lease Documents
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleDocumentChange}
                  />
                </Button>
                
                {/* Existing Documents */}
                {documents.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Documents:
                    </Typography>
                    <List dense>
                      {documents.map((doc) => (
                        <ListItem key={doc.id}>
                          <ListItemText
                            primary={doc.name}
                            secondary={`Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDocument(doc.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {/* New Documents */}
                {newDocuments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      New Documents:
                    </Typography>
                    <List dense>
                      {newDocuments.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={doc.name}
                            secondary={`Size: ${(doc.size / 1024).toFixed(1)} KB`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveNewDocument(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Grid>
              
              {/* Submit Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Box>
                  {isEditing && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Terminate Lease
                    </Button>
                  )}
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update Lease' : 'Create Lease')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Lease Termination</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to terminate this lease? This will change the lease status to "Terminated".
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Warning: Terminating a lease may have legal implications. Make sure you have proper documentation and legal grounds for termination.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteLease} 
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Terminate Lease
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default LeaseForm; 