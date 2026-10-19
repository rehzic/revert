import { useColorScheme } from 'react-native';

// Garden Glow: mint background and emerald accents, with dark text for easy reading.
const light = {
  bg: '#E4F5EA',
  card: '#F5FBF7',
  text: '#0F2A22',
  muted: '#3E5C52',
  accent: '#00875A',
  accentSoft: '#CDEEDC',
  border: '#B9E0CA',
};

const dark: typeof light = {
  bg: '#0F2620',
  card: '#173A2F',
  text: '#EAF8F0',
  muted: '#A9CDBD',
  accent: '#4FD6A0',
  accentSoft: '#214F40',
  border: '#2A5B4A',
};

export type Colors = typeof light;

// Shared corner radii so every card and button feels the same.
export const radius = { card: 26, button: 18, pill: 999 };

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
