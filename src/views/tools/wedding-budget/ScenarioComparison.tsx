import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box,
} from '@mui/material';
import { Scenario, GUEST_COUNT, formatCurrency } from './types';

interface Props {
  scenarios: Scenario[];
  guestCount: number;
  onClose: () => void;
}

const categoryTotal = (s: Scenario, catName: string) =>
  s.categories.find(c => c.name === catName)?.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0) ?? 0;

const grandTotal = (s: Scenario) =>
  s.categories.reduce((sum, c) => sum + c.items.reduce((s2, i) => s2 + i.unitCost * i.quantity, 0), 0);

export const ScenarioComparison = ({ scenarios, guestCount, onClose }: Props) => {
  const allCategoryNames = Array.from(new Set(scenarios.flatMap(s => s.categories.map(c => c.name))));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Scenario Comparison</Typography>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              {scenarios.map(s => (
                <TableCell key={s.id} align="right" sx={{ fontWeight: 'bold' }}>{s.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allCategoryNames.map(name => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {scenarios.map(s => (
                  <TableCell key={s.id} align="right">{formatCurrency(categoryTotal(s, name))}</TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: 2, borderColor: 'divider' } }}>
              <TableCell>Grand Total</TableCell>
              {scenarios.map(s => (
                <TableCell key={s.id} align="right">{formatCurrency(grandTotal(s))}</TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
              <TableCell>Per Guest ({guestCount})</TableCell>
              {scenarios.map(s => (
                <TableCell key={s.id} align="right">{formatCurrency(grandTotal(s) / (guestCount || GUEST_COUNT))}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
