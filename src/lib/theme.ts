import { useColorScheme } from 'react-native';

// Soft palette: lavender accents on a pale background, gentle borders.
const light = {
  bg: '#F4F2FA',
  card: '#FFFFFF',
  text: '#2B2841',
  muted: '#7C7897',
  accent: '#7D6FCB',
  accentSoft: '#EEEBFA',
  border: '#E9E5F5',
};

const dark: typeof light = {
  bg: '#1A1826',
  card: '#242235',
  text: '#EFEDF8',
  muted: '#A29EBD',
  accent: '#B7ABF5',
  accentSoft: '#2E2A48',
  border: '#33304D',
};

export type Colors = typeof light;

// Shared corner radii so every card and button feels the same.
export const radius = { card: 26, button: 18, pill: 999 };

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
