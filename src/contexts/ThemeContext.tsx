import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

export type Theme =
  | 'native' | 'star-citizen' | 'destiny' | 'nier' | 'princier' | 'princier-2'
  | 'siegfried' | 'castlevania' | 'jojal'
  | 'halloween-2' | 'ff14';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('native');

  useEffect(() => {
    // Appliquer la classe de thème au body
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 