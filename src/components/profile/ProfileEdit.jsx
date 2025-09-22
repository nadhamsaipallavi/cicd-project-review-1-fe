import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Photo as PhotoIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Tab panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const ProfileEdit = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const userData = await authService.getUserProfile();
      console.log("Fetched user profile data:", userData);
      
      if (userData) {
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          bio: userData.bio || ''
        });
        
        // If there's a profile image URL
        if (userData.profileImage) {
          console.log("Setting avatar preview from profile image:", userData.profileImage);
          setAvatarPreview(userData.profileImage);
        }
      } else {
        console.warn("User data is empty or undefined");
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfileError('Failed to load profile. Please try again.');
      
      // Fallback to current user in localStorage if API fails
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          console.log("Using local storage user data as fallback:", currentUser);
          setProfileData({
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            email: currentUser.email || '',
            phoneNumber: currentUser.phoneNumber || '',
            address: currentUser.address || '',
            city: currentUser.city || '',
            state: currentUser.state || '',
            zipCode: currentUser.zipCode || '',
            bio: currentUser.bio || ''
          });
          
          if (currentUser.profileImage) {
            setAvatarPreview(currentUser.profileImage);
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
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

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Check file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setProfileError('Image size should not exceed 5MB');
        return;
      }
      
      // Create preview URL for displaying the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        console.log("Avatar preview set with file:", file.name);
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setProfileError("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      setProfileError('First name, last name, and email are required');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setProfileError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    setSuccess(null);
    
    if (!validateProfileForm()) {
      return;
    }
    
    setSavingProfile(true);
    
    try {
      console.log("Saving profile with data:", profileData);
      
      // Create FormData if avatar is being updated
      if (avatarFile) {
        const formData = new FormData();
        
        // Append all profile fields
        Object.keys(profileData).forEach(key => {
          if (profileData[key]) {
            formData.append(key, profileData[key]);
          }
        });
        
        // Append avatar file
        formData.append('avatar', avatarFile);
        
        await authService.updateUserProfileWithAvatar(formData);
      } else {
        // Regular profile update without avatar
        await authService.updateUserProfile(profileData);
      }
      
      setSuccess('Profile updated successfully');
      
      // Refresh local storage user data
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Refresh user data from the API
      await fetchUserProfile();
      
      // Clear success message after some time
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setSuccess(null);
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setSavingPassword(true);
    
    try {
      await authService.changePassword(passwordData);
      
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close password confirmation dialog
      setPasswordDialogOpen(false);
      
      // Clear success message after some time
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordDialogOpen = () => {
    if (validatePasswordForm()) {
      setPasswordDialogOpen(true);
    }
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Profile Information" id="profile-tab-0" aria-controls="profile-tabpanel-0" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Change Password" id="profile-tab-1" aria-controls="profile-tabpanel-1" icon={<LockIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mx: 3, mt: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSuccess(null)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        )}
        
        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          {profileError && <Alert severity="error" sx={{ mb: 3 }}>{profileError}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={avatarPreview}
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 2,
                fontSize: '2.5rem'
              }}
            >
              {!avatarPreview && profileData.firstName && profileData.lastName && 
                `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`}
            </Avatar>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoIcon />}
            >
              Change Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={profileData.firstName}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={profileData.lastName}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={profileData.email}
                onChange={handleProfileChange}
                type="email"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Address Information
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Street Address"
                value={profileData.address}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City"
                value={profileData.city}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="state"
                name="state"
                label="State"
                value={profileData.state}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="zipCode"
                name="zipCode"
                label="ZIP Code"
                value={profileData.zipCode}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="bio"
                name="bio"
                label="Bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                multiline
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Change Password Tab */}
        <TabPanel value={tabValue} index={1}>
          {passwordError && <Alert severity="error" sx={{ mb: 3 }}>{passwordError}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                type="password"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                type="password"
                helperText="Password must be at least 8 characters"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                type="password"
                error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LockIcon />}
                onClick={handlePasswordDialogOpen}
                disabled={savingPassword}
              >
                {savingPassword ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Password Confirmation Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handlePasswordDialogClose}
      >
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change your password? After changing, you'll need to use the new password for your next login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleChangePassword}
            startIcon={<CheckIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileEdit; 