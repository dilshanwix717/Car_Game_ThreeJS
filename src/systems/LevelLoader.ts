import type { LevelData } from "../types.ts";

/**
 * Load a level from a JSON file.
 * @param levelName - e.g., 'level1' (without .json extension)
 * @returns Promise resolving to the loaded LevelData
 */
export async function loadLevel(levelName: string): Promise<LevelData> {
  try {
    const response = await fetch(`/levels/${levelName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load level: ${response.statusText}`);
    }
    const data: LevelData = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading level "${levelName}":`, error);
    throw error;
  }
}
