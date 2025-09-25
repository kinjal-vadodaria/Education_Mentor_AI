import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { MantineThemeOverride } from '@mantine/core';

export interface CustomTheme {
  primary: string;
  background: string;
  text: string;
}

export interface PresetTheme {
  name: string;
  primary: string;
  background: string;
  text: string;
}

const presetThemes: PresetTheme[] = [
  {
    name: 'Indigo',
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#000000',
  },
  {
    name: 'Red',
    primary: '#dc2626',
    background: '#fef2f2',
    text: '#1f2937',
  },
  {
    name: 'Blue',
    primary: '#2563eb',
    background: '#eff6ff',
    text: '#1e293b',
  },
  {
    name: 'Green',
    primary: '#16a34a',
    background: '#f0fdf4',
    text: '#14532d',
  },
  {
    name: 'Purple',
    primary: '#9333ea',
    background: '#faf5ff',
    text: '#2d1b69',
  },
  {
    name: 'Orange',
    primary: '#ea580c',
    background: '#fff7ed',
    text: '#431407',
  },
  {
    name: 'Teal',
    primary: '#0d9488',
    background: '#f0fdfa',
    text: '#0f5132',
  },
];

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  currentTheme: PresetTheme | null;
  customTheme: CustomTheme | null;
  setPresetTheme: (theme: PresetTheme) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  resetToDefault: () => void;
  presetThemes: PresetTheme[];
  mantineTheme: MantineThemeOverride;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [currentTheme, setCurrentTheme] = useState<PresetTheme | null>(null);
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);
  const [mantineTheme, setMantineTheme] = useState<MantineThemeOverride>({
    primaryColor: 'indigo',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    headings: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    },
    colors: {
      primary: Array(10).fill('#3b82f6') as [string, string, string, string, string, string, string, string, string, string], // default indigo
    },
  });

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
  };

  // Load saved color scheme on mount
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('colorScheme');
    if (savedColorScheme === 'dark' || savedColorScheme === 'light') {
      setColorScheme(savedColorScheme);
    }
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    const savedPreset = localStorage.getItem('selectedPresetTheme');
    const savedCustom = localStorage.getItem('customTheme');

    if (savedPreset) {
      const preset = presetThemes.find(t => t.name === savedPreset);
      if (preset) {
        setCurrentTheme(preset);
        applyTheme(preset);
      }
    }

    if (savedCustom) {
      const custom = JSON.parse(savedCustom);
      setCustomThemeState(custom);
      applyCustomTheme(custom);
    }
  }, []);

  const applyTheme = (theme: PresetTheme) => {
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-background', theme.background);
    document.documentElement.style.setProperty('--theme-text', theme.text);
    setMantineTheme(prev => ({
      ...prev,
      primaryColor: 'primary',
      colors: {
        ...prev.colors,
        primary: Array(10).fill(theme.primary) as [string, string, string, string, string, string, string, string, string, string],
      },
    }));
  };

  const applyCustomTheme = (theme: CustomTheme) => {
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-background', theme.background);
    document.documentElement.style.setProperty('--theme-text', theme.text);
    setMantineTheme(prev => ({
      ...prev,
      primaryColor: 'primary',
      colors: {
        ...prev.colors,
        primary: Array(10).fill(theme.primary) as [string, string, string, string, string, string, string, string, string, string],
      },
    }));
  };

  const setPresetTheme = (theme: PresetTheme) => {
    setCurrentTheme(theme);
    setCustomThemeState(null);
    applyTheme(theme);
    localStorage.setItem('selectedPresetTheme', theme.name);
    localStorage.removeItem('customTheme');
  };

  const setCustomTheme = (theme: CustomTheme) => {
    setCustomThemeState(theme);
    setCurrentTheme(null);
    applyCustomTheme(theme);
    localStorage.setItem('customTheme', JSON.stringify(theme));
    localStorage.removeItem('selectedPresetTheme');
  };

  const resetToDefault = () => {
    setCurrentTheme(null);
    setCustomThemeState(null);
    document.documentElement.style.removeProperty('--theme-primary');
    document.documentElement.style.removeProperty('--theme-background');
    document.documentElement.style.removeProperty('--theme-text');
    setMantineTheme({
      primaryColor: 'indigo',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      headings: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      },
      colors: {
        primary: Array(10).fill('#3b82f6') as [string, string, string, string, string, string, string, string, string, string],
      },
    });
    localStorage.removeItem('selectedPresetTheme');
    localStorage.removeItem('customTheme');
  };

  // Apply default preset on initial load if no saved theme
  useEffect(() => {
    if (!currentTheme && !customTheme) {
      const defaultPreset = presetThemes.find(t => t.name === 'Indigo');
      if (defaultPreset) {
        setPresetTheme(defaultPreset);
      }
    }
  }, []);

  const value: ThemeContextType = {
    colorScheme,
    toggleColorScheme,
    currentTheme,
    customTheme,
    setPresetTheme,
    setCustomTheme,
    resetToDefault,
    presetThemes,
    mantineTheme,
  };

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={colorScheme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </MantineProvider>
  );
};
