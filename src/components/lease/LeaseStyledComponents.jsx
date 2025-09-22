import { styled, alpha } from '@mui/material/styles';
import { 
    Paper, Typography, Chip, Button, Card, CardMedia, TableContainer, 
    TextField, Tabs, Dialog, DialogTitle, Box
} from '@mui/material';

/**
 * Reusable styled components for lease-related pages
 * These components provide consistent styling across the lease module
 */

// Paper with enhanced styling and hover effects
export const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    overflow: 'hidden',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    }
}));

// Glass-like paper effect with backdrop filter
export const GlassPaper = styled(Paper)(({ theme }) => ({
    backdropFilter: 'blur(10px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderRadius: '20px',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// Typography with gradient text effect
export const GradientTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
}));

// Gradient divider for section headings
export const GradientDivider = styled(Box)(({ theme }) => ({
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '2px',
    width: '80px',
    marginBottom: theme.spacing(3),
}));

// Enhanced chip with rounded corners and subtle shadow
export const StyledChip = styled(Chip)(({ theme }) => ({
    fontWeight: 'bold',
    borderRadius: '50px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
        padding: '0 12px',
    }
}));

// Button with animation effects on hover
export const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: '50px',
    padding: '10px 24px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    }
}));

// Card with hover effects
export const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
    '&:hover': {
        transform: 'translateY(-12px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)'
    }
}));

// Card media with zoom effect on hover
export const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: '220px',
    transition: 'transform 0.6s ease',
    '&:hover': {
        transform: 'scale(1.08)'
    }
}));

// Enhanced table container
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '16px',
    '& .MuiTableCell-head': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

// Enhanced text field with hover and focus effects
export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        '&.Mui-focused': {
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
        }
    }
}));

// Enhanced tabs with better indicator and tab styling
export const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTabs-indicator': {
        height: '3px',
        borderRadius: '3px',
    },
    '& .MuiTab-root': {
        fontWeight: 'bold',
        textTransform: 'none',
        minWidth: 'auto',
        padding: '12px 16px',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
        }
    }
}));

// Dialog with rounded corners
export const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        overflow: 'hidden',
    }
}));

// Dialog title with colored background
export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
}));

// Animation variants for framer-motion
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { 
            staggerChildren: 0.1,
            when: "beforeChildren" 
        } 
    }
};

export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

// Loading container for consistent loading states
export const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70vh',
    flexDirection: 'column',
    gap: theme.spacing(2)
}));

// Helper functions
export const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}; 