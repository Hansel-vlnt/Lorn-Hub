import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type FontFamilyMode = 'sans' | 'serif';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface ThemeContextType {
  theme: ThemeMode;
  fontFamily: FontFamilyMode;
  fontSize: FontSize;
  setTheme: (theme: ThemeMode) => void;
  setFontFamily: (font: FontFamilyMode) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('lorn_hub_theme') as ThemeMode) || 'dark';
  });

  const [fontFamily, setFontFamily] = useState<FontFamilyMode>(() => {
    return (localStorage.getItem('lorn_hub_font_family') as FontFamilyMode) || 'sans';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('lorn_hub_font_size') as FontSize) || 'base';
  });

  useEffect(() => {
    localStorage.setItem('lorn_hub_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lorn_hub_font_family', fontFamily);
    const root = document.documentElement;
    root.classList.toggle('font-serif', fontFamily === 'serif');
    root.classList.toggle('font-sans', fontFamily === 'sans');
    root.setAttribute('data-font-family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('lorn_hub_font_size', fontSize);
    const root = document.documentElement;
    const sizeMap: Record<FontSize, string> = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    };
    root.style.fontSize = sizeMap[fontSize] || '16px';
    root.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontFamily,
        fontSize,
        setTheme,
        setFontFamily,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
