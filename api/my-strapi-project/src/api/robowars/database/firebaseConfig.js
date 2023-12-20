// import { initializeApp } from "firebase/app";
const { initializeApp } = require("firebase/app");

// import { getDatabase } from "firebase/database";
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: process.env.RW_API_KEY,
  authDomain: process.env.RW_AUTH_DOMAIN,
  projectId: process.env.RW_PROJECT_ID,
  storageBucket: process.env.RW_STORAGE_BUCKET,
  messagingSenderId: process.env.RW_MESSAGING_SENDER_ID,
  appId: process.env.RW_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// export const storage = getDatabase(app);
const db = getDatabase(app);
module.exports = { db };
