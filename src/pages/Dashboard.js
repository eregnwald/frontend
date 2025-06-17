import React from 'react';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/create-account');
  };

  const handleViewAccounts = () => {
    navigate('/accounts');
  };

  const handleViewUsers = () => {
    navigate('/users');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography>Welcome to the CRM Dashboard</Typography>
      <Button variant="contained" color="primary" onClick={handleCreateAccount} style={{ marginRight: '10px' }}>
        Create Account
      </Button>
      <Button variant="contained" color="secondary" onClick={handleViewAccounts} style={{ marginRight: '10px' }}>
        View Accounts
      </Button>
      <Button variant="contained" color="success" onClick={handleViewUsers}>
        View Users
      </Button>
    </div>
  );
}

export default Dashboard;