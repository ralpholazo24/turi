/**
 * Task icon options using Lucide React Native icons
 * Common icons for tasks/chores
 */
export const TASK_ICON_OPTIONS = [
  { name: 'Trash', component: 'Trash2' },
  { name: 'Sprout', component: 'Sprout' },
  { name: 'Utensils', component: 'UtensilsCrossed' },
  { name: 'Shopping Cart', component: 'ShoppingCart' },
  { name: 'Droplet', component: 'Droplet' },
  { name: 'Shirt', component: 'Shirt' },
  { name: 'Car', component: 'Car' },
  { name: 'Book', component: 'BookOpen' },
  { name: 'Briefcase', component: 'Briefcase' },
  { name: 'Dumbbell', component: 'Dumbbell' },
  { name: 'Smartphone', component: 'Smartphone' },
  { name: 'Laptop', component: 'Laptop' },
  { name: 'Music', component: 'Music' },
  { name: 'Film', component: 'Film' },
  { name: 'Cup', component: 'Coffee' },
  { name: 'Sparkles', component: 'Sparkles' },
] as const;

export type TaskIconName = typeof TASK_ICON_OPTIONS[number]['component'];

/**
 * Member icon options using Lucide React Native icons
 * User/person-related icons for member avatars
 */
export const MEMBER_ICON_OPTIONS = [
  { name: 'User', component: 'User' },
  { name: 'User Circle', component: 'UserCircle' },
  { name: 'Users', component: 'Users' },
  { name: 'Smile', component: 'Smile' },
  { name: 'Heart', component: 'Heart' },
  { name: 'Star', component: 'Star' },
  { name: 'Crown', component: 'Crown' },
  { name: 'Zap', component: 'Zap' },
  { name: 'Trophy', component: 'Trophy' },
  { name: 'Award', component: 'Award' },
  { name: 'Gift', component: 'Gift' },
  { name: 'Sun', component: 'Sun' },
  { name: 'Moon', component: 'Moon' },
  { name: 'Flower', component: 'Flower' },
  { name: 'Leaf', component: 'Leaf' },
  { name: 'Sparkles', component: 'Sparkles' },
] as const;

export type MemberIconName = typeof MEMBER_ICON_OPTIONS[number]['component'];

