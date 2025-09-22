import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import propertyService from '../../services/propertyService';
import authService from '../../services/authService';
import leaseService from '../../services/leaseService';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Zoom
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import BuildIcon from '@mui/icons-material/Build';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';

const MaintenanceRequestForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyId: '',
    priority: 'MEDIUM'
  });
  const [properties, setProperties] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch tenant's properties on mount
  useEffect(() => {
    const fetchTenantLeases = async () => {
      setIsLoadingProperties(true);
      try {
        // Try to get tenant's active leases
        const leasesResponse = await leaseService.getTenantLeases();
        if (leasesResponse && Array.isArray(leasesResponse) && leasesResponse.length > 0) {
          // Extract unique properties from leases
          const leaseProperties = leasesResponse.map(lease => lease.property).filter(Boolean);
          setProperties(leaseProperties);
          
          // Set the first property as default if available
          if (leaseProperties.length > 0) {
            setFormData(prev => ({
              ...prev,
              propertyId: leaseProperties[0].id
            }));
          }
        } else {
          // Try to get single tenant lease as fallback
          try {
            const leaseResponse = await leaseService.getTenantLease();
            if (leaseResponse && leaseResponse.property) {
              setProperties([leaseResponse.property]);
              setFormData(prev => ({
                ...prev,
                propertyId: leaseResponse.property.id
              }));
            } else {
              // Fallback to sample data if needed
              setProperties([
                { id: 1, name: 'Sample Property', address: '123 Main St' }
              ]);
              setFormData(prev => ({
                ...prev,
                propertyId: 1
              }));
            }
          } catch (err) {
            console.error('Error fetching tenant lease', err);
            // Fallback to sample data
            setProperties([
              { id: 1, name: 'Sample Property', address: '123 Main St' }
            ]);
            setFormData(prev => ({
              ...prev,
              propertyId: 1
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching tenant leases', err);
        // Fallback to sample data
        setProperties([
          { id: 1, name: 'Sample Property', address: '123 Main St' }
        ]);
        setFormData(prev => ({
          ...prev,
          propertyId: 1
        }));
      } finally {
        setIsLoadingProperties(false);
      }
    };

    if (authService.isTenant()) {
      fetchTenantLeases();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5); // Limit to 5 images
    
    setImages(newImages);
    
    // Generate preview URLs for the images
    const newImagePreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newImagePreviewUrls = [...imagePreviewUrls];
    
    newImages.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return theme.palette.info.main;
      case 'MEDIUM':
        return theme.palette.warning.main;
      case 'HIGH':
        return theme.palette.error.main;
      case 'URGENT':
        return theme.palette.error.dark;
      default:
        return theme.palette.warning.main;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await maintenanceService.createMaintenanceRequest(formData, images);
      setSuccess('Maintenance request submitted successfully! Your landlord has been notified and will review your request.');
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        propertyId: formData.propertyId, // Keep the same property
        priority: 'MEDIUM'
      });
      setImages([]);
      setImagePreviewUrls([]);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/tenant/maintenance');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to submit maintenance request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            mt: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography 
                component="h1" 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                <BuildIcon sx={{ mr: 1, fontSize: '2rem' }} />
                Submit Maintenance Request
              </Typography>
            </motion.div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}
            
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ mt: 1, width: '100%' }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="title"
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Broken sink faucet"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon color="primary" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="description"
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Please describe the issue in detail..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <DescriptionIcon color="primary" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="property-label">Property</InputLabel>
                    <Select
                      labelId="property-label"
                      id="propertyId"
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      label="Property"
                      disabled={isLoadingProperties}
                      startAdornment={
                        <InputAdornment position="start">
                          <HomeIcon color="primary" />
                        </InputAdornment>
                      }
                      sx={{ 
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      {isLoadingProperties ? (
                        <MenuItem value="">
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : properties.length > 0 ? (
                        properties.map(property => (
                          <MenuItem key={property.id} value={property.id}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body1">{property.name || property.title || 'Property'}</Typography>
                              {property.address && (
                                <Typography variant="caption" color="text.secondary">
                                  {property.address}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          <Typography color="text.secondary">No properties available</Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      label="Priority"
                      startAdornment={
                        <InputAdornment position="start">
                          <PriorityHighIcon sx={{ color: getPriorityColor(formData.priority) }} />
                        </InputAdornment>
                      }
                      sx={{ 
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem value="LOW">
                        <Chip 
                          label="Low" 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.2), 
                            color: theme.palette.info.main,
                            fontWeight: 'bold',
                            mr: 1
                          }} 
                        />
                        Low Priority
                      </MenuItem>
                      <MenuItem value="MEDIUM">
                        <Chip 
                          label="Medium" 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.warning.main, 0.2), 
                            color: theme.palette.warning.main,
                            fontWeight: 'bold',
                            mr: 1
                          }} 
                        />
                        Medium Priority
                      </MenuItem>
                      <MenuItem value="HIGH">
                        <Chip 
                          label="High" 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.main, 0.2), 
                            color: theme.palette.error.main,
                            fontWeight: 'bold',
                            mr: 1
                          }} 
                        />
                        High Priority
                      </MenuItem>
                      <MenuItem value="URGENT">
                        <Chip 
                          label="Urgent" 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.dark, 0.2), 
                            color: theme.palette.error.dark,
                            fontWeight: 'bold',
                            mr: 1
                          }} 
                        />
                        Urgent Priority
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }}>
                    <Chip 
                      icon={<PhotoCamera />} 
                      label="Images (Optional)" 
                      sx={{ 
                        fontWeight: 'medium',
                        px: 1
                      }} 
                    />
                  </Divider>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        mb: 2, 
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2,
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                      disabled={images.length >= 5}
                    >
                      Upload Images
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={images.length >= 5}
                      />
                    </Button>
                  </motion.div>
                  
                  <Typography 
                    variant="caption" 
                    display="block" 
                    gutterBottom
                    sx={{ 
                      color: theme.palette.text.secondary,
                      ml: 1
                    }}
                  >
                    Max 5 images. Supported formats: JPG, PNG, GIF
                  </Typography>
                  
                  {imagePreviewUrls.length > 0 && (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.background.default, 0.7),
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      <Stack 
                        direction="row" 
                        spacing={2} 
                        sx={{ 
                          overflowX: 'auto', 
                          pb: 1,
                          px: 1
                        }}
                      >
                        {imagePreviewUrls.map((url, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.05, zIndex: 2 }}
                          >
                            <Tooltip title="Click to remove" TransitionComponent={Zoom} arrow>
                              <Box 
                                sx={{ 
                                  position: 'relative', 
                                  width: 120, 
                                  height: 120,
                                  flexShrink: 0,
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                                  '&:hover': {
                                    '& .delete-overlay': {
                                      opacity: 1
                                    }
                                  }
                                }}
                              >
                                <img 
                                  src={url} 
                                  alt={`Preview ${index}`} 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover'
                                  }} 
                                />
                                <Box 
                                  className="delete-overlay"
                                  onClick={() => handleRemoveImage(index)}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: alpha(theme.palette.common.black, 0.5),
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <DeleteIcon sx={{ color: 'white', fontSize: '2rem' }} />
                                </Box>
                              </Box>
                            </Tooltip>
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || isLoadingProperties || !formData.propertyId}
                    sx={{ 
                      py: 1.5, 
                      px: 6, 
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '&:hover': {
                        boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.6)}`
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Submit Request'}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default MaintenanceRequestForm; 