import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB14zYPD0u1QLi6RLeVKepDVGbqdsybMBU',
  authDomain: 'travelbuddy-images.firebaseapp.com',
  projectId: 'travelbuddy-images',
  storageBucket: 'travelbuddy-images.firebasestorage.app',
  messagingSenderId: '994471270034',
  appId: '1:994471270034:web:889be8f040adfc6c76b84b',
  measurementId: 'G-2RN9WT59D1',
};

let app: FirebaseApp;
let storage: FirebaseStorage;
let auth: Auth;

// App nur einmal initialisieren (Hot Reload)
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

storage = getStorage(app);

// Auth mit RN-Persistence initialisieren
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e: any) {
  // Bei Fast Refresh / Hot Reload ist Auth ggf. schon initialisiert
  auth = getAuth(app);
}

export { app, storage, auth, signInAnonymously, onAuthStateChanged };
