/**
 * Profile Picture Synchronization
 * This script ensures profile pictures are consistent across the TowerClub app
 * by applying saved images from localStorage to all relevant DOM elements.
 */

// Sync profile picture everywhere on page load
document.addEventListener('DOMContentLoaded', () => {
    // Sync profile picture
    const savedPic = localStorage.getItem('profilePicture');
    if (savedPic) {
        ['profilePicture', 'profileImage', 'profileImg', 'profileAvatarImg'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = savedPic;
        });
    }
    
    // Sync user profile data
    const userName = localStorage.getItem('userName');
    const userUsername = localStorage.getItem('userUsername');
    const userEmail = localStorage.getItem('userEmail');
    
    // Update profile name elements
    if (userName) {
        const nameElements = document.querySelectorAll('.profile-name, #profileName');
        nameElements.forEach(el => {
            if (el) el.textContent = userName;
        });
    }
    
    // Update username elements
    if (userUsername) {
        const usernameElements = document.querySelectorAll('.profile-username, #profileUsername');
        usernameElements.forEach(el => {
            if (el) el.textContent = `@${userUsername}`;
        });
    }
    
    // Update email elements
    if (userEmail) {
        const emailElements = document.querySelectorAll('.profile-email, #profileEmail');
        emailElements.forEach(el => {
            if (el) el.textContent = userEmail;
        });
    }
    
    // Set up event listeners for profile picture uploads
    const profilePictureInput = document.getElementById('profilePictureInput');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Save to localStorage for persistence across pages
                    localStorage.setItem('profilePicture', e.target.result);
                    
                    // Update all profile pictures on the current page
                    ['profilePicture', 'profileImage', 'profileImg', 'profileAvatarImg'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.src = e.target.result;
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
