import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Button,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  House as HouseIcon,
  ListAlt as ListAltIcon,
  Payment as PaymentIcon,
  Build as BuildIcon,
  Mail as MailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import authService from '../../services/authService';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      
      // Sample data for development
      setNotifications([
        {
          id: 1,
          type: 'PROPERTY',
          message: 'New property has been added to your account',
          isRead: false,
          createdAt: '2023-07-15T10:30:00',
          link: '/properties/123'
        },
        {
          id: 2,
          type: 'MAINTENANCE',
          message: 'Maintenance request #1234 has been updated to "In Progress"',
          isRead: true,
          createdAt: '2023-07-14T14:45:00',
          link: '/maintenance/1234'
        },
        {
          id: 3,
          type: 'PAYMENT',
          message: 'Rent payment for July has been received',
          isRead: false,
          createdAt: '2023-07-13T09:15:00',
          link: '/payments/456'
        },
        {
          id: 4,
          type: 'LEASE',
          message: 'Your lease for 123 Main Street is expiring in 30 days',
          isRead: false,
          createdAt: '2023-07-12T16:20:00',
          link: '/leases/789'
        },
        {
          id: 5,
          type: 'MESSAGE',
          message: 'New message from your landlord regarding the upcoming inspection',
          isRead: true,
          createdAt: '2023-07-10T11:05:00',
          link: '/messages/101'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, notification) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      await authService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification. Please try again.');
    } finally {
      handleMenuClose();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await authService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    } finally {
      handleMenuClose();
    }
  };

  const markAllAsRead = async () => {
    try {
      await authService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications. Please try again.');
    }
  };

  const deleteAllRead = async () => {
    try {
      await authService.deleteAllReadNotifications();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => !notification.isRead)
      );
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      setError('Failed to delete notifications. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROPERTY':
        return <HouseIcon color="primary" />;
      case 'LEASE':
        return <ListAltIcon color="secondary" />;
      case 'PAYMENT':
        return <PaymentIcon style={{ color: '#4caf50' }} />;
      case 'MAINTENANCE':
        return <BuildIcon style={{ color: '#ff9800' }} />;
      case 'MESSAGE':
        return <MailIcon style={{ color: '#2196f3' }} />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Notifications
              {unreadCount > 0 && (
                <Badge
                  color="error"
                  badgeContent={unreadCount}
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ 
                mr: 1, 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={deleteAllRead}
              disabled={!notifications.some(n => n.isRead)}
            >
              Clear Read
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        )}
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.05)',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                  secondaryAction={
                    <IconButton edge="end" aria-label="more" onClick={(e) => handleMenuOpen(e, notification)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  button
                  component="a"
                  href={notification.link}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.isRead ? 'grey.300' : 'primary.light' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          color="text.primary"
                          sx={{ 
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            mr: 1
                          }}
                        >
                          {notification.message}
                        </Typography>
                        {!notification.isRead && (
                          <Chip 
                            label="New" 
                            size="small" 
                            color="primary" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        sx={{ display: 'block' }}
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Notification Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={() => markAsRead(selectedNotification.id)}>
            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as read
          </MenuItem>
        )}
        <MenuItem onClick={() => deleteNotification(selectedNotification?.id)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationList; 