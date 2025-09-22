import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { 
  FaUser, FaEnvelope, FaPhone, FaHome, FaLock, FaEdit, 
  FaSave, FaTimes, FaShieldAlt, FaIdCard, FaBuilding,
  FaCamera, FaTrash, FaUserTie, FaCalendarAlt
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: '',
    profileImage: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    
    try {
      // Initialize profile data from localStorage first
      const localUser = authService.getCurrentUser();
      if (localUser) {
        console.log("Initial profile data from localStorage:", localUser);
        setProfileData({
          id: localUser.id || '',
          firstName: localUser.firstName || '',
          lastName: localUser.lastName || '',
          email: localUser.email || '',
          phoneNumber: localUser.phoneNumber || '',
          address: localUser.address || '',
          role: localUser.role || '',
          profileImage: localUser.profileImage || ''
        });
      }
      
      // Then try API to get the latest data
      try {
        const response = await authService.getUserProfile();
        if (response) {
          console.log("Fetched profile data from API:", response);
          setProfileData(prevData => ({
            ...prevData,
            id: response.id || prevData.id,
            firstName: response.firstName || prevData.firstName,
            lastName: response.lastName || prevData.lastName,
            email: response.email || prevData.email,
            phoneNumber: response.phoneNumber || prevData.phoneNumber,
            address: response.address || prevData.address,
            role: response.role || prevData.role,
            profileImage: response.profileImage || prevData.profileImage
          }));
          
          // Update localStorage to keep it synced with server data
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              firstName: response.firstName || currentUser.firstName,
              lastName: response.lastName || currentUser.lastName,
              email: response.email || currentUser.email,
              phoneNumber: response.phoneNumber || currentUser.phoneNumber,
              address: response.address || currentUser.address,
              profileImage: response.profileImage || currentUser.profileImage
            };
            console.log("Updating localStorage with fresh API data:", updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (apiError) {
        console.error("Error fetching user profile from API:", apiError);
        console.warn("Using localStorage data as primary source");
        // Already loaded from localStorage, so just show a message
        if (error === '') {
          setError("Could not refresh profile data from server. Using saved data.");
          // Auto-hide error after 5 seconds
          setTimeout(() => setError(''), 5000);
        }
      }
    } catch (err) {
      console.error("Critical error in profile loading:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };
  
  const togglePasswordMode = () => {
    setIsChangingPassword(!isChangingPassword);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };
  
  const validateForm = () => {
    if (!profileData.firstName || !profileData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    
    if (profileData.phoneNumber && !/^\d{10,15}$/.test(profileData.phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };
  
  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare update data
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || ''
      };
      
      // If we have a photo preview, compress the image before sending
      if (photoPreview) {
        try {
          const compressedImage = await compressImageData(photoPreview);
          console.log("Image compressed successfully");
          updateData.profileImage = compressedImage;
        } catch (compressionError) {
          console.warn("Image compression failed, using original:", compressionError);
          updateData.profileImage = photoPreview;
        }
      } else if (photoPreview === '' && profileData.profileImage) {
        // Image explicitly removed
        updateData.profileImage = '';
      }
      
      setLoading(true);
      
      // Update profile through the Auth context
      console.log("Sending profile update with data:", updateData);
      const result = await updateUserProfile(updateData);
      
      if (result && result.success) {
        console.log("Profile updated successfully with result:", result);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setPhotoPreview('');
        
        // Make sure to update the local profile data with the updated user data
        if (result.user) {
          setProfileData(prevData => ({
            ...prevData,
            firstName: result.user.firstName || prevData.firstName,
            lastName: result.user.lastName || prevData.lastName,
            phoneNumber: result.user.phoneNumber,
            address: result.user.address,
            profileImage: result.user.profileImage || prevData.profileImage
          }));
        }
        
        // Fetch fresh user data
        await fetchUserProfile();
      } else {
        const errorMsg = result?.error || 'Failed to update profile. Please try again.';
        setError(errorMsg);
        console.error('Profile update failed:', errorMsg);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to compress image data
  const compressImageData = (dataUrl) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            // Calculate new dimensions (max 500px width or height)
            const maxDimension = 500;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxDimension) {
              height = Math.round(height * (maxDimension / width));
              width = maxDimension;
            } else if (height > maxDimension) {
              width = Math.round(width * (maxDimension / height));
              height = maxDimension;
            }
            
            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed data URL (JPEG at 80% quality)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          } catch (err) {
            console.error("Error compressing image:", err);
            reject(err);
          }
        };
        
        img.onerror = (err) => {
          console.error("Error loading image for compression:", err);
          reject(err);
        };
        
        img.src = dataUrl;
      } catch (err) {
        reject(err);
      }
    });
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to change password
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data || 
        err.message || 
        'Failed to change password. Please check your current password and try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Profile photo handling
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };
  
  const handlePhotoChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (jpeg, png, etc.)');
        return;
      }
      
      // Validate file size (max 1MB for better performance)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setError(`Image size should be less than 1MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      setIsUploading(true);
      setError(''); // Clear any previous errors
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imageData = e.target.result;
          setPhotoPreview(imageData);
          setIsUploading(false);
        } catch (err) {
          console.error('Error loading image data:', err);
          setError('Failed to process image data');
          setIsUploading(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setError('Failed to read file');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error in handlePhotoChange:', err);
      setError('An error occurred while processing your image');
      setIsUploading(false);
    }
  };
  
  const handleRemovePhoto = () => {
    try {
      // Set to empty string to indicate removal
      setPhotoPreview('');
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo');
    }
  };

  // Get role icon based on user's role
  const getRoleIcon = () => {
    switch(profileData.role) {
      case 'ADMIN':
        return <FaShieldAlt className="role-icon admin" />;
      case 'LANDLORD':
        return <FaBuilding className="role-icon landlord" />;
      case 'TENANT':
        return <FaHome className="role-icon tenant" />;
      default:
        return <FaUser className="role-icon" />;
    }
  };
  
  if (loading && !profileData.firstName) {
    return <div className="profile-loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-banner">
        <div className="profile-banner-content">
          <div className="profile-avatar-container">
            <div className="profile-avatar hover:shadow-lg transition-shadow duration-300">
              {photoPreview || profileData.profileImage ? (
                <img 
                  src={photoPreview || profileData.profileImage} 
                  alt={`${profileData.firstName} ${profileData.lastName}`} 
                  className="profile-image"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="profile-photo-actions">
                <button 
                  type="button" 
                  className="photo-action-btn edit"
                  onClick={handlePhotoClick}
                  disabled={isUploading}
                >
                  <FaCamera /> {isUploading ? 'Uploading...' : 'Change Photo'}
                </button>
                {(photoPreview || profileData.profileImage) && (
                  <button 
                    type="button" 
                    className="photo-action-btn remove"
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                  >
                    <FaTrash /> Remove
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          
          <div className="profile-banner-info">
            <h1>{profileData.firstName} {profileData.lastName}</h1>
            <div className="profile-banner-details">
              <span className="profile-banner-email">
                <FaEnvelope /> {profileData.email}
              </span>
              <span className={`role-badge ${profileData.role?.toLowerCase()}`}>
                {getRoleIcon()} {profileData.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2><FaIdCard className="card-icon" /> Personal Information</h2>
            {!isEditing ? (
              <button 
                className="btn btn-edit" 
                onClick={toggleEditMode}
                aria-label="Edit profile"
              >
                <FaEdit /> Edit
              </button>
            ) : (
              <button 
                className="btn btn-cancel" 
                onClick={toggleEditMode}
                aria-label="Cancel editing"
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>
          
          <div className="profile-card-body">
            {!isEditing ? (
              <div className="profile-info">
                <div className="profile-details">
                  <div className="profile-field">
                    <span className="profile-label"><FaUser /> Name:</span>
                    <span className="profile-value">{profileData.firstName} {profileData.lastName}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-label"><FaEnvelope /> Email:</span>
                    <span className="profile-value">{profileData.email}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-label"><FaPhone /> Phone:</span>
                    <span className="profile-value">
                      {profileData.phoneNumber ? profileData.phoneNumber : 'Not provided'}
                    </span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="profile-label"><FaHome /> Address:</span>
                    <span className="profile-value">
                      {profileData.address ? profileData.address : 'Not provided'}
                    </span>
                  </div>

                  <div className="profile-field">
                    <span className="profile-label"><FaUserTie /> Role:</span>
                    <span className="profile-value">{profileData.role}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    <FaUser /> First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    <FaUser /> Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={profileData.email}
                    disabled
                  />
                  <small className="form-text">Email cannot be changed</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    <FaPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="form-control"
                    value={profileData.phoneNumber || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    <FaHome /> Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    value={profileData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-save" disabled={loading}>
                    {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={toggleEditMode}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="profile-card">
          <div className="profile-card-header">
            <h2><FaLock className="card-icon" /> Security</h2>
            {!isChangingPassword ? (
              <button 
                className="btn btn-edit" 
                onClick={togglePasswordMode}
                aria-label="Change password"
              >
                <FaEdit /> Change
              </button>
            ) : (
              <button 
                className="btn btn-cancel" 
                onClick={togglePasswordMode}
                aria-label="Cancel password change"
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>
          
          <div className="profile-card-body">
            {!isChangingPassword ? (
              <div className="profile-info">
                <div className="profile-field">
                  <span className="profile-label"><FaLock /> Password:</span>
                  <span className="profile-value">••••••••</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  For security reasons, we recommend changing your password regularly. 
                  A strong password should include a mix of letters, numbers, and special characters.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    <FaLock /> Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    <FaLock /> New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <small className="form-text">Password must be at least 8 characters long</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <FaLock /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-save" disabled={loading}>
                    {loading ? 'Updating...' : <><FaSave /> Update Password</>}
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={togglePasswordMode}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 