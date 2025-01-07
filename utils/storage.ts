import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  LAST_KNOWN_DATA: 'last_known_data',
  LAST_FETCH_TIME: 'last_fetch_time',
};

export const saveData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const loadData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};
