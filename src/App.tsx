import {
  Route,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements
} from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { Navbar } from './base/navbar';
import { Footer } from './base/footer';

import { MainPage } from './views/main/index';
import { ProjectPage } from './views/projects/index';
import { BlogPosts, BlogPage } from './views/blog/index';

import theme from './theme';


const AppProviderLayout = () => {
  return (
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
        <Outlet />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}


const routes = createRoutesFromElements(
  <Route element={<AppProviderLayout />} errorElement={<MainPage />}>

    <Route path="/" element={<MainPage />} />

    <Route path="/projects" element={<ProjectPage />} />

    <Route path="/blog" element={<BlogPosts />} />

    <Route path="/blog/:slug" element={<BlogPage />} />
    
  </Route>
);


const router = createBrowserRouter(routes);

export const App = () => <RouterProvider router={router} />