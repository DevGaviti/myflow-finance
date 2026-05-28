import React from 'react';
import ReactDOM from 'react-dom/client';

import { Toaster } from 'react-hot-toast';

import App from './App.tsx';

import { AuthProvider } from './contexts/AuthContext';

import './styles/global.css';

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,

          style: {
            background: '#111827',
            color: '#fff',
            border:
              '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '14px 16px',
            fontWeight: '700',
            boxShadow:
              '0 20px 40px rgba(0,0,0,0.28)',
          },

          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },

          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <App />
    </AuthProvider>
  </React.StrictMode>,
);