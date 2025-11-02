import { Group } from '@/types';

/**
 * Check if a group is in solo mode (has only one member)
 * @param group - The group to check
 * @returns true if the group has exactly one member
 */
export function isSoloMode(group: Group): boolean {
  return group.members.length === 1;
}

