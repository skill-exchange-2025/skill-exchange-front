// src/App.tsx
import {ThemeProvider} from '@/components/theme-provider';
import {Outlet} from 'react-router-dom';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
}
