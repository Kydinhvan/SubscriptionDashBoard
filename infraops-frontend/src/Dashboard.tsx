import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Snackbar, Alert, Stack, Card, CardContent, Chip,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import CloudIcon from '@mui/icons-material/Cloud';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MovieIcon from '@mui/icons-material/Movie';
import WorkIcon from '@mui/icons-material/Work';

interface Subscription {
  id: number;
  name: string;
  provider: string;
  status: string;
  monthlyCost: number;
  renewalDate: string;
  owner: string;
  category: string;
  createdAt: string;
}

// Returns an icon based on resource category
const categoryIcon = (category: string) => {
  switch (category) {
    case 'Entertainment': return <MovieIcon color="secondary" />;
    case 'Music': return <MusicNoteIcon color="success" />;
    case 'Cloud': return <CloudIcon color="primary" />;
    case 'Productivity': return <WorkIcon color="info" />;
    default: return <SubscriptionsIcon />;
  }
};

// Returns a color for the status chip
const statusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Trial': return 'info';
    case 'Expired': return 'warning';
    default: return 'default';
  }
};

export default function SubscriptionDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    provider: '',
    status: 'Active',
    monthlyCost: '',
    renewalDate: '',
    owner: '',
    category: '',
  });
  const [formError, setFormError] = useState('');

  // Fetch subscriptions from backend
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5229/api/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seed demo data
  const seedSubscriptions = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5229/api/subscriptions/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed subscriptions');
      setSuccess('Sample data imported!');
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('http://localhost:5229/api/subscriptions/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload CSV');
      const data = await res.json();
      setUploadResult(`Uploaded ${data.count} subscriptions!`);
      fetchSubscriptions();
    } catch (err: any) {
      setUploadResult('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!form.name || !form.provider || !form.monthlyCost || !form.renewalDate || !form.owner || !form.category) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5229/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          provider: form.provider,
          status: form.status,
          monthlyCost: parseFloat(form.monthlyCost),
          renewalDate: form.renewalDate,
          owner: form.owner,
          category: form.category,
        }),
      });
      if (!res.ok) throw new Error('Failed to add subscription');
      setFormOpen(false);
      setForm({ name: '', provider: '', status: 'Active', monthlyCost: '', renewalDate: '', owner: '', category: '' });
      fetchSubscriptions();
      setSuccess('Subscription added!');
    } catch (err: any) {
      setFormError('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Typography variant="h3" fontWeight={800} color="primary.main" gutterBottom sx={{ letterSpacing: 1 }}>
        Subscription Tracker
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Track your SaaS, streaming, and cloud subscriptions in one place.
      </Typography>
      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" onClick={fetchSubscriptions} size="large">Refresh</Button>
        <Button variant="outlined" onClick={seedSubscriptions} size="large">Import Sample Data</Button>
        <Button variant="outlined" component="label" size="large" disabled={uploading}>
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCsvUpload} />
        </Button>
        <Button variant="contained" color="success" onClick={() => setFormOpen(true)} size="large">Add Subscription</Button>
      </Stack>
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: 28, fontWeight: 700, pb: 0 }}>Add Subscription</DialogTitle>
        <DialogContent sx={{ minWidth: { xs: 320, sm: 500, md: 700 }, py: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Stack spacing={2} flex={1}>
              <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} fullWidth required size="medium" />
              <TextField label="Provider" name="provider" value={form.provider} onChange={handleFormChange} fullWidth required size="medium" />
              <TextField label="Owner" name="owner" value={form.owner} onChange={handleFormChange} fullWidth required size="medium" />
              <TextField label="Category" name="category" value={form.category} onChange={handleFormChange} fullWidth required select size="medium">
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Music">Music</MenuItem>
                <MenuItem value="Cloud">Cloud</MenuItem>
                <MenuItem value="Productivity">Productivity</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Stack>
            <Stack spacing={2} flex={1}>
              <TextField label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth required select size="medium">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </TextField>
              <TextField label="Monthly Cost" name="monthlyCost" value={form.monthlyCost} onChange={handleFormChange} fullWidth required type="number" inputProps={{ min: 0, step: 0.01 }} size="medium" />
              <TextField label="Renewal Date" name="renewalDate" value={form.renewalDate} onChange={handleFormChange} fullWidth required type="date" InputLabelProps={{ shrink: true }} size="medium" />
            </Stack>
          </Stack>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)} size="large">Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" size="large">Add</Button>
        </DialogActions>
      </Dialog>
      {uploadResult && (
        <Alert severity={uploadResult.startsWith('Uploaded') ? 'success' : 'error'} sx={{ mb: 2 }}>{uploadResult}</Alert>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : subscriptions.length === 0 ? (
        <Alert severity="info">No subscriptions found. Try importing sample data.</Alert>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr'
          },
          gap: 4,
          mb: 4
        }}>
          {subscriptions.map((s) => (
            <Card key={s.id} elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: 220, m: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  {categoryIcon(s.category)}
                  <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>{s.name}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}><b>Provider:</b> {s.provider}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}><b>Owner:</b> {s.owner}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}><b>Category:</b> {s.category}</Typography>
                <Chip label={s.status} color={statusColor(s.status) as any} size="small" sx={{ mb: 1, fontWeight: 600 }} />
                <Typography variant="body2" color="text.secondary" mb={1}><b>Monthly Cost:</b> ${s.monthlyCost.toFixed(2)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  <b>Renewal:</b> {new Date(s.renewalDate).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <b>Created:</b> {new Date(s.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      {/* Table view for advanced users */}
      {subscriptions.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3, boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ background: 'linear-gradient(90deg, #e3eafc 0%, #f5f7fa 100%)' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Monthly Cost</TableCell>
                <TableCell>Renewal</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.provider}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>${s.monthlyCost.toFixed(2)}</TableCell>
                  <TableCell>{new Date(s.renewalDate).toLocaleDateString()}</TableCell>
                  <TableCell>{s.owner}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
}
