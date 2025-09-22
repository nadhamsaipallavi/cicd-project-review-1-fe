import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { AccountCircle, Notifications } from '@mui/icons-material';

const Navigation = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    Property Management System
                </Typography>

                {user ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {user.role === 'TENANT' && (
                                <Button
                                    component={Link}
                                    to="/purchase-requests"
                                    color="inherit"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Purchase Requests
                                </Button>
                            )}
                            
                            {user.role === 'LANDLORD' && (
                                <>
                                    <Button
                                        component={Link}
                                        to="/properties"
                                        color="inherit"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        My Properties
                                    </Button>
                                    <Button
                                        component={Link}
                                        to="/purchase-requests"
                                        color="inherit"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Purchase Requests
                                    </Button>
                                </>
                            )}

                            <IconButton color="inherit">
                                <Notifications />
                            </IconButton>

                            <IconButton
                                onClick={handleMenu}
                                color="inherit"
                            >
                                {user.profileImage ? (
                                    <Avatar
                                        src={user.profileImage}
                                        alt={user.firstName}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                ) : (
                                    <AccountCircle />
                                )}
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem component={Link} to="/settings" onClick={handleClose}>
                                    Settings
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </>
                ) : (
                    <Box>
                        <Button
                            component={Link}
                            to="/login"
                            color="inherit"
                            sx={{ textTransform: 'none' }}
                        >
                            Login
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            color="inherit"
                            sx={{ textTransform: 'none' }}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 