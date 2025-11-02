import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Group } from '@/types';

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
  // For now, just update version and return
  // Add migration logic here when needed in future versions
  return {
    ...data,
    version: CURRENT_VERSION,
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

