import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhg5K1V0yxBZSMW3OP1zyCr5bF-w3gW6s",
    authDomain: "thinaihub-2026.firebaseapp.com",
    projectId: "thinaihub-2026",
    storageBucket: "thinaihub-2026.firebasestorage.app",
    messagingSenderId: "123643216681",
    appId: "1:123643216681:web:9892f67aec5a93d55aad38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
