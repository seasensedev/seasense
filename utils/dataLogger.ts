import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { DataLog } from '../types/DataLog';

export const logTrackingData = async (logData: DataLog) => {
  try {
    await addDoc(collection(db, 'data_collection'), {
      ...logData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging data:', error);
  }
};
