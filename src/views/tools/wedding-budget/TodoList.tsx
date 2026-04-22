import { useState } from 'react';
import {
  Box, Typography, Checkbox, IconButton, TextField, Button,
  LinearProgress, Chip, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { TodoItem, uid } from './types';

interface Props {
  todos: TodoItem[];
  onUpdate: (todos: TodoItem[]) => void;
}

const categoryOrder = [
  'Venue & Rentals', 'Food & Beverage', 'Photography & Video',
  'Flowers & Decor', 'Attire & Beauty', 'Music & Entertainment',
  'Stationery', 'Transportation', 'Officiant & Ceremony',
  'Traditional Ceremony (Day 1)', 'Favors & Gifts',
  'Planning & Coordination', 'Miscellaneous',
];

const formatDate = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const isOverdue = (d?: string) => {
  if (!d) return false;
  return new Date(d) < new Date();
};

export const TodoList = ({ todos, onUpdate }: Props) => {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [newItemCat, setNewItemCat] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const toggle = (id: string) => {
    onUpdate(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const remove = (id: string) => {
    onUpdate(todos.filter(t => t.id !== id));
  };

  const addItem = (category: string) => {
    if (!newItemText.trim()) return;
    onUpdate([...todos, { id: uid(), text: newItemText.trim(), category, completed: false }]);
    setNewItemText('');
    setNewItemCat(null);
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const grouped = categoryOrder.reduce<Record<string, TodoItem[]>>((acc, cat) => {
    const items = todos.filter(t => t.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  // Also pick up any custom categories
  const otherTodos = todos.filter(t => !categoryOrder.includes(t.category));
  if (otherTodos.length > 0) grouped['Other'] = otherTodos;

  const totalCount = todos.length;
  const doneCount = todos.filter(t => t.completed).length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">Wedding Checklist</Typography>
        <Chip label={`${doneCount}/${totalCount}`} size="small" color={doneCount === totalCount ? 'success' : 'default'} />
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 2, height: 6, borderRadius: 3 }}
      />

      {Object.entries(grouped).map(([cat, items]) => {
        const catDone = items.filter(t => t.completed).length;
        const expanded = expandedCats.has(cat);
        return (
          <Box key={cat} sx={{ mb: 0.5 }}>
            <Box
              onClick={() => toggleCat(cat)}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', py: 0.5, px: 1, borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                <Typography variant="body2" fontWeight="bold" noWrap>{cat}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">{catDone}/{items.length}</Typography>
            </Box>

            <Collapse in={expanded}>
              <Box sx={{ pl: 1 }}>
                {items.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
                    <Checkbox
                      size="small"
                      checked={item.completed}
                      onChange={() => toggle(item.id)}
                      sx={{ p: 0.25 }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {item.text}
                      </Typography>
                      {item.dueDate && (
                        <Typography
                          variant="caption"
                          color={isOverdue(item.dueDate) && !item.completed ? 'error' : 'text.secondary'}
                        >
                          {formatDate(item.dueDate)}
                        </Typography>
                      )}
                    </Box>
                    <IconButton size="small" onClick={() => remove(item.id)} sx={{ p: 0.25, opacity: 0.5, '&:hover': { opacity: 1 } }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}

                {newItemCat === cat ? (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="New task..."
                      value={newItemText}
                      onChange={e => setNewItemText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addItem(cat)}
                      autoFocus
                      fullWidth
                      sx={{ '& .MuiInputBase-input': { py: 0.5, fontSize: '0.875rem' } }}
                    />
                    <Button size="small" onClick={() => addItem(cat)} disabled={!newItemText.trim()}>Add</Button>
                    <Button size="small" onClick={() => { setNewItemCat(null); setNewItemText(''); }}>X</Button>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setNewItemCat(cat)}
                    sx={{ ml: 1, mb: 0.5, fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Add task
                  </Button>
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};
