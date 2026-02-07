import { auth, googleProvider, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleLoginBtn = document.getElementById('google-login');
const logoutBtn = document.getElementById('logout-btn');

// --- Helper: Sync User to Firestore ---
async function syncUserToFirestore(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Update only if user doesn't exist or we want to update last login
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'User',
                role: 'user', // Default role
                createdAt: new Date().toISOString()
            });
        }
    } catch (e) {
        console.error("Error syncing user:", e);
    }
}

// --- Event Listeners ---

// Login (Email/Password)
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Ensure sync exists even on login
            // (Note: For email/pass login, profile data might not be fully ready immediately if just signed up, but it's okay)
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
        }
    });
}

// Signup (Email/Password)
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update Profile Name
            await updateProfile(userCredential.user, { displayName: name });
            // Sync to Firestore
            await syncUserToFirestore({ ...userCredential.user, displayName: name }); // Pass name explicitly as updateProfile is async

            window.location.href = 'index.html';
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Signup Failed: " + error.message);
        }
    });
}

// Google Login (for both Login and Signup pages)
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Sync to Firestore
            await syncUserToFirestore(result.user);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("Google Sign-In Failed: " + error.message);
        }
    });
}

// Logout (Profile Page)
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}


// --- Auth State Observer (UI Updates & Route Protection) ---
let isUserLoggedIn = false;

onAuthStateChanged(auth, (user) => {
    isUserLoggedIn = !!user;
    updateNavbarUI(user);

    if (user) {
        if (window.location.pathname.includes('profile.html')) {
            updateProfilePage(user);
        }
    } else {
        // Protected Routes: Redirect to Login if not authenticated
        const currentPath = window.location.pathname;
        if (currentPath.includes('cart.html') || currentPath.includes('payment.html') || currentPath.includes('profile.html')) {
            // Save current URL to redirect back after login (optional enhancement for later)
            window.location.href = 'login.html';
        }
    }
});

// Intercept Cart Button Clicks
document.addEventListener('DOMContentLoaded', () => {
    const cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isUserLoggedIn) {
                e.preventDefault();
                alert("Please sign in to view your cart.");
                window.location.href = 'login.html';
            }
        });
    });
});

function updateNavbarUI(user) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // Check if auth button already exists to avoid duplicates
    const existingAuthBtn = document.getElementById('auth-btn-container');
    if (existingAuthBtn) existingAuthBtn.remove();

    if (user) {
        // Logged In: Show Profile Icon with Dropdown
        const div = document.createElement('div');
        div.id = 'auth-btn-container';
        div.style.position = 'relative'; // For dropdown positioning
        div.innerHTML = `
            <div id="profile-dropdown-btn" style="cursor: pointer; width: 40px; height: 40px; border-radius: 50%; background: #AA8D60; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                ${user.photoURL ? `<img src="${user.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <!-- Dropdown Menu -->
            <div id="profile-dropdown-menu" style="display: none; position: absolute; top: 50px; right: 0; background: white; min-width: 150px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; z-index: 1000;">
                <a href="profile.html" style="display: block; padding: 12px 20px; color: #333; font-size: 0.95rem; border-bottom: 1px solid #eee;">Profile</a>
                <a href="my-orders.html" style="display: block; padding: 12px 20px; color: #333; font-size: 0.95rem; border-bottom: 1px solid #eee;">My Orders</a>
                <a href="settings.html" style="display: block; padding: 12px 20px; color: #333; font-size: 0.95rem; border-bottom: 1px solid #eee;">Settings</a>
                <button id="nav-logout-btn" style="display: block; width: 100%; text-align: left; padding: 12px 20px; color: #d32f2f; background: none; border: none; cursor: pointer; font-size: 0.95rem;">Sign Out</button>
            </div>
        `;

        // Insert before mobile toggle or at the end
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (mobileToggle) {
            navActions.insertBefore(div, mobileToggle);
        } else {
            navActions.appendChild(div);
        }

        // Toggle Logic
        const btn = div.querySelector('#profile-dropdown-btn');
        const menu = div.querySelector('#profile-dropdown-menu');

        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });

        // Logout logic for dropdown
        document.getElementById('nav-logout-btn').addEventListener('click', async () => {
            await signOut(auth);
            window.location.reload();
        });

    } else {
        // Logged Out: Show Sign In Button
        const btn = document.createElement('a');
        btn.id = 'auth-btn-container';
        btn.href = 'login.html';
        btn.className = 'btn btn-outline';
        btn.textContent = 'Sign In';
        btn.style.padding = '8px 20px';

        const mobileToggle = document.querySelector('.mobile-toggle');
        if (mobileToggle) {
            navActions.insertBefore(btn, mobileToggle);
        } else {
            navActions.appendChild(btn);
        }
    }
}

function updateProfilePage(user) {
    document.getElementById('user-name').textContent = user.displayName || 'User';
    document.getElementById('user-email').textContent = user.email;

    if (user.photoURL) {
        document.getElementById('profile-pic').innerHTML = `<img src="${user.photoURL}">`;
    }
}
