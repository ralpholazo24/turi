/**
 * Consistent border radius values used across the app
 * Based on Duolingo-style design with rounded corners
 */

export const BORDER_RADIUS = {
  // Small elements (tabs, badges, small buttons)
  small: 8,
  
  // Medium elements (buttons, inputs, icon buttons)
  medium: 12,
  
  // Large elements (cards, modals)
  large: 16,
  
  // Extra large elements (main cards, modal top corners)
  xlarge: 20,
  
  // Circular elements (avatars)
  circular: {
    small: 12,   // Small avatars/badges
    medium: 16,  // Medium avatars
    large: 28,   // Large avatars
    xlarge: 32,  // Extra large avatars
    full: 60,    // Full circular (like add member avatar)
  },
} as const;

