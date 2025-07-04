// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoT5Ccdm5chJ2GrVeXAPIUuYqvTbZDD7A",
  authDomain: "sample-00-aeb8f.firebaseapp.com",
  databaseURL: "https://sample-00-aeb8f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sample-00-aeb8f",
  storageBucket: "sample-00-aeb8f.appspot.com", // <-- FIXED HERE
  messagingSenderId: "898909493443",
  appId: "1:898909493443:web:be1416125cf481cf81ea76",
  measurementId: "G-8K2S1490T6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;