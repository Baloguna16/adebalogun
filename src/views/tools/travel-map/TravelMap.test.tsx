import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../theme';
import { TravelMap } from './TravelMap';

const worldTopo = {
  type: 'Topology',
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          id: '840',
          arcs: [[0]],
          properties: { name: 'United States of America' },
        },
        { type: 'Polygon', id: '392', arcs: [[1]], properties: { name: 'Japan' } },
      ],
    },
  },
  arcs: [
    [[-79, 40.5], [-79, 45], [-72, 45], [-72, 40.5], [-79, 40.5]],
    [[135, 34], [135, 36], [140, 36], [140, 34], [135, 34]],
  ],
};

const usTopo = {
  type: 'Topology',
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Polygon', id: '36', arcs: [[0]], properties: { name: 'New York' } },
      ],
    },
  },
  arcs: [[[-79, 40.5], [-79, 45], [-72, 45], [-72, 40.5], [-79, 40.5]]],
};

beforeEach(() => {
  global.fetch = jest.fn((url: any) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(String(url).includes('countries') ? worldTopo : usTopo),
    })
  ) as any;
});

const renderPage = async () => {
  await act(async () => {
    render(
      <ThemeProvider theme={getTheme('light')}>
        <TravelMap />
      </ThemeProvider>
    );
  });
};

test('shows the stats header', async () => {
  await renderPage();
  expect(await screen.findByText(/\/ 195 countries/)).toBeInTheDocument();
  expect(screen.getByText(/\/ 50 states/)).toBeInTheDocument();
});

test('clicking the US drills down to the states view and back', async () => {
  await renderPage();
  const us = await screen.findByRole('button', { name: /United States/ });
  userEvent.click(us);
  expect(await screen.findByRole('button', { name: /world/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /New York/ })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /world/i }));
  expect(
    await screen.findByRole('button', { name: /United States/ })
  ).toBeInTheDocument();
});

test('shows an error alert with retry when geo data fails to load', async () => {
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
  );
  await renderPage();
  expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
