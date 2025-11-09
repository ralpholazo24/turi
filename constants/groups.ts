/**
 * Group-related constants
 * Includes icon options and color presets for group creation
 */

// Icon options with Lucide React Native icons
// Only essential, commonly used icons for groups
export const GROUP_ICON_OPTIONS = [
  { name: "Home", component: "Home" },
  { name: "Users", component: "Users" },
  { name: "Building", component: "Building" },
  { name: "Heart", component: "Heart" },
  { name: "Star", component: "Star" },
  { name: "Coffee", component: "Coffee" },
  { name: "UtensilsCrossed", component: "UtensilsCrossed" },
  { name: "ShoppingCart", component: "ShoppingCart" },
  { name: "Car", component: "Car" },
  { name: "Plane", component: "Plane" },
  { name: "Ship", component: "Ship" },
  { name: "Bike", component: "Bike" },
  { name: "Briefcase", component: "Briefcase" },
  { name: "GraduationCap", component: "GraduationCap" },
  { name: "Stethoscope", component: "Stethoscope" },
  { name: "ChefHat", component: "ChefHat" },
  { name: "Palette", component: "Palette" },
  { name: "Music", component: "Music" },
  { name: "Film", component: "Film" },
  { name: "Gamepad2", component: "Gamepad2" },
  { name: "BookOpen", component: "BookOpen" },
  { name: "Dumbbell", component: "Dumbbell" },
  { name: "Dog", component: "Dog" },
  { name: "Cat", component: "Cat" },
  { name: "Baby", component: "Baby" },
  { name: "Sprout", component: "Sprout" },
  { name: "Flower", component: "Flower" },
  { name: "TreePine", component: "TreePine" },
  { name: "Trees", component: "Trees" },
  { name: "Mountain", component: "Mountain" },
  { name: "Tent", component: "Tent" },
  { name: "Waves", component: "Waves" },
  { name: "Sun", component: "Sun" },
  { name: "Moon", component: "Moon" },
  { name: "Cloud", component: "Cloud" },
  { name: "Snowflake", component: "Snowflake" },
  { name: "Umbrella", component: "Umbrella" },
  { name: "Camera", component: "Camera" },
  { name: "Video", component: "Video" },
  { name: "Headphones", component: "Headphones" },
  { name: "Mic", component: "Mic" },
  { name: "Guitar", component: "Guitar" },
  { name: "Trophy", component: "Trophy" },
  { name: "Award", component: "Award" },
  { name: "Target", component: "Target" },
  { name: "Flag", component: "Flag" },
  { name: "Rocket", component: "Rocket" },
  { name: "Lightbulb", component: "Lightbulb" },
  { name: "Zap", component: "Zap" },
  { name: "Flame", component: "Flame" },
  { name: "Shield", component: "Shield" },
  { name: "Crown", component: "Crown" },
  { name: "Gem", component: "Gem" },
  { name: "Diamond", component: "Diamond" },
  { name: "Gift", component: "Gift" },
  { name: "PartyPopper", component: "PartyPopper" },
  { name: "CakeSlice", component: "CakeSlice" },
  { name: "Pizza", component: "Pizza" },
  { name: "IceCream", component: "IceCream" },
  { name: "Cookie", component: "Cookie" },
  { name: "Apple", component: "Apple" },
  { name: "Beer", component: "Beer" },
  { name: "Wine", component: "Wine" },
  { name: "Activity", component: "Activity" },
  { name: "Footprints", component: "Footprints" },
  { name: "Anchor", component: "Anchor" },
  { name: "Paintbrush", component: "Paintbrush" },
  { name: "Scissors", component: "Scissors" },
  { name: "Hammer", component: "Hammer" },
  { name: "Wrench", component: "Wrench" },
  { name: "Laptop", component: "Laptop" },
  { name: "Monitor", component: "Monitor" },
  { name: "Smartphone", component: "Smartphone" },
  { name: "Tablet", component: "Tablet" },
  { name: "Watch", component: "Watch" },
  { name: "Keyboard", component: "Keyboard" },
  { name: "Mouse", component: "Mouse" },
  { name: "Printer", component: "Printer" },
  { name: "Wifi", component: "Wifi" },
  { name: "Bluetooth", component: "Bluetooth" },
  { name: "Battery", component: "Battery" },
  { name: "Plug", component: "Plug" },
  { name: "Wind", component: "Wind" },
  { name: "Thermometer", component: "Thermometer" },
  { name: "CloudRain", component: "CloudRain" },
  { name: "CloudLightning", component: "CloudLightning" },
  { name: "Compass", component: "Compass" },
  { name: "Map", component: "Map" },
  { name: "Globe", component: "Globe" },
  { name: "Sparkles", component: "Sparkles" },
  { name: "Leaf", component: "Leaf" },
  { name: "Droplet", component: "Droplet" },
  { name: "Shirt", component: "Shirt" },
] as const;

export type GroupIconName = (typeof GROUP_ICON_OPTIONS)[number]["component"];

// Unique color gradient combinations for group cards
// Gradient flows from bottom-right to upper-left
// Based on vibrant color palette: Red, Orange, Yellow, Green, Mint, Teal, Cyan, Blue, Indigo, Purple
export const GROUP_COLOR_PRESETS = [
  { start: "#DC2626", end: "#EF4444", name: "Red-Light Red" }, // Red → Light Red (vibrant)
  { start: "#DC2626", end: "#F97316", name: "Red-Orange" }, // Red → Orange (warm)
  { start: "#EA580C", end: "#EAB308", name: "Orange-Yellow" }, // Orange → Yellow (sunset)
  { start: "#FCD34D", end: "#16A34A", name: "Yellow-Green" }, // Yellow → Green (fresh)
  { start: "#22C55E", end: "#5EEAD4", name: "Green-Mint" }, // Green → Mint (cool)
  { start: "#5EEAD4", end: "#14B8A6", name: "Mint-Teal" }, // Mint → Teal (ocean)
  { start: "#0D9488", end: "#06B6D4", name: "Teal-Cyan" }, // Teal → Cyan (aqua)
  { start: "#0891B2", end: "#2563EB", name: "Cyan-Blue" }, // Cyan → Blue (sky)
  { start: "#3B82F6", end: "#6366F1", name: "Blue-Indigo" }, // Blue → Indigo (deep)
  { start: "#4F46E5", end: "#9333EA", name: "Indigo-Purple" }, // Indigo → Purple (royal)
  { start: "#A855F7", end: "#EC4899", name: "Purple-Pink" }, // Purple → Pink (vibrant)
] as const;

export type GroupColorPreset = (typeof GROUP_COLOR_PRESETS)[number];

// Default values for new groups
export const DEFAULT_GROUP_ICON: GroupIconName = "Home";
export const DEFAULT_GROUP_COLOR: GroupColorPreset = GROUP_COLOR_PRESETS[0];
