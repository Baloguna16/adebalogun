import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCG29-nDBYpHoa2__k7mjPaLZ87JAPD5SM',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'adebalogun-me.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'adebalogun-me',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'adebalogun-me.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '497820626600',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:497820626600:web:fc28475237c9521d151c9d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, 'adebalogun-fire');
export const storage = getStorage(app);
