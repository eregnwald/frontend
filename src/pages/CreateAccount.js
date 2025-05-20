// src/pages/CreateAccount.js
import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography } from '@mui/material';

function CreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/accounts', {
        name,
        email,
      });
      console.log('Account created:', response.data);
      // Перенаправить на список аккаунтов
      window.location.href = '/accounts';
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Box sx={{ width: '300px' }}>
          <Typography variant="h4" gutterBottom>
            Create Account
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Create Account
            </Button>
          </form>
        </Box>
      </Box>
    </div>
  );
}

export default CreateAccount;