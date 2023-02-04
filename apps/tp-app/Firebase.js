// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6oL443hzDyCwXtsewC0JiTf4W5XpdqWk",
  authDomain: "new-telephone-pictionary.firebaseapp.com",
  projectId: "new-telephone-pictionary",
  storageBucket: "new-telephone-pictionary.appspot.com",
  messagingSenderId: "1029185447438",
  appId: "1:1029185447438:web:ba8a201ed954ee6a48fe5f",
  measurementId: "G-1ECCL8JYDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)