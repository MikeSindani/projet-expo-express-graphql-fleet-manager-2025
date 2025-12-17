import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: async () => {},
  toggleTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  
  // Initialize theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          setThemeState(storedTheme as Theme);
          setColorScheme(storedTheme as any);
        } else {
            setColorScheme('system');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    setColorScheme(newTheme as any);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider 
        value={{ 
            theme, 
            isDark: colorScheme === 'dark', 
            setTheme, 
            toggleTheme 
        }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
