import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { UserDataProvider } from './context/UserDataContext';
import { LawProvider } from './context/LawContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserDataProvider>
        <LawProvider>
          <App />
        </LawProvider>
      </UserDataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
