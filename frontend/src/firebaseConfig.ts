import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  
//get yours from firebase console

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);