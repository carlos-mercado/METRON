// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAYHMj_6lpGvcJVWNWvioS5LObPF2KKxI",
  authDomain: "fitness-app-601fa.firebaseapp.com",
  databaseURL: "https://fitness-app-601fa-default-rtdb.firebaseio.com",
  projectId: "fitness-app-601fa",
  storageBucket: "fitness-app-601fa.firebasestorage.app",
  messagingSenderId: "417806259416",
  appId: "1:417806259416:web:95f766465b9d78cd96f3ad",
  measurementId: "G-282R5YKLB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export default app;