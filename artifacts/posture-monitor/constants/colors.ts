/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17252B',
    tint: '#2C8F79',

    // Core surfaces
    background: '#F5F8F5',
    foreground: '#17252B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#17252B',

    // Primary action color (buttons, links, active states)
    primary: '#2C8F79',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E6F1EB',
    secondaryForeground: '#235E52',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E9F0EC',
    mutedForeground: '#6B7D76',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFF0E8',
    accentForeground: '#A34D32',

    // Destructive actions (delete, error states)
    destructive: '#D96346',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#DDE8E1',
    input: '#DDE8E1',
  },
  dark: {
    text: '#F5F8F5',
    tint: '#7DD7BB',
    background: '#10201E',
    foreground: '#F5F8F5',
    card: '#18302C',
    cardForeground: '#F5F8F5',
    primary: '#7DD7BB',
    primaryForeground: '#10201E',
    secondary: '#203D37',
    secondaryForeground: '#B9F0DF',
    muted: '#203D37',
    mutedForeground: '#9AB8AE',
    accent: '#4D3028',
    accentForeground: '#FFC2AE',
    destructive: '#F18A70',
    destructiveForeground: '#10201E',
    border: '#2B4C44',
    input: '#2B4C44',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
