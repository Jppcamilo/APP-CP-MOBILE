import AsyncStorage from "@react-native-async-storage/async-storage";

import { FirebaseError, getApp, getApps, initializeApp,} from "firebase/app";
import {getAuth, getReactNativePersistence, initializeAuth,} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTurlnYAQ5Box8_3Gcy9JdtbD6TFE8Gio",
  authDomain: "projeto-monet.firebaseapp.com",
  projectId: "projeto-monet",
  storageBucket: "projeto-monet.firebasestorage.app",
  messagingSenderId: "403566392711",
  appId: "1:403566392711:web:a940b3594a488cfc78cf22",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function configureAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === "auth/already-initialized"
    ) {
      return getAuth(app);
    }

    throw error;
  }
}

export const auth = configureAuth();
export const db = getFirestore(app);