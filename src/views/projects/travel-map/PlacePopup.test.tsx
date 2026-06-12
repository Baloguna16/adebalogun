import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../theme';
import { PlacePopup } from './PlacePopup';
import { Place } from './travelData';

const japan: Place = {
  id: '392',
  name: 'Japan',
  visits: [
    { date: '2019-11', note: 'first trip' },
    { date: '2024-03', note: 'cherry blossoms', cities: ['Tokyo', 'Kyoto'] },
  ],
};

const renderPopup = (place: Place) =>
  render(
    <ThemeProvider theme={getTheme('light')}>
      <PlacePopup
        selection={{ place, pos: { top: 10, left: 10 } }}
        onClose={() => {}}
      />
    </ThemeProvider>
  );

test('renders visits newest first with notes and cities', () => {
  renderPopup(japan);
  expect(screen.getByText('Japan')).toBeInTheDocument();
  const dates = screen
    .getAllByText(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)
    .map((el) => el.textContent);
  expect(dates).toEqual(['March 2024', 'November 2019']);
  expect(screen.getByText('cherry blossoms')).toBeInTheDocument();
  expect(screen.getByText('Tokyo · Kyoto')).toBeInTheDocument();
});

test('omits note and cities cleanly when absent', () => {
  renderPopup({ id: '250', name: 'France', visits: [{ date: '2022-06' }] });
  expect(screen.getByText('France')).toBeInTheDocument();
  expect(screen.getByText('June 2022')).toBeInTheDocument();
});
