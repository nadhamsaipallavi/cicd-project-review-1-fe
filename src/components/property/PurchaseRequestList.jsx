import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Chip
} from '@mui/material';
import { propertyPurchaseService } from '../../services/propertyPurchaseService';
import { useSnackbar } from 'notistack';

const PurchaseRequestList = ({ isLandlord }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseNotes, setResponseNotes] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = isLandlord
                ? await propertyPurchaseService.getLandlordRequests()
                : await propertyPurchaseService.getTenantRequests();
            setRequests(response);
        } catch (error) {
            enqueueSnackbar('Failed to fetch purchase requests', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request) => {
        setSelectedRequest(request);
        setOpenDialog(true);
    };

    const handleReject = async (request) => {
        setSelectedRequest(request);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedRequest(null);
        setResponseNotes('');
    };

    const handleSubmit = async (status) => {
        try {
            await propertyPurchaseService.updateRequestStatus(
                selectedRequest.id,
                status,
                responseNotes
            );
            enqueueSnackbar(`Request ${status.toLowerCase()} successfully`, { variant: 'success' });
            fetchRequests();
            handleDialogClose();
        } catch (error) {
            enqueueSnackbar('Failed to update request status', { variant: 'error' });
        }
    };

    const getStatusChip = (status) => {
        const statusColors = {
            PENDING: 'warning',
            APPROVED: 'success',
            REJECTED: 'error',
            CANCELLED: 'default',
            PAYMENT_PENDING: 'info',
            PAYMENT_COMPLETED: 'success',
            PAYMENT_FAILED: 'error'
        };

        return (
            <Chip
                label={status.replace('_', ' ')}
                color={statusColors[status] || 'default'}
                size="small"
            />
        );
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Property</TableCell>
                            <TableCell>Requested By</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            {isLandlord && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.propertyTitle}</TableCell>
                                <TableCell>{request.tenantName}</TableCell>
                                <TableCell>
                                    {new Date(request.requestDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>₹{request.purchasePrice}</TableCell>
                                <TableCell>{getStatusChip(request.status)}</TableCell>
                                {isLandlord && request.status === 'PENDING' && (
                                    <TableCell>
                                        <Button
                                            color="success"
                                            onClick={() => handleApprove(request)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            color="error"
                                            onClick={() => handleReject(request)}
                                            size="small"
                                        >
                                            Reject
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>
                    {selectedRequest?.status === 'PENDING' ? 'Approve' : 'Reject'} Purchase Request
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Property: {selectedRequest?.propertyTitle}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Requested By: {selectedRequest?.tenantName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Price: ₹{selectedRequest?.purchasePrice}
                    </Typography>
                    <TextField
                        label="Response Notes"
                        multiline
                        rows={4}
                        value={responseNotes}
                        onChange={(e) => setResponseNotes(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={() => handleSubmit(selectedRequest?.status === 'PENDING' ? 'APPROVED' : 'REJECTED')}
                        color={selectedRequest?.status === 'PENDING' ? 'success' : 'error'}
                    >
                        {selectedRequest?.status === 'PENDING' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PurchaseRequestList; 