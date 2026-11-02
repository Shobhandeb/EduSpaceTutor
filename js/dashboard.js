// =========================================
// DASHBOARD & PROFILE PICTURE LOGIC
// =========================================

import { auth } from './config.js';
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const authLoader = document.getElementById('authLoader');
    const dashboardContent = document.getElementById('dashboardContent');
    const userGreeting = document.getElementById('userGreeting');
    const heroName = document.getElementById('heroName');
    const heroEmail = document.getElementById('heroEmail');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Avatar Elements
    const avatarContainer = document.getElementById('avatarContainer');
    const avatarInitials = document.getElementById('avatarInitials');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const avatarModal = document.getElementById('avatarModal');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    const avatarUrlInput = document.getElementById('avatarUrlInput');

    // 1. Verify User State via Firebase Auth
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authLoader.style.display = 'none';
            dashboardContent.style.display = 'block';

            const displayName = user.displayName || "Student";
            const email = user.email;

            userGreeting.innerText = `Hi, ${displayName}`;
            heroName.innerText = displayName;
            heroEmail.innerText = email;
            profileName.innerText = displayName;
            profileEmail.innerText = email;

            // Handle Avatar Display (Photo URL or Initials)
            if (user.photoURL) {
                avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture" onerror="this.onerror=null;this.parentElement.innerHTML='<span>${displayName.charAt(0)}</span><button class=\'avatar-edit-btn\' id=\'openModalBtn\'>Edit</button>';">`;
                // Re-bind modal trigger since innerHTML replaced it
                rebindModalButton();
            } else {
                const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                avatarInitials.innerText = initials || "SD";
            }

        } else {
            window.location.href = 'login.html';
        }
    });

    // 2. Profile Picture Modal Controls
    const toggleModal = (show) => {
        if (avatarModal) {
            avatarModal.style.display = show ? 'flex' : 'none';
        }
    };

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => toggleModal(true));
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => toggleModal(false));
    }

    function rebindModalButton() {
        const btn = document.getElementById('openModalBtn');
        if (btn) {
            btn.addEventListener('click', () => toggleModal(true));
        }
    }

    // 3. Save Profile Picture URL to Firebase User Profile
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', () => {
            const photoUrl = avatarUrlInput.value.trim();
            if (!photoUrl) {
                alert("Please enter a valid image URL.");
                return;
            }

            const user = auth.currentUser;
            if (user) {
                saveAvatarBtn.innerText = "Saving...";
                updateProfile(user, { photoURL: photoUrl })
                    .then(() => {
                        saveAvatarBtn.innerText = "Save Photo";
                        toggleModal(false);
                        window.location.reload(); // Refresh to reflect new photo
                    })
                    .catch((error) => {
                        saveAvatarBtn.innerText = "Save Photo";
                        alert("Failed to update profile picture: " + error.message);
                    });
            }
        });
    }

    // 4. Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        });
    }
});