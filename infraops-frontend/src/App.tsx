import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import SubscriptionDashboard from './Dashboard';
import './App.css';

function About() {
  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h4" gutterBottom>About</Typography>
      <Typography>
        This dashboard helps you track all your subscriptions (SaaS, streaming, cloud, productivity, etc.) in one place. Stay on top of renewals, costs, and more!
      </Typography>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<'dashboard' | 'about'>('dashboard');

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Subscription Tracker
          </Typography>
          <Button color="inherit" onClick={() => setPage('dashboard')}>Dashboard</Button>
          <Button color="inherit" onClick={() => setPage('about')}>About</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 } }}>
        {page === 'dashboard' ? <SubscriptionDashboard /> : <About />}
      </Box>
    </>
  );
}

export default App;
