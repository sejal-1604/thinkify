import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useThinkify from '../../hooks/useThinkify';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useThinkify();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/teacher/polls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPolls(data.data);
      } else {
        throw new Error('Failed to fetch polls');
      }
    } catch (error) {
      console.error('Polls fetch error:', error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity('error');
      setAlertMessage('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Polls</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/teacher/polls/create')}
        >
          Create Poll
        </Button>
      </Box>

      {polls.length > 0 ? (
        <Grid container spacing={3}>
          {polls.map((poll) => (
            <Grid item xs={12} md={6} lg={4} key={poll._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {poll.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {poll.description}
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={poll.status}
                      color={getStatusColor(poll.status)}
                      size="small"
                    />
                    <Chip
                      label={poll.type}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`${poll.voters?.length || 0} votes`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary">
                    Deadline: {new Date(poll.deadline).toLocaleDateString()}
                  </Typography>
                  
                  {poll.category && (
                    <Typography variant="body2" color="textSecondary">
                      Category: {poll.category}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/teacher/polls/${poll._id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<BarChartIcon />}
                    onClick={() => navigate(`/teacher/polls/${poll._id}/results`)}
                  >
                    Results
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No polls found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first poll to engage with students and gather feedback.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/teacher/polls/create')}
          >
            Create Your First Poll
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Polls;
