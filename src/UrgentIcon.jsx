import React from 'react';
import { SvgIcon } from '@mui/material';

const UrgentIcon = () => (
  <SvgIcon viewBox="0 0 24 24" sx={{ color: 'red', fontSize: '1rem' }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
  </SvgIcon>
);

export default UrgentIcon;