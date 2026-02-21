import { useRef, useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Button, Slider, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PlayArrow, Pause, SkipNext, Clear, Shuffle } from '@mui/icons-material';

const CELL_SIZE = 10;

const createEmptyGrid = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () => Array(cols).fill(false));

const randomizeGrid = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.7)
  );

const countNeighbors = (grid: boolean[][], row: number, col: number): number => {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = (row + dr + rows) % rows;
      const c = (col + dc + cols) % cols;
      if (grid[r][c]) count++;
    }
  }
  return count;
};

const nextGeneration = (grid: boolean[][]): boolean[][] => {
  const rows = grid.length;
  const cols = grid[0].length;
  return grid.map((rowArr, r) =>
    rowArr.map((alive, c) => {
      const neighbors = countNeighbors(grid, r, c);
      return alive ? neighbors === 2 || neighbors === 3 : neighbors === 3;
    })
  );
};

export const GameOfLife = () => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<boolean[][]>([]);
  const runningRef = useRef(false);
  const speedRef = useRef(100);

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0 });

  const isDark = theme.palette.mode === 'dark';
  const cellColor = isDark ? '#90caf9' : '#556cd6';
  const gridColor = isDark ? '#333' : '#ddd';
  const bgColor = isDark ? '#121212' : '#fff';

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grid = gridRef.current;
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = cellColor;
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(cols * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, rows * CELL_SIZE);
      ctx.stroke();
    }
  }, [bgColor, cellColor, gridColor]);

  // Initialize grid based on container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const width = container.clientWidth;
      const cols = Math.floor(width / CELL_SIZE);
      const rows = Math.floor((window.innerHeight - 300) / CELL_SIZE);
      const actualRows = Math.max(rows, 20);

      setDimensions({ rows: actualRows, cols });
      gridRef.current = randomizeGrid(actualRows, cols);
      setGeneration(0);

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = cols * CELL_SIZE;
        canvas.height = actualRows * CELL_SIZE;
      }
      draw();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [draw]);

  // Redraw when theme changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Game loop
  useEffect(() => {
    runningRef.current = running;
    if (!running) return;

    let timeoutId: number;
    const step = () => {
      if (!runningRef.current) return;
      gridRef.current = nextGeneration(gridRef.current);
      setGeneration((g) => g + 1);
      draw();
      timeoutId = window.setTimeout(step, 1000 / speedRef.current * 10);
    };
    step();

    return () => clearTimeout(timeoutId);
  }, [running, draw]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (row >= 0 && row < gridRef.current.length && col >= 0 && col < gridRef.current[0].length) {
      gridRef.current[row][col] = !gridRef.current[row][col];
      draw();
    }
  };

  const handleStep = () => {
    gridRef.current = nextGeneration(gridRef.current);
    setGeneration((g) => g + 1);
    draw();
  };

  const handleClear = () => {
    setRunning(false);
    gridRef.current = createEmptyGrid(dimensions.rows, dimensions.cols);
    setGeneration(0);
    draw();
  };

  const handleRandomize = () => {
    gridRef.current = randomizeGrid(dimensions.rows, dimensions.cols);
    setGeneration(0);
    draw();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Game of Life
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Conway's Game of Life — click cells to toggle, then press play.
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={running ? <Pause /> : <PlayArrow />}
            onClick={() => setRunning(!running)}
          >
            {running ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outlined" size="small" startIcon={<SkipNext />} onClick={handleStep} disabled={running}>
            Step
          </Button>
          <Button variant="outlined" size="small" startIcon={<Clear />} onClick={handleClear}>
            Clear
          </Button>
          <Button variant="outlined" size="small" startIcon={<Shuffle />} onClick={handleRandomize}>
            Randomize
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Gen: {generation}
          </Typography>
          <Box sx={{ width: 120, ml: 2 }}>
            <Slider
              size="small"
              value={speed}
              min={10}
              max={200}
              onChange={(_, v) => setSpeed(v as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
          </Box>
        </Stack>

        <Box ref={containerRef} sx={{ width: '100%', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ cursor: 'crosshair', display: 'block' }}
          />
        </Box>
      </Box>
    </Container>
  );
};
