import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Ensure this is imported
import App from './App.tsx';
import './index.css'; // Or your global CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* This is the ONLY place BrowserRouter should be */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);