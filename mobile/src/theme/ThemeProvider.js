import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME, THEME_MODES, THEMES } from './theme';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'hotelhub_theme';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(THEME_MODES.LIGHT);
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme() || 'light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && saved && Object.values(THEME_MODES).includes(saved)) {
          setThemeMode(saved);
        }
      } catch (error) {
        console.warn('Theme load failed:', error.message);
      } finally {
        if (mounted) setReady(true);
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  const effectiveMode = useMemo(() => {
    if (themeMode === THEME_MODES.SYSTEM) {
      return systemColorScheme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    }
    return themeMode === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT;
  }, [systemColorScheme, themeMode]);

  const theme = useMemo(() => THEMES[effectiveMode] || LIGHT_THEME, [effectiveMode]);

  const setMode = useCallback(async (nextMode) => {
    const normalizedMode = Object.values(THEME_MODES).includes(nextMode) ? nextMode : THEME_MODES.LIGHT;
    setThemeMode(normalizedMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, normalizedMode);
    } catch (error) {
      console.warn('Theme save failed:', error.message);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode = effectiveMode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    await setMode(nextMode);
  }, [effectiveMode, setMode]);

  const value = useMemo(() => ({
    theme,
    isDark: effectiveMode === THEME_MODES.DARK,
    themeMode,
    setThemeMode: setMode,
    toggleTheme,
    ready,
  }), [effectiveMode, ready, setMode, theme, themeMode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
