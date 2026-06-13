import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../../../theme';
import { StatePanel } from './StatePanel';

const renderPanel = (iso: string | null) =>
  render(
    <ThemeProvider theme={getTheme}>
      <StatePanel iso={iso} />
    </ThemeProvider>
  );

describe('StatePanel', () => {
  test('shows a hint when nothing is selected', () => {
    renderPanel(null);
    expect(screen.getByText(/hover a state to preview/i)).toBeInTheDocument();
  });

  test('shows the defection flag for a flipped state (Kano: NNPP → APC)', () => {
    renderPanel('NG-KN');
    expect(screen.getByText(/Abba Kabir Yusuf/)).toBeInTheDocument();
    expect(screen.getByText(/NNPP → APC/)).toBeInTheDocument();
    expect(screen.getByText(/race to watch/i)).toBeInTheDocument();
  });

  test('term-limited state reads "No — term-limited"', () => {
    renderPanel('NG-LA'); // Lagos, 2nd/final term
    expect(screen.getByText(/No — term-limited/)).toBeInTheDocument();
  });

  test('FCT shows N/A for re-election and the minister note', () => {
    renderPanel('NG-FC');
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText(/administered by a Minister/i)).toBeInTheDocument();
    // FCT has no defection flag
    expect(screen.queryByText(/Defection/)).not.toBeInTheDocument();
  });
});
