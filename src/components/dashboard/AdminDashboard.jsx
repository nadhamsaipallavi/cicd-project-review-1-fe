import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  AttachMoney as MoneyIcon,
  Description as DocumentIcon,
  Construction as ConstructionIcon,
  Apartment as ApartmentIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  Build as BuildIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

import leaseService from '../../services/leaseService';
import paymentService from '../../services/paymentService';
import maintenanceService from '../../services/maintenanceService';
import propertyService from '../../services/propertyService';
import authService from '../../services/authService';

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

const StatCard = ({ title, value, subtitle, icon, color }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 160,
        background: color,
        color: 'white'
      }}
    >
      <Typography component="h2" variant="h6" color="inherit" gutterBottom>
        {icon}
        {title}
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Typography component="p" variant="h3" color="inherit">
          {value}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="inherit" sx={{ mt: 'auto' }}>
        {subtitle}
      </Typography>
    </Paper>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    properties: 0,
    landlords: 0,
    tenants: 0,
    pendingApprovals: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    yearToDate: 0,
    percentChange: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch system statistics
        const statsResponse = await authService.getAdminStats();
        if (statsResponse) {
          setStats(statsResponse);
        }
        
        // Fetch recent properties
        const propertiesData = await propertyService.getAllProperties(1, 5); // First page, 5 items
        if (propertiesData && propertiesData.content) {
          setRecentProperties(propertiesData.content);
        }
        
        // Fetch recent users
        const usersData = await authService.getAllUsers(1, 5); // First page, 5 items
        if (usersData && usersData.content) {
          setRecentUsers(usersData.content);
        }
        
        // Fetch revenue statistics
        const revenueData = await paymentService.getAdminRevenueStats();
        if (revenueData) {
          setRevenueStats(revenueData);
        }
        
        // Fetch recent payments
        const paymentsData = await paymentService.getAllPayments(1, 5); // First page, 5 items
        if (paymentsData && paymentsData.content) {
          setRecentPayments(paymentsData.content);
        }
        
        // Fetch maintenance requests
        const maintenanceData = await maintenanceService.getAllMaintenanceRequests(1, 5); // First page, 5 items
        if (maintenanceData && maintenanceData.content) {
          setMaintenanceRequests(maintenanceData.content);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Sample data for development if API calls fail
        setStats({
          properties: 25,
          landlords: 8,
          tenants: 42,
          pendingApprovals: 3
        });
        
        setRecentProperties([
          {
            id: 1,
            name: 'Sunset Apartments',
            address: '123 Main Street',
            city: 'Springfield',
            state: 'IL',
            landlord: { firstName: 'Michael', lastName: 'Johnson', id: 5 },
            units: 12,
            createdAt: '2023-04-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Mountain View Condos',
            address: '456 Oak Avenue',
            city: 'Springfield',
            state: 'IL',
            landlord: { firstName: 'Sarah', lastName: 'Williams', id: 6 },
            units: 6,
            createdAt: '2023-05-02T14:15:00Z'
          }
        ]);
        
        setRecentUsers([
          {
            id: 10,
            firstName: 'Emma',
            lastName: 'Davis',
            email: 'emma@example.com',
            role: 'TENANT',
            createdAt: '2023-05-10T09:00:00Z'
          },
          {
            id: 11,
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david@example.com',
            role: 'LANDLORD',
            createdAt: '2023-05-08T11:30:00Z'
          }
        ]);
        
        setRevenueStats({
          thisMonth: 58500.00,
          lastMonth: 54800.00,
          yearToDate: 280000.00,
          percentChange: 6.75
        });
        
        setRecentPayments([
          {
            id: 1,
            amount: 1200.00,
            description: 'Monthly Rent',
            tenant: { firstName: 'John', lastName: 'Doe', id: 1 },
            property: { name: 'Sunset Apartments', id: 1 },
            landlord: { firstName: 'Michael', lastName: 'Johnson', id: 5 },
            paymentDate: '2023-05-01',
            status: 'COMPLETED'
          },
          {
            id: 2,
            amount: 1100.00,
            description: 'Monthly Rent',
            tenant: { firstName: 'Jane', lastName: 'Smith', id: 2 },
            property: { name: 'Sunset Apartments', id: 1 },
            landlord: { firstName: 'Michael', lastName: 'Johnson', id: 5 },
            paymentDate: '2023-05-02',
            status: 'COMPLETED'
          }
        ]);
        
        setMaintenanceRequests([
          {
            id: 1,
            title: 'Leaking Faucet',
            description: 'The kitchen sink faucet is leaking.',
            property: { name: 'Sunset Apartments', id: 1 },
            tenant: { firstName: 'John', lastName: 'Doe', id: 1 },
            status: 'NEW',
            priority: 'MEDIUM',
            createdAt: '2023-05-10T10:30:00Z'
          },
          {
            id: 2,
            title: 'Broken Light Switch',
            description: 'The light switch in the hallway is not working.',
            property: { name: 'Mountain View Condos', id: 2 },
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
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        
        {stats.pendingApprovals > 0 && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<NotificationsIcon />}
            onClick={() => navigate('/admin/approvals')}
          >
            {stats.pendingApprovals} Pending Approvals
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Property Stats */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Properties"
            value={stats.properties}
            subtitle="Total properties in the system"
            icon={<ApartmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
            color="linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)"
          />
        </Grid>
        
        {/* Landlord Stats */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Landlords"
            value={stats.landlords}
            subtitle="Registered landlords"
            icon={<PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
            color="linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)"
          />
        </Grid>
        
        {/* Tenant Stats */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Tenants"
            value={stats.tenants}
            subtitle="Registered tenants"
            icon={<PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
            color="linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)"
          />
        </Grid>
        
        {/* Revenue Stats */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 160,
              background: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
              color: 'white'
            }}
          >
            <Typography component="h2" variant="h6" color="inherit" gutterBottom>
              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Monthly Revenue
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography component="p" variant="h3" color="inherit">
                ₹{revenueStats.thisMonth.toFixed(0)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Chip
                  icon={revenueStats.percentChange >= 0 ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                  label={`${Math.abs(revenueStats.percentChange).toFixed(1)}%`}
                  color={revenueStats.percentChange >= 0 ? 'success' : 'error'}
                  sx={{ 
                    backgroundColor: revenueStats.percentChange >= 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  size="small"
                />
              </Box>
            </Box>
            
            <Typography variant="body2" color="inherit" sx={{ mt: 'auto' }}>
              YTD: ₹{revenueStats.yearToDate.toFixed(0)} | Last Month: ₹{revenueStats.lastMonth.toFixed(0)}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Properties */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              overflow: 'hidden'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              <ApartmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Properties
            </Typography>
            
            {recentProperties.length > 0 ? (
              <>
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Landlord</TableCell>
                        <TableCell>Units</TableCell>
                        <TableCell>Date Added</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentProperties.map((property) => (
                        <TableRow key={property.id} hover onClick={() => navigate(`/admin/properties/${property.id}`)} sx={{ cursor: 'pointer' }}>
                          <TableCell>{property.name || 'Unnamed Property'}</TableCell>
                          <TableCell>{`${property.city}, ${property.state}`}</TableCell>
                          <TableCell>{`${property.landlord?.firstName || ''} ${property.landlord?.lastName || ''}`}</TableCell>
                          <TableCell>{property.units || 1}</TableCell>
                          <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/admin/properties')}
                  >
                    View All Properties
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No properties available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              overflow: 'hidden'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Users
            </Typography>
            
            {recentUsers.length > 0 ? (
              <>
                <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                  {recentUsers.map(user => (
                    <ListItem
                      key={user.id}
                      sx={{ py: 1 }}
                      secondaryAction={
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'ADMIN' ? 'error' : 
                            user.role === 'LANDLORD' ? 'primary' : 
                            'success'
                          } 
                          size="small"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: 
                            user.role === 'ADMIN' ? 'error.main' : 
                            user.role === 'LANDLORD' ? 'primary.main' : 
                            'success.main'
                        }}>
                          {user.firstName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={
                          <>
                            {user.email}
                            <br />
                            {`Joined: ${new Date(user.createdAt).toLocaleDateString()}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/admin/users')}
                  >
                    View All Users
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No users available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Maintenance Requests */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              overflow: 'hidden'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              <ConstructionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Maintenance Requests
            </Typography>
            
            {maintenanceRequests.length > 0 ? (
              <>
                <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                  {maintenanceRequests.map(request => (
                    <ListItem
                      key={request.id}
                      sx={{ py: 1 }}
                      secondaryAction={
                        <MaintenanceStatusBadge status={request.status} />
                      }
                    >
                      <ListItemText
                        primary={request.title}
                        secondary={
                          <>
                            {`${request.tenant?.firstName} ${request.tenant?.lastName} • ${request.property?.name || 'Property'}`}
                            <br />
                            {`Priority: ${request.priority} • ${new Date(request.createdAt).toLocaleDateString()}`}
                          </>
                        }
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/admin/maintenance')}
                  >
                    View All Requests
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No maintenance requests at this time
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              overflow: 'hidden'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Payments
            </Typography>
            
            {recentPayments.length > 0 ? (
              <>
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Tenant</TableCell>
                        <TableCell>Property</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id} hover onClick={() => navigate(`/admin/payments/${payment.id}`)} sx={{ cursor: 'pointer' }}>
                          <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{`${payment.tenant?.firstName || ''} ${payment.tenant?.lastName || ''}`}</TableCell>
                          <TableCell>{payment.property?.name || 'Unknown'}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.status} 
                              color={payment.status === 'COMPLETED' ? 'success' : 'default'} 
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/admin/payments')}
                  >
                    View All Payments
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No payment history available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 