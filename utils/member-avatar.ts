// Microsoft Teams-style color palette
const AVATAR_COLORS = [
  '#00B7C3', // Teal
  '#0078D4', // Blue
  '#5C2D91', // Purple
  '#E81123', // Red
  '#FF8C00', // Orange
  '#107C10', // Green
  '#0078D7', // Light Blue
  '#8764B8', // Lavender
  '#FF4343', // Pink
  '#00BCF2', // Cyan
  '#FFB900', // Yellow
  '#737373', // Gray
];

/**
 * Generate initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a random color from the avatar color palette
 */
export function getRandomAvatarColor(): string {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
}

/**
 * Generate a consistent color from a name (for backward compatibility)
 */
export function getColorFromName(name: string): string {
  if (!name.trim()) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

