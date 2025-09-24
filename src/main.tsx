import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.tsx';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './i18n/config';

// Create light theme (remove dark theme as requested)
const theme = createTheme({
  colorScheme: 'light',
  primaryColor: 'indigo',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);