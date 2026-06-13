import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../../../theme';
import { LayerToggle } from './LayerToggle';

const noop = () => {};

const renderToggle = (hasWatch: boolean) =>
  render(
    <ThemeProvider theme={getTheme}>
      <LayerToggle
        layer="party"
        showWatch={false}
        hasWatch={hasWatch}
        onLayer={noop}
        onToggleWatch={noop}
      />
    </ThemeProvider>
  );

describe('LayerToggle', () => {
  test('always offers the two factual layers', () => {
    renderToggle(true);
    expect(screen.getByRole('button', { name: /party control/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /election timing/i })).toBeInTheDocument();
  });

  test('shows the races-to-watch switch when watch data exists', () => {
    renderToggle(true);
    expect(screen.getByText(/races to watch/i)).toBeInTheDocument();
  });

  test('hides the races-to-watch switch when there is no watch data', () => {
    renderToggle(false);
    expect(screen.queryByText(/races to watch/i)).not.toBeInTheDocument();
  });
});
