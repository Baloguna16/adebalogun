import React from 'react';
import { Typography, Box } from '@mui/material';

interface QuoteProps {
  text: string;
  source?: string;
}

export const PostQuote: React.FC<QuoteProps> = ({ text, source }) => {
  return (
    <Box p={3} borderTop={1} borderBottom={1} borderColor="grey.300">
      <Typography variant="body1" fontStyle="italic" fontSize="0.9rem" component="blockquote">
        {text}
      </Typography>
      {source && (
        <Typography variant="caption" color="textSecondary" align="right">
          — {source}
        </Typography>
      )}
    </Box>
  );
};

