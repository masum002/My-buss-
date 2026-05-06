import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Support for environment variables in production
const finalConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId
};

const app = getApps().length === 0 ? initializeApp(finalConfig) : getApps()[0];

export const db = getFirestore(app, finalConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
const testConnection = async () => {
  try {
    // Only try to reach server if we're in a browser environment
    if (typeof window !== 'undefined') {
      await getDocFromServer(doc(db, '_connection_test', 'init'));
      console.log("Firestore connection verified.");
    }
  } catch (error: any) {
    if (error.message.includes('the client is offline') || error.message.includes('Could not reach')) {
      console.error("Please check your Firebase configuration or internet connection. Firestore is unreachable.");
    }
  }
};
testConnection();

export default app;
