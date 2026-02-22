import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Flag } from '@mui/icons-material';
import { useGetGoalsQuery, useCreateGoalMutation, useUpdateGoalMutation, useDeleteGoalMutation } from './goalsAPI';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function GoalsList() {
  const { data, isLoading } = useGetGoalsQuery();
  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: '',
    description: '',
  });

  const isSaving = isCreating || isUpdating;

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleOpen = () => {
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: getTodayDate(),
      category: '',
      description: '',
    });
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      category: '',
      description: '',
    });
  };

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      targetDate: goal.targetDate.split('T')[0],
      category: goal.category || '',
      description: goal.description || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.targetAmount || !formData.targetDate) {
        alert('Please fill in all required fields (Name, Target Amount, and Target Date)');
        return;
      }

      const payload = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: new Date(formData.targetDate).toISOString(),
        category: formData.category || undefined,
        description: formData.description || undefined,
      };

      if (editingId) {
        await updateGoal({ id: editingId, data: payload }).unwrap();
      } else {
        await createGoal(payload).unwrap();
      }
      handleClose();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      alert(`Failed to save goal: ${error?.data?.error || error?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id).unwrap();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const goals = data?.goals || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Goals
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Flag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No goals yet
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Set financial goals and track your progress towards achieving them
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Create Your First Goal
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {goal.name}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(goal)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(goal.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {goal.category && (
                    <Chip label={goal.category} size="small" color="primary" sx={{ mb: 2 }} />
                  )}

                  {goal.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {goal.progress.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Current
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(goal.currentAmount)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Target
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(goal.targetAmount)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Target Date
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatDate(goal.targetDate)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Goal Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Target Amount"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Target Date"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              helperText="e.g., Retirement, Education, House"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
