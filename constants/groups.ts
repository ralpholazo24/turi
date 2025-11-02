/**
 * Group-related constants
 * Includes icon options and color presets for group creation
 */

// Icon options with Airbnb-style icons from Lucide
export const GROUP_ICON_OPTIONS = [
  { name: 'Home', component: 'Home' },
  { name: 'Users', component: 'Users' },
  { name: 'Sprout', component: 'Sprout' },
  { name: 'UtensilsCrossed', component: 'UtensilsCrossed' },
  { name: 'Sparkles', component: 'Sparkles' },
  { name: 'Building', component: 'Building' },
  { name: 'Gamepad2', component: 'Gamepad2' },
  { name: 'BookOpen', component: 'BookOpen' },
  { name: 'Briefcase', component: 'Briefcase' },
  { name: 'Palette', component: 'Palette' },
  { name: 'Dumbbell', component: 'Dumbbell' },
  { name: 'Music', component: 'Music' },
  { name: 'Film', component: 'Film' },
  { name: 'Coffee', component: 'Coffee' },
  { name: 'Heart', component: 'Heart' },
  { name: 'Sun', component: 'Sun' },
] as const;

export type GroupIconName = typeof GROUP_ICON_OPTIONS[number]['component'];

// Unique color gradient combinations for group cards
// Gradient flows from bottom-right to upper-left
export const GROUP_COLOR_PRESETS = [
  { start: '#8B5CF6', end: '#EC4899', name: 'Purple-Pink' },
  { start: '#06B6D4', end: '#10B981', name: 'Teal-Green' },
  { start: '#F97316', end: '#FBBF24', name: 'Orange-Yellow' },
  { start: '#3B82F6', end: '#8B5CF6', name: 'Blue-Purple' },
  { start: '#EF4444', end: '#F97316', name: 'Red-Orange' },
  { start: '#10B981', end: '#3B82F6', name: 'Green-Blue' },
  { start: '#6366F1', end: '#8B5CF6', name: 'Indigo-Purple' },
  { start: '#EC4899', end: '#F97316', name: 'Pink-Orange' },
] as const;

export type GroupColorPreset = typeof GROUP_COLOR_PRESETS[number];

// Default values for new groups
export const DEFAULT_GROUP_ICON: GroupIconName = 'Home';
export const DEFAULT_GROUP_COLOR: GroupColorPreset = GROUP_COLOR_PRESETS[0];

