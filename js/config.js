// =========================================
// FIREBASE CONFIGURATION
// =========================================

// We MUST use the CDN links for a static HTML/JS website
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Your exact Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbalL2Y4AX_uUbMYWlLvcn-3gRYLgx86U",
    authDomain: "private-tututorshobhandeb.firebaseapp.com",
    projectId: "private-tututorshobhandeb",
    storageBucket: "private-tututorshobhandeb.firebasestorage.app",
    messagingSenderId: "622737403285",
    appId: "1:622737403285:web:ccd85a1635d4a95b8bda9c",
    measurementId: "G-TBC0ZPC1GQ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export auth so our login/register pages can use it
export { auth };