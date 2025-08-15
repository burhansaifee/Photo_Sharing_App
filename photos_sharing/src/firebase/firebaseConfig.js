import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

    const firebaseConfig = {
    apiKey: "AIzaSyB0k8r0lYaBBqP2n7qTMP1PpOrzftRMpic",
    authDomain: "photography-502ff.firebaseapp.com",
    projectId: "photography-502ff",
    storageBucket: "photography-502ff.firebasestorage.app",
    messagingSenderId: "253449859076",
    appId: "1:253449859076:web:980b1f1153888500724551"
    };


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
