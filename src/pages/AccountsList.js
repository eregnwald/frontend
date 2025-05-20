// src/pages/AccountsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

function AccountsList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts');
        setAccounts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Accounts List
      </Typography>
      <List>
        {accounts.map((account) => (
          <ListItem key={account.id}>
            <ListItemText primary={account.name} secondary={account.email} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default AccountsList;