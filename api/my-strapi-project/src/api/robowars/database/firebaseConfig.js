// import { initializeApp } from "firebase/app";
const { initializeApp } = require("firebase/app");

// import { getDatabase } from "firebase/database";
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCY7v8bHzt6qvcZzp2g0hAeR-XJf0RejZg",
  authDomain: "chat-app-4d401.firebaseapp.com",
  projectId: "chat-app-4d401",
  storageBucket: "chat-app-4d401.appspot.com",
  messagingSenderId: "208186499870",
  appId: "1:208186499870:web:dfa85d667aa0cdcae6df0f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// export const storage = getDatabase(app);
const db = getDatabase(app);
module.exports = { db };
