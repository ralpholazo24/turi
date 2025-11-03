/**
 * Task icon options using Lucide React Native icons
 * Common icons for tasks/chores
 */
export const TASK_ICON_OPTIONS = [
  { name: 'Sprout', component: 'Sprout' },
  { name: 'Trash', component: 'Trash2' },
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
  { name: 'Vacuum', component: 'Wind' },
  { name: 'Bed', component: 'BedDouble' },
  { name: 'Bath', component: 'Bath' },
  { name: 'Brush', component: 'Paintbrush' },
  { name: 'Broom', component: 'Wand2' },
  { name: 'Cutlery', component: 'Utensils' },
  { name: 'Microwave', component: 'Microwave' },
  { name: 'Refrigerator', component: 'Refrigerator' },
  { name: 'Iron', component: 'Zap' },
  { name: 'Plants', component: 'Flower2' },
  { name: 'Mail', component: 'Mail' },
  { name: 'Pills', component: 'Pill' },
  { name: 'Baby Bottle', component: 'Baby' },
  { name: 'Dog Walk', component: 'Dog' },
  { name: 'Cat Care', component: 'Cat' },
  { name: 'Grocery', component: 'ShoppingBag' },
  { name: 'Gas', component: 'Fuel' },
  { name: 'Maintenance', component: 'Wrench' },
  { name: 'Leaf', component: 'Leaf' },
  { name: 'Globe', component: 'Globe' },
  { name: 'Camera', component: 'Camera' },
  { name: 'Calendar', component: 'Calendar' },
  { name: 'Clock', component: 'Clock' },
  { name: 'CheckCircle', component: 'CheckCircle' },
  { name: 'Home', component: 'Home' },
  { name: 'Key', component: 'Key' },
  { name: 'Lock', component: 'Lock' },
  { name: 'Bell', component: 'Bell' },
  { name: 'Heart', component: 'Heart' },
  { name: 'Star', component: 'Star' },
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

