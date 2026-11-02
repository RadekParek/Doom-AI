export type AccentTheme = 'doom' | 'classic' | 'violet';
export type ThemeMode = 'light' | 'dark';

type AccentColors = Record<string, string>;

const PALETTES: Record<
  Exclude<AccentTheme, 'classic'>,
  Record<ThemeMode, AccentColors>
> = {
  doom: {
    light: {
      primary: '#176B3B',
      onPrimary: '#FFFFFF',
      primaryContainer: '#DCFCE7',
      onPrimaryContainer: '#14532D',
      secondary: '#15803D',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#E7F8EC',
      onSecondaryContainer: '#14532D',
      tertiary: '#0F766E',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#CCFBF1',
      onTertiaryContainer: '#134E4A',
      inversePrimary: '#A7F3D0',
    },
    dark: {
      primary: '#91E7A9',
      onPrimary: '#082411',
      primaryContainer: '#164B2A',
      onPrimaryContainer: '#D4F8DC',
      secondary: '#9BEAB0',
      onSecondary: '#0B2A14',
      secondaryContainer: '#1E4429',
      onSecondaryContainer: '#D6F5DE',
      tertiary: '#8EE2D1',
      onTertiary: '#07352F',
      tertiaryContainer: '#155A50',
      onTertiaryContainer: '#B8F3E7',
      inversePrimary: '#176B3B',
    },
  },
  violet: {
    light: {
      primary: '#6D3CC3',
      onPrimary: '#FFFFFF',
      primaryContainer: '#EDE2FF',
      onPrimaryContainer: '#351268',
      secondary: '#6843A8',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#F0E8FF',
      onSecondaryContainer: '#341B61',
      tertiary: '#5557A6',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#E5E5FF',
      onTertiaryContainer: '#292A69',
      inversePrimary: '#D7C2FF',
    },
    dark: {
      primary: '#D2B8FF',
      onPrimary: '#32115F',
      primaryContainer: '#4E2A87',
      onPrimaryContainer: '#F0E6FF',
      secondary: '#D9C5FF',
      onSecondary: '#35205D',
      secondaryContainer: '#4B3475',
      onSecondaryContainer: '#F0E7FF',
      tertiary: '#C6C7FF',
      onTertiary: '#25265E',
      tertiaryContainer: '#3F407E',
      onTertiaryContainer: '#E5E5FF',
      inversePrimary: '#6D3CC3',
    },
  },
};

/** Classic preserves the original theme palette; other accents override only
 * semantic accent roles and leave surfaces, warnings, and error colors intact. */
export function resolveAccentColors(
  accent: AccentTheme,
  mode: ThemeMode,
): AccentColors {
  return accent === 'classic' ? {} : PALETTES[accent][mode];
}
