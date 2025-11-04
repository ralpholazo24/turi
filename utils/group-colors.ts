import { GROUP_COLOR_PRESETS } from '@/constants/groups';

/**
 * Get color values from a preset name
 * @param presetName - The name of the color preset (e.g., 'Red-Orange')
 * @returns Object with start and end colors, or default preset if not found
 */
export function getColorsFromPreset(presetName: string): { start: string; end: string } {
  const preset = GROUP_COLOR_PRESETS.find((p) => p.name === presetName);
  if (preset) {
    return { start: preset.start, end: preset.end };
  }
  // Return default preset if not found
  return { start: GROUP_COLOR_PRESETS[0].start, end: GROUP_COLOR_PRESETS[0].end };
}


