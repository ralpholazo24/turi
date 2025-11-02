import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Group, Member } from '@/types';
import { getColorFromName } from './member-avatar';

const STORAGE_KEY = '@turi_app_data';
const CURRENT_VERSION = '1.0.0';

/**
 * Initialize storage with default empty data
 */
function getDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    groups: [],
  };
}

/**
 * Load data from AsyncStorage
 */
export async function loadData(): Promise<AppData> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue == null) {
      return getDefaultData();
    }
    const data = JSON.parse(jsonValue) as AppData;
    
    // Migrate data if version is different
    if (data.version !== CURRENT_VERSION) {
      return migrateData(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
}

/**
 * Save data to AsyncStorage
 */
export async function saveData(data: AppData): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

/**
 * Migrate data from older versions
 */
function migrateData(data: AppData): AppData {
  // Migrate members to include avatarColor
  const migratedGroups = data.groups.map((group) => ({
    ...group,
    members: group.members.map((member: Member) => ({
      ...member,
      // Add avatarColor if it doesn't exist (backward compatibility)
      avatarColor: member.avatarColor || getColorFromName(member.name),
    })),
  }));

  return {
    ...data,
    version: CURRENT_VERSION,
    groups: migratedGroups,
  };
}

/**
 * Clear all data (useful for testing/reset)
 */
export async function clearData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

