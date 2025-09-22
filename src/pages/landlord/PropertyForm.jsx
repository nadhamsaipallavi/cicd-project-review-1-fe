import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBuilding, FaHome, FaMapMarkerAlt, FaRulerCombined, 
  FaBed, FaBath, FaRupeeSign, FaCalendarAlt, FaList,
  FaSave, FaTimes, FaCamera, FaUpload, FaTrash, FaBug
} from 'react-icons/fa';
import propertyService from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { enableMockDataMode } from '../../utils/mockData';
import './PropertyForm.css';

const PropertyForm = () => {
  const { isLandlord } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);
  const multipleFileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [property, setProperty] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    propertyType: '',
    listingType: 'FOR_RENT',
    totalArea: '',
    numberOfBedrooms: '',
    numberOfBathrooms: '',
    monthlyRent: '',
    salePrice: '',
    securityDeposit: '',
    availableFrom: '',
    available: true,
    active: true,
    amenities: [],
    images: []
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(5);
  
  useEffect(() => {
    // Redirect if not a landlord
    const checkLandlordStatus = typeof isLandlord === 'function' ? isLandlord() : isLandlord;
    if (!checkLandlordStatus) {
      navigate('/login');
      return;
    }
    
    // If editing, fetch the property
    const fetchProperty = async () => {
      if (isEditing) {
        try {
          setLoadingProperty(true);
          console.log(`Fetching property with ID: ${id}`);
          const data = await propertyService.getPropertyById(id);
          
          if (!data) {
            throw new Error('No property data returned from API');
          }
          
          console.log('Property data received:', data);
          setProperty({
            ...data,
            title: data.title || '',
            description: data.description || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            propertyType: data.propertyType || '',
            availableFrom: data.availableFrom ? data.availableFrom.substring(0, 10) : '',
            totalArea: data.totalArea || '',
            numberOfBedrooms: data.numberOfBedrooms || '',
            numberOfBathrooms: data.numberOfBathrooms || '',
            securityDeposit: data.securityDeposit || '',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            images: Array.isArray(data.images) ? data.images : []
          });
        } catch (err) {
          console.error('Error fetching property:', err);
          setError('Failed to load property. ' + (err.message || 'Please try again or enable mock mode for testing.'));
          
          // If in development mode, suggest enabling mock mode
          const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isDevelopment) {
            console.log('Development mode detected. You can enable mock mode to test the form.');
          }
        } finally {
          setLoadingProperty(false);
        }
      }
    };
    
    fetchProperty();
  }, [id, isEditing, isLandlord, navigate]);
  
  useEffect(() => {
    // Calculate remaining image slots whenever property.images changes
    if (property && property.images) {
      const slots = 5 - property.images.length;
      setRemainingSlots(slots > 0 ? slots : 0);
    } else {
      setRemainingSlots(5);
    }
  }, [property.images]);
  
  const propertyTypes = [
    'APARTMENT',
    'HOUSE',
    'CONDO',
    'TOWNHOUSE',
    'STUDIO',
    'DUPLEX',
    'TRIPLEX',
    'FOURPLEX',
    'COMMERCIAL',
    'INDUSTRIAL',
    'LAND'
  ];
  
  const listingTypes = [
    { value: 'FOR_RENT', label: 'For Rent' },
    { value: 'FOR_SALE', label: 'For Sale' },
    { value: 'BOTH', label: 'For Rent & Sale' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProperty(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string or numeric values
    if (value === '' || !isNaN(value)) {
      setProperty(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleAmenityAdd = (e) => {
    e.preventDefault();
    if (newAmenity.trim()) {
      setProperty(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };
  
  const handleAmenityRemove = (index) => {
    setProperty(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };
  
  // Image handling
  const handleImageClick = () => {
    if (remainingSlots <= 0) {
      setError('Maximum number of images (5) already reached. Please delete some images first.');
      return;
    }
    fileInputRef.current.click();
  };
  
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Clear any previous errors
    setError('');
    
    // Check if we're exceeding the limit
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s). ${files.length} selected.`);
      return;
    }
    
    // Validate files
    const validFiles = [];
    const invalidFiles = [];
    
    for (const file of files) {
      // Validate file type
      if (!file.type.match('image.*')) {
        invalidFiles.push(`${file.name} is not an image file`);
        continue;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (invalidFiles.length > 0) {
      setError(`Some files couldn't be added: ${invalidFiles.join(', ')}`);
    }
    
    if (validFiles.length === 0) return;
    
    try {
      setImageUploading(true);
      
      // For single file upload, set preview
      if (validFiles.length === 1) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(validFiles[0]);
      } else {
        // For multiple files, store them for batch upload
        setMultipleFiles(validFiles);
        // Clear any single file preview
        setImagePreview('');
      }
      
      setImageUploading(false);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process the images');
      setImageUploading(false);
    }
  };
  
  const handleImageUpload = async () => {
    if (!imagePreview && multipleFiles.length === 0) return;
    
    try {
      setImageUploading(true);
      setError('');
      
      // Provide information about the upload process
      setSuccess('Uploading image(s) to Cloudinary...');
      
      // Single image upload
      if (imagePreview && !multipleFiles.length) {
        try {
          const imageUrl = await propertyService.uploadPropertyImage(imagePreview);
          
          // Add to images array
          setProperty(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
          
          // Reset preview
          setImagePreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          setSuccess('Image uploaded successfully to Cloudinary!');
          
          // Save property with updated images to database
          if (isEditing && property.id) {
            const updatedPropertyData = {
              ...property,
              images: [...property.images, imageUrl]
            };
            await propertyService.updateProperty(id, updatedPropertyData);
            setSuccess('Image uploaded and saved to database successfully!');
          }
        } catch (err) {
          console.warn('Error in single image upload:', err);
          setError('Image upload encountered an issue, but we\'ve added a placeholder instead.');
          
          // Still add a placeholder image to allow the user to continue
          const placeholderUrl = propertyService.getPlaceholderImageUrl();
          setProperty(prev => ({
            ...prev,
            images: [...prev.images, placeholderUrl]
          }));
        }
      } 
      // Multiple image upload
      else if (multipleFiles.length > 0) {
        try {
          setUploadProgress(10); // Show initial progress
          
          // If we're editing an existing property, use the property ID for direct upload
          if (isEditing && property.id) {
            const result = await propertyService.uploadPropertyImages(property.id, multipleFiles);
            setUploadProgress(100); // Complete progress
            
            if (result && result.imageUrls) {
              // Add all URLs to the property images
              setProperty(prev => ({
                ...prev,
                images: [...prev.images, ...result.imageUrls]
              }));
              
              // Reset file input and progress
              if (multipleFileInputRef.current) {
                multipleFileInputRef.current.value = '';
              }
              setMultipleFiles([]);
              setSuccess(`${result.imageUrls.length} images uploaded successfully. ${result.message || ''}`);
              
              // No need to manually update the database here as the backend API already does this
            } else {
              setError('Unexpected response format from image upload service.');
            }
          } else {
            // For new properties, we need to upload the images first and then save them with the property later
            const uploadedUrls = [];
            
            // Upload each file individually
            for (const file of multipleFiles) {
              const reader = new FileReader();
              const imagePromise = new Promise((resolve) => {
                reader.onload = async (e) => {
                  const base64Data = e.target.result;
                  const imageUrl = await propertyService.uploadPropertyImage(base64Data);
                  resolve(imageUrl);
                };
              });
              reader.readAsDataURL(file);
              uploadedUrls.push(await imagePromise);
            }
            
            // Add all URLs to the property images
            setProperty(prev => ({
              ...prev,
              images: [...prev.images, ...uploadedUrls]
            }));
            
            // Reset file input and progress
            if (multipleFileInputRef.current) {
              multipleFileInputRef.current.value = '';
            }
            setMultipleFiles([]);
            setSuccess(`${uploadedUrls.length} images uploaded successfully.`);
          }
        } catch (err) {
          console.warn('Error in multiple image upload:', err);
          setError('Image upload service encountered an issue, but we\'ve added placeholders instead.');
          
          // Still add placeholder images to allow the user to continue
          const placeholderUrls = multipleFiles.map(() => propertyService.getPlaceholderImageUrl());
          setProperty(prev => ({
            ...prev,
            images: [...prev.images, ...placeholderUrls]
          }));
        }
      }
      
      // Reset upload state
      setUploadProgress(0);
      setImageUploading(false);
    } catch (error) {
      console.error('Error during image upload process:', error);
      setError('There was a problem with the image upload. Placeholders have been used instead.');
      setImageUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleImageRemove = async (index) => {
    // First update the local state
    setProperty(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // If we're editing an existing property, update it in the database
    if (isEditing && id) {
      try {
        setLoading(true);
        
        // Get the updated images array
        const updatedImages = property.images.filter((_, i) => i !== index);
        
        // Create updated property data
        const updatedPropertyData = {
          ...property,
          images: updatedImages
        };
        
        // Save to database
        await propertyService.updateProperty(id, updatedPropertyData);
        setSuccess('Image removed and changes saved to database.');
      } catch (err) {
        console.error('Error saving image removal to database:', err);
        setError('Image was removed from view but there was an error saving this change to the database.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleCancelImagePreview = () => {
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const validateForm = () => {
    if (!property.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!property.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!property.address.trim() || !property.city.trim() || !property.state.trim()) {
      setError('Address, city, and state are required');
      return false;
    }
    
    if (!property.propertyType) {
      setError('Property type is required');
      return false;
    }
    
    if (!property.monthlyRent) {
      setError('Monthly rent is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Convert numeric fields to numbers
      const propertyData = {
        ...property,
        totalArea: property.totalArea ? parseFloat(property.totalArea) : null,
        numberOfBedrooms: property.numberOfBedrooms ? parseInt(property.numberOfBedrooms, 10) : null,
        numberOfBathrooms: property.numberOfBathrooms ? parseInt(property.numberOfBathrooms, 10) : null,
        monthlyRent: parseFloat(property.monthlyRent),
        securityDeposit: property.securityDeposit ? parseFloat(property.securityDeposit) : null,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        images: Array.isArray(property.images) ? property.images : []
      };
      
      console.log('Submitting property data:', propertyData);
      
      let response;
      if (isEditing) {
        response = await propertyService.updateProperty(id, propertyData);
        setSuccess('Property updated successfully!');
      } else {
        response = await propertyService.createProperty(propertyData);
        setSuccess('Property created successfully!');
      }
      
      // Wait a moment to show success message then redirect
      setTimeout(() => {
        navigate('/landlord/properties');
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting property:', err);
      setError(err.response?.data?.message || 'Failed to save property. Please check your internet connection and try again.');
      
      // If in development mode, enable mock mode to help testing
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDevelopment && err.response?.status === 403) {
        setError('Permission denied. You may want to enable mock mode for testing this functionality.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingProperty) {
    return (
      <div className="property-form-container">
        <div className="loading-indicator">Loading property data...</div>
      </div>
    );
  }
  
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Function to enable mock mode
  const enableMockMode = () => {
    enableMockDataMode();
    window.location.reload();
  };
  
  return (
    <div className="property-form-container">
      <div className="property-form-header">
        <h1>{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
        {isDevelopment && (
          <div className="controls">
            <button
              onClick={enableMockMode}
              className="debug-btn"
              title="Enable Mock Mode for Testing"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px dashed #ccc',
                borderRadius: '50%',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <FaBug style={{ color: localStorage.getItem('MOCK_API') === 'true' ? '#4CAF50' : '#ccc' }} />
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          {isDevelopment && (
            <button 
              onClick={enableMockMode} 
              className="mock-mode-btn"
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Enable Mock Mode for Testing
            </button>
          )}
        </div>
      )}
      {success && <div className="success-message">{success}</div>}
      
      <form className="property-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2><FaHome /> Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">
              Property Title <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={property.title}
              onChange={handleInputChange}
              placeholder="e.g., Cozy 2-Bedroom Apartment in Downtown"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={property.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of your property"
              rows="4"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="propertyType">
              Property Type <span className="required">*</span>
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={property.propertyType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select property type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toLowerCase()}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="listingType">
              Listing Type <span className="required">*</span>
            </label>
            <select
              id="listingType"
              name="listingType"
              value={property.listingType}
              onChange={handleInputChange}
              required
            >
              {listingTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h2><FaMapMarkerAlt /> Location</h2>
          
          <div className="form-group">
            <label htmlFor="address">
              Address <span className="required">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={property.address}
              onChange={handleInputChange}
              placeholder="Street address"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">
                City <span className="required">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={property.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">
                State <span className="required">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={property.state}
                onChange={handleInputChange}
                placeholder="State"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2><FaRulerCombined /> Property Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalArea">
                Total Area (sq.ft)
              </label>
              <input
                id="totalArea"
                name="totalArea"
                type="text"
                value={property.totalArea}
                onChange={handleNumberInputChange}
                placeholder="e.g., 1200"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="numberOfBedrooms">
                Bedrooms
              </label>
              <input
                id="numberOfBedrooms"
                name="numberOfBedrooms"
                type="text"
                value={property.numberOfBedrooms}
                onChange={handleNumberInputChange}
                placeholder="e.g., 2"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="numberOfBathrooms">
                Bathrooms
              </label>
              <input
                id="numberOfBathrooms"
                name="numberOfBathrooms"
                type="text"
                value={property.numberOfBathrooms}
                onChange={handleNumberInputChange}
                placeholder="e.g., 1.5"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2><FaRupeeSign /> Pricing Details</h2>
          
          {(property.listingType === 'FOR_RENT' || property.listingType === 'BOTH') && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="monthlyRent">
                  Monthly Rent (₹) <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FaRupeeSign className="input-icon" />
                  <input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="text"
                    value={property.monthlyRent}
                    onChange={handleNumberInputChange}
                    placeholder="e.g., 15000"
                    required={property.listingType === 'FOR_RENT' || property.listingType === 'BOTH'}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="securityDeposit">
                  Security Deposit (₹)
                </label>
                <div className="input-with-icon">
                  <FaRupeeSign className="input-icon" />
                  <input
                    id="securityDeposit"
                    name="securityDeposit"
                    type="text"
                    value={property.securityDeposit}
                    onChange={handleNumberInputChange}
                    placeholder="e.g., 30000"
                  />
                </div>
              </div>
            </div>
          )}
          
          {(property.listingType === 'FOR_SALE' || property.listingType === 'BOTH') && (
            <div className="form-group">
              <label htmlFor="salePrice">
                Sale Price (₹) <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FaRupeeSign className="input-icon" />
                <input
                  id="salePrice"
                  name="salePrice"
                  type="text"
                  value={property.salePrice}
                  onChange={handleNumberInputChange}
                  placeholder="e.g., 5000000"
                  required={property.listingType === 'FOR_SALE' || property.listingType === 'BOTH'}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="availableFrom">
              Available From
            </label>
            <input
              id="availableFrom"
              name="availableFrom"
              type="date"
              value={property.availableFrom}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2><FaList /> Amenities</h2>
          
          <div className="amenities-input">
            <div className="form-row">
              <div className="form-group amenity-add-group">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  placeholder="e.g., Swimming Pool"
                />
                <button
                  type="button"
                  className="amenity-add-btn"
                  onClick={handleAmenityAdd}
                  disabled={!newAmenity.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          
          {(property.amenities && property.amenities.length > 0) && (
            <div className="amenities-list">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    className="amenity-remove-btn"
                    onClick={() => handleAmenityRemove(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2><FaCamera /> Property Images</h2>
          
          <div className="image-upload-section">
            <h3>Property Images</h3>
            <p>Upload images of your property. You can upload up to 5 images.</p>
            
            {remainingSlots > 0 ? (
              <p>You can upload {remainingSlots} more image(s).</p>
            ) : (
              <p className="error-text">Maximum number of images reached. Delete some images to upload more.</p>
            )}
            
            {/* Preview section */}
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <div className="image-actions">
                  <button 
                    type="button" 
                    className="image-action-btn upload"
                    onClick={handleImageUpload}
                    disabled={imageUploading}
                  >
                    <FaUpload /> {imageUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button 
                    type="button" 
                    className="image-action-btn delete"
                    onClick={handleCancelImagePreview}
                    disabled={imageUploading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Multiple files info */}
            {multipleFiles.length > 0 && (
              <div className="multiple-files-info">
                <p>{multipleFiles.length} files selected for upload</p>
                {uploadProgress > 0 && (
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                )}
                <div className="image-actions">
                  <button 
                    type="button" 
                    className="image-action-btn upload"
                    onClick={handleImageUpload}
                    disabled={imageUploading}
                  >
                    <FaUpload /> {imageUploading ? 'Uploading...' : 'Upload All'}
                  </button>
                  <button 
                    type="button" 
                    className="image-action-btn delete"
                    onClick={() => {
                      setMultipleFiles([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={imageUploading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Upload placeholder */}
            {!imagePreview && multipleFiles.length === 0 && remainingSlots > 0 && (
              <div className="image-upload-placeholder" onClick={handleImageClick}>
                <FaCamera />
                <p>Click to select {remainingSlots > 1 ? 'images' : 'an image'}</p>
                <p className="small">You can select up to {remainingSlots} images at once</p>
              </div>
            )}
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
              accept="image/*"
              multiple={remainingSlots > 1}
            />
            
            {/* Existing images */}
            {property.images && property.images.length > 0 && (
              <div className="existing-images">
                <h4>Uploaded Images</h4>
                <div className="images-grid">
                  {property.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image} alt={`Property ${index + 1}`} />
                      <button 
                        type="button" 
                        className="image-action-btn delete"
                        onClick={() => handleImageRemove(index)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/landlord/properties')}
            disabled={loading}
          >
            <FaTimes /> Cancel
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm; 