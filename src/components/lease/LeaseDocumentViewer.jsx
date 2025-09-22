import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import leaseService from '../../services/leaseService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Description as DocumentIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import styled components
import {
  StyledPaper,
  GradientTypography,
  StyledTableContainer,
  AnimatedButton,
  StyledChip,
  StyledDialog,
  containerVariants,
  itemVariants,
  LoadingContainer
} from './LeaseStyledComponents';

// Additional styled components specific to this component
const DocumentCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  }
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.action.hover, 0.1),
  marginLeft: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.action.hover, 0.2),
  }
}));

const FileInputButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '10px 24px',
  fontWeight: 'bold',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '& input': {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 0,
    padding: 0,
    fontSize: '20px',
    cursor: 'pointer',
    opacity: 0,
    filter: 'alpha(opacity=0)',
    width: '100%',
    height: '100%'
  }
}));

const LeaseDocumentViewer = () => {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [documents, setDocuments] = useState([]);
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentType, setDocumentType] = useState('LEASE_AGREEMENT');
  const [uploading, setUploading] = useState(false);

  const isLandlord = user?.role === 'LANDLORD';
  const isAdmin = user?.role === 'ADMIN';
  const isTenant = user?.role === 'TENANT';
  const canUpload = isLandlord || isAdmin;
  const canDelete = isLandlord || isAdmin;

  useEffect(() => {
    fetchLeaseDocuments();
  }, [leaseId]);

  const fetchLeaseDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get lease details
      let leaseData;
      if (isLandlord || isAdmin) {
        leaseData = await leaseService.getLeaseById(leaseId);
      } else if (isTenant) {
        leaseData = await leaseService.getTenantLease();
      }
      
      if (leaseData) {
        setLease(leaseData);
      } else {
        setError('Lease not found or you do not have access to view it.');
      }
      
      // Get lease documents
      const documentsData = await leaseService.getLeaseDocuments(leaseId || leaseData?.id);
      if (documentsData) {
        setDocuments(documentsData);
      }
    } catch (err) {
      console.error('Error fetching lease documents:', err);
      setError('Failed to load lease documents. Please try again later.');
      
      // Sample data for development if API calls fail
      setLease({
        id: leaseId || 1,
        property: {
          id: 1,
          name: 'Sunset Apartments',
          address: '123 Main Street, Apt 4B'
        },
        tenant: {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        monthlyRent: 1200.00,
        securityDeposit: 2400.00,
        status: 'ACTIVE'
      });
      
      setDocuments([
        {
          id: 1,
          fileName: 'lease_agreement.pdf',
          documentType: 'LEASE_AGREEMENT',
          uploadDate: '2023-01-01T10:30:00Z',
          fileSize: 1024000,
          fileUrl: 'https://example.com/documents/lease_agreement.pdf'
        },
        {
          id: 2,
          fileName: 'addendum_1.pdf',
          documentType: 'ADDENDUM',
          uploadDate: '2023-02-15T14:45:00Z',
          fileSize: 512000,
          fileUrl: 'https://example.com/documents/addendum_1.pdf'
        },
        {
          id: 3,
          fileName: 'move_in_inspection.jpg',
          documentType: 'INSPECTION_REPORT',
          uploadDate: '2023-01-02T09:15:00Z',
          fileSize: 2048000,
          fileUrl: 'https://example.com/documents/move_in_inspection.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      'LEASE_AGREEMENT': 'Lease Agreement',
      'ADDENDUM': 'Addendum',
      'INSPECTION_REPORT': 'Inspection Report',
      'NOTICE': 'Notice',
      'RECEIPT': 'Receipt',
      'OTHER': 'Other Document'
    };
    
    return types[type] || type;
  };

  const getDocumentIcon = (fileName) => {
    if (!fileName) return <FileIcon />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <PdfIcon color="error" fontSize="large" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <ImageIcon color="primary" fontSize="large" />;
    } else {
      return <FileIcon color="action" fontSize="large" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleDownloadDocument = (document) => {
    // This would typically redirect to the document URL or trigger a download
    window.open(document.fileUrl, '_blank');
  };

  const handleDeleteDialogOpen = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      // This would call an API to delete the document
      // await leaseService.deleteLeaseDocument(lease.id, documentToDelete.id);
      
      // Update local state
      const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete.id);
      setDocuments(updatedDocuments);
      
      // Close dialog
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again later.');
    }
  };

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
    setUploadFile(null);
    setDocumentType('LEASE_AGREEMENT');
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) return;
    
    try {
      setUploading(true);
      
      // This would call an API to upload the document
      // const formData = new FormData();
      // formData.append('file', uploadFile);
      // formData.append('documentType', documentType);
      // await leaseService.uploadLeaseDocument(lease.id, formData);
      
      // Simulate successful upload
      const newDocument = {
        id: Date.now(),
        fileName: uploadFile.name,
        documentType: documentType,
        uploadDate: new Date().toISOString(),
        fileSize: uploadFile.size,
        fileUrl: URL.createObjectURL(uploadFile)
      };
      
      // Update local state
      setDocuments([...documents, newDocument]);
      
      // Close dialog
      handleUploadDialogClose();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again later.');
    } finally {
      setUploading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LoadingContainer>
          <CircularProgress size={60} thickness={4} sx={{
            color: theme => `${theme.palette.primary.main}`,
          }} />
          <Typography variant="h6" color="text.secondary">Loading lease documents...</Typography>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              fontSize: '1rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            {error}
          </Alert>
          <AnimatedButton 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back
          </AnimatedButton>
        </motion.div>
      </Container>
    );
  }

  if (!lease) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2, 
              fontSize: '1rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            No lease information found. If you believe this is an error, please contact support.
          </Alert>
          <AnimatedButton 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back
          </AnimatedButton>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            variant="outlined"
            sx={{ 
              mr: 2, 
              borderRadius: '50px',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateX(-5px)'
              }
            }}
          >
            Back
          </Button>
          <GradientTypography variant="h4" component="h1">
            <DocumentIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lease Documents
          </GradientTypography>
        </Box>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {/* Lease Summary */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <StyledPaper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }}>
                  Lease Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                      {lease.property?.name || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {lease.property?.address || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tenant</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'Not specified'}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Lease Period</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </StyledPaper>
            </motion.div>
          </Grid>

          {/* Documents List */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <StyledPaper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.secondary.main,
                    fontWeight: 'bold'
                  }}>
                    <DocumentIcon sx={{ mr: 1 }} />
                    Documents
                  </Typography>
                  
                  {canUpload && (
                    <AnimatedButton
                      variant="contained"
                      color="primary"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadDialogOpen}
                    >
                      Upload Document
                    </AnimatedButton>
                  )}
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {documents.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: 2
                  }}>
                    <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No documents found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {canUpload ? 'Upload documents using the button above' : 'No documents have been uploaded for this lease yet'}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {documents.map((document) => (
                      <Grid item xs={12} key={document.id}>
                        <DocumentCard>
                          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60 }}>
                            {getDocumentIcon(document.fileName)}
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {document.fileName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                              <StyledChip 
                                label={getDocumentTypeLabel(document.documentType)} 
                                color="primary" 
                                size="small" 
                                variant="outlined"
                              />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(document.uploadDate)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatFileSize(document.fileSize)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box>
                            <ActionIconButton 
                              color="primary" 
                              onClick={() => handleViewDocument(document)}
                              title="View Document"
                            >
                              <ViewIcon />
                            </ActionIconButton>
                            <ActionIconButton 
                              color="secondary" 
                              onClick={() => handleDownloadDocument(document)}
                              title="Download Document"
                            >
                              <DownloadIcon />
                            </ActionIconButton>
                            {canDelete && (
                              <ActionIconButton 
                                color="error" 
                                onClick={() => handleDeleteDialogOpen(document)}
                                title="Delete Document"
                              >
                                <DeleteIcon />
                              </ActionIconButton>
                            )}
                          </Box>
                        </DocumentCard>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </StyledPaper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      {/* View Document Dialog */}
      <StyledDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {selectedDocument?.fileName}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '70vh' }}>
          {selectedDocument && (
            <Box component="iframe" 
              src={selectedDocument.fileUrl} 
              width="100%" 
              height="100%" 
              sx={{ border: 'none' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)} 
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)} 
            variant="contained" 
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Delete Document Dialog */}
      <StyledDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document "{documentToDelete?.fileName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteDocument} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Upload Document Dialog */}
      <StyledDialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                  label="Document Type"
                >
                  <MenuItem value="LEASE_AGREEMENT">Lease Agreement</MenuItem>
                  <MenuItem value="ADDENDUM">Addendum</MenuItem>
                  <MenuItem value="INSPECTION_REPORT">Inspection Report</MenuItem>
                  <MenuItem value="NOTICE">Notice</MenuItem>
                  <MenuItem value="RECEIPT">Receipt</MenuItem>
                  <MenuItem value="OTHER">Other Document</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                mb: 2
              }}>
                {uploadFile ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {uploadFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(uploadFile.size)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No file selected
                  </Typography>
                )}
              </Box>
              
              <FileInputButton
                variant="outlined"
                color="primary"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </FileInputButton>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleUploadDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleUploadDocument} 
            variant="contained" 
            color="primary"
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default LeaseDocumentViewer; 