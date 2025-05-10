import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import { amber } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { 
  useGet2FAStatusQuery, 
  useSetup2FAMutation, 
  useVerify2FAMutation, 
  useDisable2FAMutation 
} from '../../store/api/authApi';
import CustomerDashboardLayout from '../../components/layouts/CustomerDashboardLayout';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#f8f8f8',
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const BackupCodeItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: amber[50],
  marginBottom: theme.spacing(1),
  fontFamily: 'monospace',
}));

const SecurityPage = () => {
  const user = useSelector(selectCurrentUser);
  const { data: twoFAStatus, isLoading: statusLoading } = useGet2FAStatusQuery();
  const [setup2FA, { isLoading: setupLoading }] = useSetup2FAMutation();
  const [verify2FA, { isLoading: verifyLoading }] = useVerify2FAMutation();
  const [disable2FA, { isLoading: disableLoading }] = useDisable2FAMutation();
  
  // Local state
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Check if 2FA is enabled
  const twoFactorEnabled = twoFAStatus?.data?.twoFactorEnabled || false;
  
  // Handle 2FA setup
  const handleSetup2FA = async () => {
    try {
      const response = await setup2FA().unwrap();
      setSetupData(response.data);
      setSnackbar({
        open: true,
        message: 'Two-factor authentication setup initialized. Scan the QR code with your authenticator app.',
        severity: 'info'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.data?.error?.message || 'Failed to setup 2FA',
        severity: 'error'
      });
    }
  };
  
  // Handle 2FA verification and enabling
  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      setSnackbar({
        open: true,
        message: 'Verification code must be 6 digits',
        severity: 'error'
      });
      return;
    }
    
    try {
      const response = await verify2FA({ code: verificationCode }).unwrap();
      setSetupData(null);
      setVerificationCode('');
      setShowBackupCodes(true);
      setSnackbar({
        open: true,
        message: 'Two-factor authentication has been enabled successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.data?.error?.message || 'Invalid verification code',
        severity: 'error'
      });
    }
  };
  
  // Handle 2FA disabling
  const handleDisable2FA = async () => {
    if (disableCode.length !== 6) {
      setSnackbar({
        open: true,
        message: 'Verification code must be 6 digits',
        severity: 'error'
      });
      return;
    }
    
    try {
      await disable2FA({ code: disableCode }).unwrap();
      setDisableDialogOpen(false);
      setDisableCode('');
      setSnackbar({
        open: true,
        message: 'Two-factor authentication has been disabled successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.data?.error?.message || 'Invalid verification code',
        severity: 'error'
      });
    }
  };
  
  // Copy backup code to clipboard
  const copyBackupCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <CustomerDashboardLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Security Settings
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Manage your account security settings, passwords, and two-factor authentication.
        </Typography>
        
        {/* Password Change Section */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
            Change Password
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
                variant="outlined"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ bgcolor: amber[700], '&:hover': { bgcolor: amber[800] } }}
            >
              Update Password
            </Button>
          </Box>
        </StyledPaper>
        
        {/* Two-Factor Authentication Section */}
        <StyledPaper>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <PhoneAndroidIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
              Two-Factor Authentication (2FA)
            </Typography>
            
            {!statusLoading && (
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorEnabled}
                    disabled={true}
                    color="primary"
                  />
                }
                label={twoFactorEnabled ? "Enabled" : "Disabled"}
              />
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {statusLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {twoFactorEnabled ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Two-factor authentication is currently enabled for your account.
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    With 2FA enabled, you'll be asked for a verification code each time you log in. 
                    This code is generated by your authenticator app.
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDisableDialogOpen(true)}
                    >
                      Disable 2FA
                    </Button>
                  </Box>
                </Box>
              ) : setupData ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Scan the QR code below with your authenticator app, then enter the code provided.
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                    to scan the QR code. The app will generate a 6-digit code that changes every 30 seconds.
                  </Typography>
                  
                  <QRCodeContainer>
                    <img 
                      src={setupData.qrCodeUrl} 
                      alt="QR Code for two-factor authentication" 
                      style={{ maxWidth: '200px', margin: '10px 0' }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      Secret key: {setupData.secret}
                    </Typography>
                  </QRCodeContainer>
                  
                  <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                    Enter the 6-digit code shown in your authenticator app:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                      placeholder="000000"
                      variant="outlined"
                      size="small"
                      inputProps={{ maxLength: 6, style: { fontFamily: 'monospace', letterSpacing: '0.5em' } }}
                      sx={{ width: '150px' }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={handleVerify2FA}
                      disabled={verificationCode.length !== 6 || verifyLoading}
                      sx={{ bgcolor: amber[700], '&:hover': { bgcolor: amber[800] } }}
                    >
                      {verifyLoading ? <CircularProgress size={24} /> : "Verify & Activate"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Two-factor authentication is currently disabled.
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Enable two-factor authentication to add an extra layer of security to your account.
                    Each time you log in, you'll need both your password and a verification code from your phone.
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleSetup2FA}
                      disabled={setupLoading}
                      sx={{ bgcolor: amber[700], '&:hover': { bgcolor: amber[800] } }}
                    >
                      {setupLoading ? <CircularProgress size={24} /> : "Enable 2FA"}
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Backup Codes Dialog */}
              {showBackupCodes && setupData?.backupCodes && (
                <Card sx={{ mt: 3, bgcolor: '#fffbf0' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Backup Codes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Save these backup codes in a secure place. You can use each backup code once if you lose access to your authenticator app.
                    </Typography>
                    
                    <List>
                      {setupData.backupCodes.map((code, index) => (
                        <BackupCodeItem key={index}>
                          <ListItemText 
                            primary={`${code.substring(0, 4)}-${code.substring(4)}`} 
                            primaryTypographyProps={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                          />
                          <IconButton 
                            onClick={() => copyBackupCode(code, index)}
                            size="small"
                            color={copiedIndex === index ? "success" : "default"}
                          >
                            {copiedIndex === index ? <CheckCircleIcon /> : <ContentCopyIcon />}
                          </IconButton>
                        </BackupCodeItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => setShowBackupCodes(false)}
                    >
                      I've saved these codes
                    </Button>
                  </CardActions>
                </Card>
              )}
            </>
          )}
        </StyledPaper>
        
        {/* Session Management Section */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Account Sessions
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Manage all the places where you're currently logged in.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
            >
              Logout from All Devices
            </Button>
          </Box>
        </StyledPaper>
        
        {/* Disable 2FA Dialog */}
        <Dialog open={disableDialogOpen} onClose={() => setDisableDialogOpen(false)}>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To disable two-factor authentication, please enter the 6-digit verification code
              from your authenticator app.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Verification Code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
              fullWidth
              inputProps={{ maxLength: 6, style: { fontFamily: 'monospace', letterSpacing: '0.5em' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisableDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDisable2FA} 
              color="error"
              disabled={disableCode.length !== 6 || disableLoading}
            >
              {disableLoading ? <CircularProgress size={24} /> : "Disable 2FA"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </CustomerDashboardLayout>
  );
};

export default SecurityPage; 