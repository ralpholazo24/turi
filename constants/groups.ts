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
  { name: 'ShoppingCart', component: 'ShoppingCart' },
  { name: 'Car', component: 'Car' },
  { name: 'Droplet', component: 'Droplet' },
  { name: 'Shirt', component: 'Shirt' },
  { name: 'GraduationCap', component: 'GraduationCap' },
  { name: 'Stethoscope', component: 'Stethoscope' },
  { name: 'ChefHat', component: 'ChefHat' },
  { name: 'TreePine', component: 'TreePine' },
  { name: 'Plane', component: 'Plane' },
  { name: 'Ship', component: 'Ship' },
  { name: 'Bike', component: 'Bike' },
  { name: 'Dog', component: 'Dog' },
  { name: 'Cat', component: 'Cat' },
  { name: 'Baby', component: 'Baby' },
  { name: 'Cake', component: 'CakeSlice' },
] as const;

export type GroupIconName = typeof GROUP_ICON_OPTIONS[number]['component'];

// Unique color gradient combinations for group cards
// Gradient flows from bottom-right to upper-left
// Based on vibrant color palette: Red, Orange, Yellow, Green, Mint, Teal, Cyan, Blue, Indigo, Purple
export const GROUP_COLOR_PRESETS = [
  { start: '#DC2626', end: '#F97316', name: 'Red-Orange' },      // Red → Orange (warm)
  { start: '#EA580C', end: '#EAB308', name: 'Orange-Yellow' },   // Orange → Yellow (sunset)
  { start: '#FCD34D', end: '#16A34A', name: 'Yellow-Green' },    // Yellow → Green (fresh)
  { start: '#22C55E', end: '#5EEAD4', name: 'Green-Mint' },      // Green → Mint (cool)
  { start: '#5EEAD4', end: '#14B8A6', name: 'Mint-Teal' },       // Mint → Teal (ocean)
  { start: '#0D9488', end: '#06B6D4', name: 'Teal-Cyan' },       // Teal → Cyan (aqua)
  { start: '#0891B2', end: '#2563EB', name: 'Cyan-Blue' },      // Cyan → Blue (sky)
  { start: '#3B82F6', end: '#6366F1', name: 'Blue-Indigo' },    // Blue → Indigo (deep)
  { start: '#4F46E5', end: '#9333EA', name: 'Indigo-Purple' },  // Indigo → Purple (royal)
  { start: '#A855F7', end: '#EC4899', name: 'Purple-Pink' },    // Purple → Pink (vibrant)
] as const;

export type GroupColorPreset = typeof GROUP_COLOR_PRESETS[number];

// Default values for new groups
export const DEFAULT_GROUP_ICON: GroupIconName = 'Home';
export const DEFAULT_GROUP_COLOR: GroupColorPreset = GROUP_COLOR_PRESETS[0];

