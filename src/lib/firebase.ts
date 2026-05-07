import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Support for environment variables in production
// We use a helper to ensure we don't use empty strings from env vars
const getVal = (envKey: string, fallback: string) => {
  const val = import.meta.env[envKey];
  return (val && val.trim() !== '') ? val : fallback;
};

const finalConfig = {
  apiKey: getVal('VITE_FIREBASE_API_KEY', firebaseConfig.apiKey),
  authDomain: getVal('VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain),
  projectId: getVal('VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId),
  storageBucket: getVal('VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket),
  messagingSenderId: getVal('VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId),
  appId: getVal('VITE_FIREBASE_APP_ID', firebaseConfig.appId),
  measurementId: getVal('VITE_FIREBASE_MEASUREMENT_ID', firebaseConfig.measurementId),
  firestoreDatabaseId: getVal('VITE_FIREBASE_DATABASE_ID', firebaseConfig.firestoreDatabaseId)
};

const app = getApps().length === 0 ? initializeApp(finalConfig) : getApps()[0];

// Initialize Firestore with custom settings if needed
// We use initializeFirestore instead of getFirestore to pass settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, finalConfig.firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test with immediate diagnostic
if (typeof window !== 'undefined') {
  const testConnection = async () => {
    console.log("Initiating Firestore connection test to:", finalConfig.projectId, "/", finalConfig.firestoreDatabaseId);
    try {
      // Try to fetch a non-existent doc from server to verify connectivity
      await getDocFromServer(doc(db, '_connection_test', 'init'));
      console.log("Firestore connection verified successfully.");
    } catch (error: any) {
      console.error("Firestore initialization error details:", {
        code: error.code,
        message: error.message,
        config: {
          projectId: finalConfig.projectId,
          databaseId: finalConfig.firestoreDatabaseId
        }
      });
      
      if (error.code === 'unavailable') {
        console.warn("Firestore is unavailable. This may be due to network issues, quota limits, or database provisioning delay.");
      }
    }
  };
  testConnection();
}

export default app;
