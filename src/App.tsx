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
import { ProjectPosts, WaterMap } from './views/projects/index';
import { BlogPosts } from './views/blog/index';
import { PostPage } from './views/blog/post/index';

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

    <Route path="/projects" element={<ProjectPosts />} />

    <Route path="/projects/nyc-water" element={<WaterMap />} />

    <Route path="/blog" element={<BlogPosts />} />

    <Route path="/blog/:slug" element={<PostPage />} />
    
  </Route>
);


const router = createBrowserRouter(routes);

export const App = () => <RouterProvider router={router} />