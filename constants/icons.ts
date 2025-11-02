/**
 * Centralized icon constants using Lucide React Native
 * Ensures consistent icon usage across the app
 */

import * as LucideIcons from 'lucide-react-native';

// App navigation icons
export const APP_ICONS = {
  home: LucideIcons.Home,
  explore: LucideIcons.Compass,
  groups: LucideIcons.Users,
  back: LucideIcons.ArrowLeft,
  menu: LucideIcons.MoreHorizontal,
  check: LucideIcons.Check,
  close: LucideIcons.X,
  edit: LucideIcons.Edit,
  delete: LucideIcons.Trash2,
  add: LucideIcons.Plus,
  save: LucideIcons.Save,
  calendar: LucideIcons.Calendar,
  clock: LucideIcons.Clock,
  flame: LucideIcons.Flame,
  user: LucideIcons.User,
  settings: LucideIcons.Settings,
  clipboard: LucideIcons.ClipboardList,
  users: LucideIcons.Users,
  pen: LucideIcons.PenTool,
} as const;

// Helper function to get icon component by name
export function getIcon(name: keyof typeof APP_ICONS) {
  return APP_ICONS[name];
}

// Type for icon names
export type AppIconName = keyof typeof APP_ICONS;

