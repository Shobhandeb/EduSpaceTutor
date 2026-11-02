// =========================================
// FIREBASE AUTHENTICATION LOGIC
// =========================================

import { auth } from './config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper to resolve safe dashboard/login paths ---
    const getDashboardUrl = () => {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return 'dashboard.html';
        }
        return 'pages/dashboard.html';
    };

    // --- 1. PASSWORD VISIBILITY TOGGLE ---
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    });

    // Helper to show errors
    const showError = (msg) => {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.style.color = '#ff4d4d';
            errorEl.innerText = msg;
        }
    };

    // --- 2. LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const btn = document.getElementById('loginBtn');
            
            btn.innerHTML = 'Logging in...';
            btn.disabled = true;

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    window.location.href = getDashboardUrl();
                })
                .catch((error) => {
                    btn.innerHTML = '<i data-lucide="log-in"></i> Login to Dashboard';
                    btn.disabled = false;
                    lucide.createIcons();
                    
                    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                        showError("Incorrect email or password.");
                    } else if (error.code === 'auth/too-many-requests') {
                        showError("Too many failed attempts. Try again later.");
                    } else {
                        showError(error.message);
                    }
                });
        });
    }

    // --- 3. REGISTER LOGIC ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const btn = document.getElementById('registerBtn');

            if (password.length < 6) {
                showError("Password must be at least 6 characters long.");
                return;
            }

            btn.innerHTML = 'Creating Account...';
            btn.disabled = true;

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Update user display name cleanly
                    return updateProfile(user, { displayName: name });
                })
                .then(() => {
                    window.location.href = getDashboardUrl();
                })
                .catch((error) => {
                    btn.innerHTML = '<i data-lucide="user-plus"></i> Create Account';
                    btn.disabled = false;
                    lucide.createIcons();

                    if (error.code === 'auth/email-already-in-use') {
                        showError("An account with this email already exists.");
                    } else if (error.code === 'auth/invalid-email') {
                        showError("Please enter a valid email address.");
                    } else {
                        showError(error.message);
                    }
                });
        });
    }

    // --- 4. FORGOT PASSWORD ---
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const emailField = document.getElementById('loginEmail');
            const email = emailField ? emailField.value.trim() : '';
            
            if (!email) {
                showError("Please enter your email address in the field above first.");
                return;
            }

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    const errorEl = document.getElementById('authError');
                    if (errorEl) {
                        errorEl.style.display = 'block';
                        errorEl.style.color = '#00e5ff';
                        errorEl.innerText = "Password reset email sent! Check your inbox.";
                    }
                })
                .catch((error) => {
                    showError(error.message);
                });
        });
    }
});