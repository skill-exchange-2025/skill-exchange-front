// src/App.tsx
import React, { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

const App: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  // Sync the token from Redux to localStorage
  useEffect(() => {
    // If token exists in Redux but not in localStorage, sync it
    if (token && !localStorage.getItem('token')) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
};

export default App;
