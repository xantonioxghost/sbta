import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { usePosture } from '@/context/PostureContext';

/**
 * Returns the design tokens for the active color scheme (Light or Dark).
 * Reads user preference from PostureContext or falls back to system color scheme.
 */
export function useColors() {
  const systemScheme = useColorScheme();
  let activeScheme: 'light' | 'dark' = systemScheme === 'dark' ? 'dark' : 'light';

  try {
    const posture = usePosture();
    const prefTheme = posture?.preferences?.theme;
    if (prefTheme === 'light' || prefTheme === 'dark') {
      activeScheme = prefTheme;
    }
  } catch {
    // Fallback if rendered outside PostureProvider context
  }

  const palette = activeScheme === 'dark' ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}

