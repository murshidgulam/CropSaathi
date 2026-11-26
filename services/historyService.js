
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = 'cropsaathi_scan_history';

// Load previously saved scan history
export async function loadScanHistory() {
  const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);

  if (savedHistory === null) {
    return [];
  }

  const parsedHistory = JSON.parse(savedHistory);

  return Array.isArray(parsedHistory) ? parsedHistory : [];
}

// Save scan history
export async function saveScanHistory(history) {
  await AsyncStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history)
  );
}
