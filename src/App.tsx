import { lazy, Suspense, useState, useMemo, createContext } from 'react';
import {
  Route,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements
} from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { Navbar } from './base/navbar';
import { Footer } from './base/footer';

import { MainPage } from './views/main/index';

import { getTheme } from './theme';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const ProjectPosts = lazy(() => import('./views/projects/ProjectPosts').then(m => ({ default: m.ProjectPosts })));
const WaterMap = lazy(() => import('./views/projects/nyc-water/WaterMap').then(m => ({ default: m.WaterMap })));
const BlogPosts = lazy(() => import('./views/blog/BlogPosts').then(m => ({ default: m.BlogPosts })));
const PostPage = lazy(() => import('./views/blog/post/PostPage').then(m => ({ default: m.PostPage })));
const NotFound = lazy(() => import('./views/NotFound').then(m => ({ default: m.NotFound })));
const GameOfLife = lazy(() => import('./views/life/GameOfLife').then(m => ({ default: m.GameOfLife })));
const HubbubPage = lazy(() => import('./views/projects/hubbub').then(m => ({ default: m.HubbubPage })));
const ToolsIndex = lazy(() => import('./views/tools/ToolsIndex').then(m => ({ default: m.ToolsIndex })));
const MarkdownViewer = lazy(() => import('./views/tools/markdown-viewer/MarkdownViewer').then(m => ({ default: m.MarkdownViewer })));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
    <CircularProgress />
  </Box>
);

const AppProviderLayout = () => {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem('colorMode') as PaletteMode) || 'light'
  );

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prev) => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('colorMode', next);
        return next;
      });
    },
  }), []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
          mb={0}
        >
          <Navbar />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
          <Footer />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}


const routes = createRoutesFromElements(
  <Route element={<AppProviderLayout />}>

    <Route path="/" element={<MainPage />} />

    <Route path="/projects" element={<ProjectPosts />} />

    <Route path="/projects/nyc-water" element={<WaterMap />} />

    <Route path="/projects/hubbub" element={<HubbubPage />} />

    <Route path="/blog" element={<BlogPosts />} />

    <Route path="/blog/:slug" element={<PostPage />} />

    <Route path="/life" element={<GameOfLife />} />

    <Route path="/tools" element={<ToolsIndex />} />
    <Route path="/tools/markdown-viewer" element={<MarkdownViewer />} />

    <Route path="*" element={<NotFound />} />

  </Route>
);


const router = createBrowserRouter(routes);

export const App = () => <RouterProvider router={router} />
