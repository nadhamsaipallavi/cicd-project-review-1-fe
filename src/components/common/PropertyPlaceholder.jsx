import React from 'react';
import { Box, Typography } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const PropertyPlaceholder = ({ width = '100%', height = '180px', text = 'No Image' }) => {
  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        color: '#757575',
      }}
    >
      <HomeIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7 }} />
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
};

export default PropertyPlaceholder; 