import { AppData, Group, Member } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getColorFromName } from "./member-avatar";

const STORAGE_KEY = "@turi_app_data";
const CURRENT_VERSION = "1.0.0";

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
    console.error("Error loading data:", error);
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
    console.error("Error saving data:", error);
    throw error;
  }
}

/**
 * Migrate data from older versions
 */
function migrateData(data: AppData): AppData {
  // Migrate members to include avatarColor
  // Migrate groups to include ownerId (if missing)
  const migratedGroups = data.groups.map((group) => {
    const oldGroup = group as Group & { ownerId?: string };

    // Add ownerId if missing - use first member's ID or generate a placeholder
    const ownerId =
      oldGroup.ownerId ||
      (oldGroup.members.length > 0
        ? oldGroup.members[0].id
        : `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    return {
      ...oldGroup,
      ownerId,
      members: oldGroup.members.map((member: Member) => ({
        ...member,
        // Add avatarColor if it doesn't exist (backward compatibility)
        avatarColor: member.avatarColor || getColorFromName(member.name),
      })),
      tasks: oldGroup.tasks.map((task) => {
        const oldTask = task as any;

        // Add createdAt if it doesn't exist (backward compatibility)
        const createdAt = oldTask.createdAt || "1970-01-01T00:00:00.000Z";

        // Migrate schedule format from old structure to new structure
        let schedule: any;

        if (oldTask.schedule && oldTask.schedule.repeat) {
          // Task already has new schedule format - use it as is
          schedule = oldTask.schedule;
        } else if (oldTask.frequency) {
          // Old format: migrate frequency to schedule.repeat
          const oldFrequency = oldTask.frequency;
          let repeat: string;

          // Map old frequency values to new repeat values
          switch (oldFrequency) {
            case "daily":
              repeat = "daily";
              break;
            case "weekly":
              repeat = "weekly";
              break;
            case "monthly":
              repeat = "monthly";
              break;
            default:
              // Fallback to daily for unknown frequencies
              repeat = "daily";
              break;
          }

          // Build new schedule object
          schedule = {
            repeat,
            startDate: createdAt, // Use createdAt as startDate
            time: oldTask.scheduleTime || undefined,
            dayOfWeek:
              oldTask.scheduleDay !== undefined
                ? oldTask.scheduleDay
                : undefined,
          };

          // For weekly and biweekly, ensure dayOfWeek is set
          if (
            (repeat === "weekly" || repeat === "biweekly") &&
            schedule.dayOfWeek === undefined
          ) {
            // Default to the day of week from createdAt if scheduleDay wasn't set
            const createdDate = new Date(createdAt);
            schedule.dayOfWeek = createdDate.getDay();
          }
        } else {
          // No frequency or schedule - create default schedule
          schedule = {
            repeat: "daily",
            startDate: createdAt,
          };
        }

        // Migrate lastCompletedAt to completionHistory if needed
        let completionHistory = oldTask.completionHistory || [];
        if (oldTask.lastCompletedAt && !completionHistory.length) {
          // Convert lastCompletedAt to completionHistory format
          completionHistory = [
            {
              type: "completed" as const,
              memberId:
                oldTask.memberIds[oldTask.assignedIndex] ||
                oldTask.memberIds[0] ||
                "",
              timestamp: oldTask.lastCompletedAt,
            },
          ];
        }

        // Return migrated task, removing old properties
        const migratedTask: any = {
          ...oldTask,
          createdAt,
          schedule,
          completionHistory,
        };

        // Remove old properties that are no longer used
        delete migratedTask.frequency;
        delete migratedTask.scheduleDay;
        delete migratedTask.scheduleWeek;
        delete migratedTask.scheduleTime;
        delete migratedTask.lastCompletedAt;

        return migratedTask;
      }),
    };
  });

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
    console.error("Error clearing data:", error);
    throw error;
  }
}
