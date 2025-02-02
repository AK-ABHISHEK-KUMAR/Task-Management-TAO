import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getStorage } from "@firebase/storage";
import { initializeFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { create } from "zustand";
const firebaseConfig = {
  apiKey: "AIzaSyCD_r-dJ1Vvz5NMLR0wwwIv4-rWb_wTN0I",
  authDomain: "task-management-app-9162b.firebaseapp.com",
  projectId: "task-management-app-9162b",
  storageBucket: "task-management-app-9162b.firebasestorage.app",
  messagingSenderId: "654355755906",
  appId: "1:654355755906:web:0ff43c179842f8918d559b",
  measurementId: "G-QZ4Z3G6HFN"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
getStorage(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: 5e7,
  // 50 MB
  ignoreUndefinedProperties: true
});
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistence failed to enable");
  } else if (err.code === "unimplemented") {
    console.warn("Persistence is not available in this browser");
  }
});
const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading })
}));
export {
  auth as a,
  db as d,
  useAuthStore as u
};
