import { Box, Typography, Paper } from '@mui/material';

const Resources = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resources
      </Typography>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Resources Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This feature is coming soon! You'll be able to upload and manage educational resources for your students.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Resources;
