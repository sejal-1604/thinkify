import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Poll as PollIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useThinkify from '../../hooks/useThinkify';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useThinkify();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/teacher/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity('error');
      setAlertMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 3 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          Failed to load dashboard data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {dashboardData.teacher.name}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {dashboardData.teacher.department && `Department: ${dashboardData.teacher.department}`}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assignments"
            value={dashboardData.stats.totalAssignments}
            icon={<AssignmentIcon fontSize="large" />}
            color="primary.main"
            onClick={() => navigate('/teacher/assignments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Assignments"
            value={dashboardData.stats.activeAssignments}
            icon={<TrendingUpIcon fontSize="large" />}
            color="success.main"
            onClick={() => navigate('/teacher/assignments?status=active')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Polls"
            value={dashboardData.stats.totalPolls}
            icon={<PollIcon fontSize="large" />}
            color="info.main"
            onClick={() => navigate('/teacher/polls')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Students"
            value={dashboardData.stats.studentsCount}
            icon={<GroupIcon fontSize="large" />}
            color="warning.main"
            onClick={() => navigate('/teacher/students')}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Assignments</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/teacher/assignments')}
              >
                View All
              </Button>
            </Box>
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {dashboardData.recentAssignments.length > 0 ? (
                dashboardData.recentAssignments.map((assignment) => (
                  <ListItem key={assignment._id} divider>
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Subject: {assignment.subject}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={assignment.status}
                              size="small"
                              color={assignment.status === 'active' ? 'success' : 'default'}
                            />
                            <Chip
                              label={`${assignment.submissions?.length || 0} submissions`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No assignments yet"
                    secondary="Create your first assignment to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Polls */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Polls</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/teacher/polls')}
              >
                View All
              </Button>
            </Box>
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {dashboardData.recentPolls.length > 0 ? (
                dashboardData.recentPolls.map((poll) => (
                  <ListItem key={poll._id} divider>
                    <ListItemText
                      primary={poll.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Type: {poll.type}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Deadline: {new Date(poll.deadline).toLocaleDateString()}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={poll.status}
                              size="small"
                              color={poll.status === 'active' ? 'success' : 'default'}
                            />
                            <Chip
                              label={`${poll.voters?.length || 0} votes`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No polls yet"
                    secondary="Create your first poll to engage students"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/teacher/assignments/create')}
            >
              Create Assignment
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<PollIcon />}
              onClick={() => navigate('/teacher/polls/create')}
            >
              Create Poll
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<GroupIcon />}
              onClick={() => navigate('/teacher/students')}
            >
              View Students
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
