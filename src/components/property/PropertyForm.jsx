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
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import propertyService from '../../services/propertyService';
import authService from '../../services/authService';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'APARTMENT',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 0,
    yearBuilt: new Date().getFullYear(),
    rentAmount: 0,
    depositAmount: 0,
    availableDate: '',
    status: 'AVAILABLE',
    amenities: [],
    isActive: true
  });
  
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'DUPLEX', label: 'Duplex' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'OFFICE', label: 'Office Space' },
    { value: 'RETAIL', label: 'Retail Space' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'RENTED', label: 'Rented' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'MAINTENANCE', label: 'Under Maintenance' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];
  
  const commonAmenities = [
    'Air Conditioning',
    'Heating',
    'Washer/Dryer',
    'Dishwasher',
    'Parking',
    'Garage',
    'Pool',
    'Gym',
    'Elevator',
    'Furnished',
    'Balcony',
    'Yard',
    'Pets Allowed',
    'Wheelchair Access',
    'Security System',
    'Internet Included',
    'Utilities Included',
    'Cable Ready'
  ];

  useEffect(() => {
    // Get current user for role checks
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // If this is an edit operation, fetch the property data
    if (isEditing) {
      fetchPropertyData();
    } else {
      setInitialLoading(false);
    }
  }, [id]);

  const fetchPropertyData = async () => {
    setInitialLoading(true);
    try {
      const property = await propertyService.getPropertyById(id);
      
      // Format dates for form inputs
      const availableDate = property.availableDate ? 
        new Date(property.availableDate).toISOString().split('T')[0] : '';
      
      setFormData({
        name: property.name || property.title || '',
        description: property.description || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        propertyType: property.propertyType || 'APARTMENT',
        bedrooms: property.bedrooms || property.numberOfBedrooms || 1,
        bathrooms: property.bathrooms || property.numberOfBathrooms || 1,
        squareFootage: property.squareFootage || property.totalArea || 0,
        yearBuilt: property.yearBuilt || new Date().getFullYear(),
        rentAmount: property.rentAmount || property.monthlyRent || 0,
        depositAmount: property.depositAmount || property.securityDeposit || 0,
        availableDate: availableDate,
        status: property.available ? 'AVAILABLE' : 'UNAVAILABLE',
        amenities: property.amenities || [],
        isActive: property.isActive !== undefined ? property.isActive : true
      });
      
      // Set images if available
      if (property.images && property.images.length > 0) {
        // Convert string URLs to image objects with IDs
        const imageObjects = property.images.map((url, index) => ({
          id: index,
          url: url
        }));
        setImages(imageObjects);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setError('Failed to load property data. Please try again.');
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

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit total images to 5 instead of 10
      if (images.length + newImages.length + selectedFiles.length > 5) {
        setError('Maximum 5 images allowed. Please remove some images first.');
        return;
      }
      
      // Create preview URLs for images
      const newImageFiles = selectedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      setNewImages([...newImages, ...newImageFiles]);
    }
  };
  
  const handleRemoveNewImage = (index) => {
    const updatedImages = [...newImages];
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(updatedImages[index].previewUrl);
    
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };
  
  const handleRemoveExistingImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      setImages(images.filter(img => img.id !== imageId));
      setImagesToDelete([...imagesToDelete, imageId]);
    }
  };
  
  const handleAddAmenity = () => {
    if (customAmenity && !formData.amenities.includes(customAmenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, customAmenity]
      });
      setCustomAmenity('');
    }
  };
  
  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };
  
  const handleSelectAmenity = (amenity) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('Property name is required');
      return false;
    }
    
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError('Complete address is required');
      return false;
    }
    
    if (formData.rentAmount <= 0) {
      setError('Rent amount must be greater than 0');
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
      // Create FormData if we have images
      const formDataObj = new FormData();
      
      // Add property data
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          // Handle arrays
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });
      
      let response;
      
      // First save/update the property without images
      if (isEditing) {
        response = await propertyService.updateProperty(id, formData);
      } else {
        response = await propertyService.createProperty(formData);
      }

      const propertyId = isEditing ? id : response.id;
      
      // Then handle images separately if we have new ones
      if (newImages.length > 0) {
        try {
          // Upload new images
          await propertyService.uploadPropertyImages(propertyId, newImages.map(img => img.file));
        } catch (imgError) {
          console.error("Error uploading property images:", imgError);
          setError("Property was saved but there was an error uploading images. Please try again.");
          setLoading(false);
          return;
        }
      }
      
      // Handle images to delete
      if (imagesToDelete.length > 0) {
        try {
          // Delete each image
          for (let i = 0; i < imagesToDelete.length; i++) {
            await propertyService.deletePropertyImage(propertyId, imagesToDelete[i]);
          }
        } catch (deleteError) {
          console.error("Error deleting property images:", deleteError);
          // Continue since the property was saved
        }
      }
      
      setSuccess(`Property ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate back to property list or details after a delay
      setTimeout(() => {
        if (isEditing) {
          navigate(`/properties/${id}`);
        } else {
          // If we created a new property, go to the list or the new property details
          if (propertyId) {
            navigate(`/properties/${propertyId}`);
          } else {
            navigate('/properties');
          }
        }
      }, 1500);
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} property:`, err);
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} property. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteProperty = async () => {
    setLoading(true);
    
    try {
      await propertyService.deleteProperty(id);
      setSuccess('Property deleted successfully!');
      
      // Navigate back to property list after a delay
      setTimeout(() => {
        navigate('/properties');
      }, 1500);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err.response?.data?.message || 'Failed to delete property. Please try again.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Only landlords and admins can add/edit properties
  if (currentUser && (currentUser.role !== 'LANDLORD' && currentUser.role !== 'ADMIN')) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to {isEditing ? 'edit' : 'add'} properties.
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HomeIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5">
            {isEditing ? 'Edit Property' : 'Add New Property'}
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
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Property Name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="property-type-label">Property Type</InputLabel>
                <Select
                  labelId="property-type-label"
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  label="Property Type"
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
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
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Property is active and visible to tenants"
              />
            </Grid>
            
            {/* Address Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="address"
                name="address"
                label="Street Address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="city"
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="state"
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="zipCode"
                name="zipCode"
                label="ZIP Code"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Property Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Property Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="bedrooms"
                name="bedrooms"
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleNumberChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="bathrooms"
                name="bathrooms"
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleNumberChange}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="squareFootage"
                name="squareFootage"
                label="Square Footage"
                type="number"
                value={formData.squareFootage}
                onChange={handleNumberChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="yearBuilt"
                name="yearBuilt"
                label="Year Built"
                type="number"
                value={formData.yearBuilt}
                onChange={handleNumberChange}
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            
            {/* Financial Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Financial Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
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
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="depositAmount"
                name="depositAmount"
                label="Security Deposit"
                type="number"
                value={formData.depositAmount}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="availableDate"
                name="availableDate"
                label="Available Date"
                type="date"
                value={formData.availableDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Amenities */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Amenities
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onDelete={() => handleRemoveAmenity(amenity)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  id="customAmenity"
                  label="Add Custom Amenity"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddAmenity}
                  disabled={!customAmenity}
                  sx={{ ml: 1 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Common Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {commonAmenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleSelectAmenity(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    variant={formData.amenities.includes(amenity) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Images */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Property Images
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Upload images of your property. You can upload up to 5 images.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  disabled={images.length + newImages.length >= 5}
                >
                  Add Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
              
              {/* Display existing images */}
              {images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Existing Images:
                  </Typography>
                  <ImageList cols={4} rowHeight={160} gap={8}>
                    {images.map((image) => (
                      <ImageListItem key={image.id}>
                        <img
                          src={image.url}
                          alt="Property"
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                          size="small"
                          onClick={() => handleRemoveExistingImage(image.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
              
              {/* Display new images */}
              {newImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    New Images:
                  </Typography>
                  <ImageList cols={4} rowHeight={160} gap={8}>
                    {newImages.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image.previewUrl}
                          alt={`New upload ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                          size="small"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
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
                    Delete Property
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
                  {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update Property' : 'Create Property')}
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
        <DialogTitle>Confirm Property Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Warning: Deleting this property will also remove all associated leases, maintenance requests, and payment records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteProperty} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyForm; 