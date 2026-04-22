import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Button, Stack,
  Accordion, AccordionSummary, AccordionDetails,
  TextField, Select, MenuItem, IconButton, Paper,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Drawer, Chip, Tooltip,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  BudgetState, Scenario, DayAssignment, GUEST_COUNT, STORAGE_KEY,
  formatCurrency, uid, TodoItem,
} from './types';
import { createDefaultScenario, createDefaultTodos, createDefaultVenues } from './defaultData';
import { ScenarioComparison } from './ScenarioComparison';
import { TodoList } from './TodoList';

const VenueMap = lazy(() => import('./VenueMap').then(m => ({ default: m.VenueMap })));

const DAY_OPTIONS: DayAssignment[] = ['Day 1', 'Day 2', 'Both'];

const SIDEBAR_WIDTH = 360;

const loadState = (): BudgetState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate: add paid field to items if missing
      for (const s of parsed.scenarios) {
        if (!s.budgetTarget) s.budgetTarget = 120000;
        for (const c of s.categories) {
          for (const i of c.items) {
            if (i.paid === undefined) i.paid = 0;
          }
        }
      }
      if (!parsed.todos) parsed.todos = createDefaultTodos();
      if (!parsed.venues) parsed.venues = createDefaultVenues();
      return parsed;
    }
  } catch { /* ignore */ }
  const scenario = createDefaultScenario('Mid-Range');
  return {
    scenarios: [scenario],
    activeScenarioId: scenario.id,
    compareMode: false,
    compareScenarioIds: [],
    todos: createDefaultTodos(),
    venues: createDefaultVenues(),
  };
};

export const WeddingBudget = () => {
  const [state, setState] = useState<BudgetState>(loadState);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'checklist' | 'venues'>('checklist');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeScenario = useMemo(
    () => state.scenarios.find(s => s.id === state.activeScenarioId) ?? state.scenarios[0],
    [state.scenarios, state.activeScenarioId],
  );

  const totals = useMemo(() => {
    if (!activeScenario) return { day1: 0, day2: 0, grand: 0, paid: 0 };
    let day1 = 0, day2 = 0, paid = 0;
    for (const cat of activeScenario.categories) {
      for (const item of cat.items) {
        const sub = item.unitCost * item.quantity;
        paid += item.paid;
        if (item.day === 'Day 1') day1 += sub;
        else if (item.day === 'Day 2') day2 += sub;
        else { day1 += sub / 2; day2 += sub / 2; }
      }
    }
    return { day1, day2, grand: day1 + day2, paid };
  }, [activeScenario]);

  const updateScenario = useCallback((fn: (s: Scenario) => Scenario) => {
    setState(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(s => s.id === prev.activeScenarioId ? fn(s) : s),
    }));
  }, []);

  const handleTabChange = (_: unknown, val: number) => {
    setState(prev => ({ ...prev, activeScenarioId: prev.scenarios[val].id }));
  };

  const addScenario = () => {
    const s = createDefaultScenario(`Scenario ${state.scenarios.length + 1}`);
    setState(prev => ({ ...prev, scenarios: [...prev.scenarios, s], activeScenarioId: s.id }));
  };

  const duplicateScenario = () => {
    const copy: Scenario = JSON.parse(JSON.stringify(activeScenario));
    copy.id = uid();
    copy.name = `${activeScenario.name} (copy)`;
    copy.categories.forEach(c => { c.id = uid(); c.items.forEach(i => { i.id = uid(); }); });
    setState(prev => ({ ...prev, scenarios: [...prev.scenarios, copy], activeScenarioId: copy.id }));
  };

  const deleteScenario = () => {
    if (state.scenarios.length <= 1) return;
    setState(prev => {
      const next = prev.scenarios.filter(s => s.id !== prev.activeScenarioId);
      return { ...prev, scenarios: next, activeScenarioId: next[0].id };
    });
  };

  const openRename = () => setRenameDialog({ open: true, name: activeScenario.name });
  const confirmRename = () => {
    updateScenario(s => ({ ...s, name: renameDialog.name }));
    setRenameDialog({ open: false, name: '' });
  };

  const toggleCompare = () => {
    setState(prev => ({
      ...prev,
      compareMode: !prev.compareMode,
      compareScenarioIds: prev.scenarios.map(s => s.id),
    }));
  };

  const updateItem = (catId: string, itemId: string, field: string, value: unknown) => {
    updateScenario(s => ({
      ...s,
      categories: s.categories.map(c =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.map(i => i.id !== itemId ? i : { ...i, [field]: value }),
        },
      ),
    }));
  };

  const deleteItem = (catId: string, itemId: string) => {
    updateScenario(s => ({
      ...s,
      categories: s.categories.map(c =>
        c.id !== catId ? c : { ...c, items: c.items.filter(i => i.id !== itemId) },
      ),
    }));
  };

  const addItem = (catId: string) => {
    updateScenario(s => ({
      ...s,
      categories: s.categories.map(c =>
        c.id !== catId ? c : {
          ...c,
          items: [...c.items, { id: uid(), name: 'New item', unitCost: 0, quantity: 1, day: 'Day 2' as DayAssignment, isCustom: true, paid: 0 }],
        },
      ),
    }));
  };

  const updateTodos = (todos: TodoItem[]) => {
    setState(prev => ({ ...prev, todos }));
  };

  const updateBudgetTarget = (target: number) => {
    updateScenario(s => ({ ...s, budgetTarget: target }));
  };

  const activeTabIndex = state.scenarios.findIndex(s => s.id === state.activeScenarioId);

  const budgetProgress = activeScenario?.budgetTarget ? (totals.grand / activeScenario.budgetTarget) * 100 : 0;
  const paidProgress = totals.grand > 0 ? (totals.paid / totals.grand) * 100 : 0;
  const overBudget = budgetProgress > 100;

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ p: 2, width: isMobile ? 340 : SIDEBAR_WIDTH, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip
          label="Checklist"
          variant={sidebarTab === 'checklist' ? 'filled' : 'outlined'}
          onClick={() => setSidebarTab('checklist')}
          color={sidebarTab === 'checklist' ? 'primary' : 'default'}
        />
        <Chip
          label="Venues"
          variant={sidebarTab === 'venues' ? 'filled' : 'outlined'}
          onClick={() => setSidebarTab('venues')}
          color={sidebarTab === 'venues' ? 'primary' : 'default'}
        />
      </Box>
      {sidebarTab === 'checklist'
        ? <TodoList todos={state.todos} onUpdate={updateTodos} />
        : (
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>}>
            <VenueMap venues={state.venues} />
          </Suspense>
        )
      }
    </Box>
  );

  if (state.compareMode && state.scenarios.length > 1) {
    const compareScenarios = state.scenarios.filter(s => state.compareScenarioIds.includes(s.id));
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Wedding Budget Planner</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Sep 4–5, 2027 | Connecticut | {GUEST_COUNT} Guests
        </Typography>
        <ScenarioComparison scenarios={compareScenarios} guestCount={GUEST_COUNT} onClose={toggleCompare} />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Main budget area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>Wedding Budget Planner</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sep 4–5, 2027 | Connecticut | {GUEST_COUNT} Guests
              </Typography>
            </Box>
            {isMobile && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setSidebarTab('checklist'); setSidebarOpen(true); }}
                >
                  Tasks
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setSidebarTab('venues'); setSidebarOpen(true); }}
                >
                  Venues
                </Button>
              </Stack>
            )}
          </Box>

          {/* Scenario tabs + actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2, mb: 2 }}>
            <Tabs value={activeTabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ flexGrow: 1 }}>
              {state.scenarios.map(s => <Tab key={s.id} label={s.name} />)}
            </Tabs>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" onClick={addScenario}>New</Button>
              <Button size="small" onClick={duplicateScenario}>Duplicate</Button>
              <Button size="small" onClick={openRename}>Rename</Button>
              {state.scenarios.length > 1 && <Button size="small" color="error" onClick={deleteScenario}>Delete</Button>}
              {state.scenarios.length > 1 && <Button size="small" variant="outlined" onClick={toggleCompare}>Compare</Button>}
            </Stack>
          </Box>

          {/* Summary bar */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mb: 2 }}>
              {[
                { label: 'Day 1', value: totals.day1 },
                { label: 'Day 2', value: totals.day2 },
                { label: 'Grand Total', value: totals.grand },
                { label: 'Paid', value: totals.paid },
                { label: 'Remaining', value: totals.grand - totals.paid },
                { label: `Per Guest (${GUEST_COUNT})`, value: totals.grand / GUEST_COUNT },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(value)}</Typography>
                </Box>
              ))}
            </Box>

            {/* Budget target bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Budget</Typography>
              <Tooltip title={`${formatCurrency(totals.grand)} of ${formatCurrency(activeScenario.budgetTarget)}`}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetProgress, 100)}
                    color={overBudget ? 'error' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Tooltip>
              <TextField
                size="small"
                type="number"
                value={activeScenario.budgetTarget}
                onChange={e => updateBudgetTarget(Math.max(0, +e.target.value))}
                inputProps={{ min: 0, step: 5000 }}
                sx={{ width: 120, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.85rem' } }}
              />
            </Box>

            {/* Paid progress bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Paid</Typography>
              <Tooltip title={`${formatCurrency(totals.paid)} of ${formatCurrency(totals.grand)} paid`}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(paidProgress, 100)}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Tooltip>
              <Typography variant="caption" sx={{ width: 120, textAlign: 'right' }}>
                {Math.round(paidProgress)}% paid
              </Typography>
            </Box>
          </Paper>

          {/* Category accordions */}
          {activeScenario.categories.map(cat => {
            const catTotal = cat.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
            const catPaid = cat.items.reduce((sum, i) => sum + i.paid, 0);
            return (
              <Accordion key={cat.id} defaultExpanded={false} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 1, alignItems: 'center' }}>
                    <Typography fontWeight="bold">{cat.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {catPaid > 0 && (
                        <Chip label={`${formatCurrency(catPaid)} paid`} size="small" color="success" variant="outlined" />
                      )}
                      <Typography fontWeight="bold" color="text.secondary">{formatCurrency(catTotal)}</Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Header row (desktop) */}
                  {!isSmall && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 1fr 1fr 1fr 40px', gap: 1, mb: 1, px: 1 }}>
                      <Typography variant="caption" color="text.secondary">Item</Typography>
                      <Typography variant="caption" color="text.secondary">Unit Cost</Typography>
                      <Typography variant="caption" color="text.secondary">Qty</Typography>
                      <Typography variant="caption" color="text.secondary">Day</Typography>
                      <Typography variant="caption" color="text.secondary">Paid</Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="right">Subtotal</Typography>
                      <span />
                    </Box>
                  )}

                  {cat.items.map(item => {
                    const subtotal = item.unitCost * item.quantity;
                    return isSmall ? (
                      <Paper key={item.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          <TextField size="small" label="Item" value={item.name} fullWidth
                            onChange={e => updateItem(cat.id, item.id, 'name', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
                          <TextField size="small" label="Cost" type="number" value={item.unitCost}
                            onChange={e => updateItem(cat.id, item.id, 'unitCost', Math.max(0, +e.target.value))}
                            inputProps={{ min: 0 }} />
                          <TextField size="small" label="Qty" type="number" value={item.quantity}
                            onChange={e => updateItem(cat.id, item.id, 'quantity', Math.max(1, +e.target.value))}
                            inputProps={{ min: 1 }} />
                          <Select size="small" value={item.day}
                            onChange={e => updateItem(cat.id, item.id, 'day', e.target.value)}>
                            {DAY_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                          </Select>
                          <TextField size="small" label="Paid" type="number" value={item.paid}
                            onChange={e => updateItem(cat.id, item.id, 'paid', Math.max(0, +e.target.value))}
                            inputProps={{ min: 0 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
                            <Typography fontWeight="bold">{formatCurrency(subtotal)}</Typography>
                            <IconButton size="small" onClick={() => deleteItem(cat.id, item.id)}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ) : (
                      <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 1fr 1fr 1fr 40px', gap: 1, alignItems: 'center', mb: 0.5, px: 1 }}>
                        <TextField size="small" variant="standard" value={item.name}
                          onChange={e => updateItem(cat.id, item.id, 'name', e.target.value)} />
                        <TextField size="small" variant="standard" type="number" value={item.unitCost}
                          onChange={e => updateItem(cat.id, item.id, 'unitCost', Math.max(0, +e.target.value))}
                          inputProps={{ min: 0 }} />
                        <TextField size="small" variant="standard" type="number" value={item.quantity}
                          onChange={e => updateItem(cat.id, item.id, 'quantity', Math.max(1, +e.target.value))}
                          inputProps={{ min: 1 }} />
                        <Select size="small" variant="standard" value={item.day}
                          onChange={e => updateItem(cat.id, item.id, 'day', e.target.value)}>
                          {DAY_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                        <TextField size="small" variant="standard" type="number" value={item.paid}
                          onChange={e => updateItem(cat.id, item.id, 'paid', Math.max(0, +e.target.value))}
                          inputProps={{ min: 0 }}
                          sx={{ '& input': { color: item.paid > 0 ? 'success.main' : undefined } }}
                        />
                        <Typography textAlign="right" fontWeight="bold">{formatCurrency(subtotal)}</Typography>
                        <IconButton size="small" onClick={() => deleteItem(cat.id, item.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    );
                  })}
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addItem(cat.id)} sx={{ mt: 1 }}>
                    Add Item
                  </Button>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Rename dialog */}
          <Dialog open={renameDialog.open} onClose={() => setRenameDialog({ open: false, name: '' })}>
            <DialogTitle>Rename Scenario</DialogTitle>
            <DialogContent>
              <TextField autoFocus fullWidth value={renameDialog.name} onChange={e => setRenameDialog(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && confirmRename()} sx={{ mt: 1 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRenameDialog({ open: false, name: '' })}>Cancel</Button>
              <Button variant="contained" onClick={confirmRename}>Save</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>

      {/* Desktop sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderLeft: 1,
            borderColor: 'divider',
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          {sidebarContent}
        </Drawer>
      )}
    </Box>
  );
};

export default WeddingBudget;
