import {resolveAccentColors} from '../accentPalettes';

describe('accent theme palettes', () => {
  it('uses the Doom green accent in light and dark modes', () => {
    expect(resolveAccentColors('doom', 'light').primary).toBe('#176B3B');
    expect(resolveAccentColors('doom', 'dark').primary).toBe('#91E7A9');
  });

  it('keeps the original palette available as Classic', () => {
    expect(resolveAccentColors('classic', 'light')).toEqual({});
    expect(resolveAccentColors('classic', 'dark')).toEqual({});
  });

  it('provides an alternate Violet accent without changing the theme surface', () => {
    const colors = resolveAccentColors('violet', 'light');
    expect(colors.primary).toBe('#6D3CC3');
    expect(colors.error).toBeUndefined();
  });
});
