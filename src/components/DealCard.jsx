import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useDealStore } from '../store/useDealStore';

const DealCard = ({ deal }) => {
  const setSelectedDeal = useDealStore((state) => state.setSelectedDeal);

  return (
    <Card onClick={() => setSelectedDeal(deal)} style={{ marginBottom: 8 }}>
      <CardContent>
        <Typography variant="body1">{deal.opportunity_name}</Typography>
        <Typography color="textSecondary">
          {deal.amount} ₽
        </Typography>
        <Typography color="textSecondary">
          Дата создания: {new Date(deal.created_at).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DealCard;