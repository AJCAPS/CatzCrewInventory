
// Replace the following with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDB3cSRedIrB1hfMvUCd5GGxD5YXwFCylc",
    authDomain: "catz-crew-inventory.firebaseapp.com",
    projectId: "catz-crew-inventory",
    storageBucket: "catz-crew-inventory.appspot.com",
    messagingSenderId: "509844897996",
    appId: "1:509844897996:web:95dafa23db91573f11c269",
    measurementId: "G-G4M9DR4ZC7"
  };

  
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const auth = getAuth(app); // Initialize auth

// Get references to the form elements
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#loginButton');


// Add event listener for login button
loginButton.addEventListener('click', (e) => {
  e.preventDefault();

  const email = usernameInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // User signed in successfully
    console.log('User signed in:', userCredential.user.email);
    // Redirect to index.html or another page
    window.location.assign = ('/index.html'); 
  })
  .catch((error) => {
    console.error('Error signing in:', error.message);
    // Handle login errors
  });

  
});
