// Create the header dynamically
const header = `
<nav class="main-nav">
    <div class="nav-content">
        <!-- Brand Section -->
        <a href="/pages/mainpage.html" class="nav-brand">
            <img src="../assets/images/towerclub_logo.png" alt="TowerClub Logo">
            <span class="brand-name">TowerClub</span>
        </a>

        <!-- Navigation Links -->
        <div class="nav-links">
            <a href="/pages/dashboard.html" class="nav-link">Dashboard</a>
            <a href="/pages/my_virtualcard.html" class="nav-link">Wallet</a>
            <a href="/pages/add-transaction.html" class="nav-link">Transfer</a>
            <a href="/pages/activities.html" class="nav-link">Activities</a>
            <a href="/pages/settings.html" class="nav-link">Settings</a>
        </div>

        <!-- Navigation Actions -->
        <div class="nav-actions">
            <!-- Profile Picture -->
            <div class="profile-picture-container">
                <img id="profilePicture" src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/finance-app-sample-kugwu4/assets/ijvuhvqbvns6/uiAvatar@2x.png" alt="Profile Picture" class="profile-picture">
                <input type="file" id="profilePictureInput" accept="image/*" style="display: none;">
            </div>
            <!-- Dark Mode Button -->
            <button id="darkModeToggle" class="btn-outline">Dark Mode</button>
            <!-- Log Out Button -->
            <a href="/pages/logout.html" class="btn-outline">Log out</a>
        </div>
    </div>
</nav>
`;

// Append the header to the body or a specific container
document.body.insertAdjacentHTML('afterbegin', header);

// Add functionality for the profile picture upload
const profilePicture = document.getElementById('profilePicture');
const profilePictureInput = document.getElementById('profilePictureInput');

// Make the profile picture clickable
profilePicture.addEventListener('click', () => {
    profilePictureInput.click();
});

// Handle the file input change event
profilePictureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicture.src = e.target.result; // Update the profile picture preview
        };
        reader.readAsDataURL(file);
    }
});

// Add functionality for navigation links
document.querySelector('.nav-brand').addEventListener('click', () => {
    window.location.href = '/pages/mainpage.html';
});

// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    darkModeToggle.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
});

<link rel="stylesheet" href="../styles/header style.css">
<script src="../scripts/header.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const profileImage = document.getElementById('profileImage');
        const profileImg = document.getElementById('profileImg');
        const profilePictureInput = document.getElementById('profilePictureInput');

        // Handle profile image click
        profileImage.addEventListener('click', () => {
            profilePictureInput.click();
        });

        // Handle file selection
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImg.src = e.target.result; // Update the profile picture preview
                };
                reader.readAsDataURL(file);
            }
        });
    });
</script>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const profilePictureHeader = document.getElementById('profilePicture'); // Header profile picture
        const profilePictureMain = document.getElementById('profileImage'); // Main profile picture
        const profilePictureInput = document.getElementById('profilePictureInput'); // File input for profile picture

        // Make the header profile picture clickable
        profilePictureHeader.addEventListener('click', () => {
            profilePictureInput.click();
        });

        // Make the main profile picture clickable
        profilePictureMain.addEventListener('click', () => {
            profilePictureInput.click();
        });

        // Handle the file input change event
        profilePictureInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Update both profile pictures
                    profilePictureHeader.src = e.target.result;
                    profilePictureMain.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
</script>

<script>
    // Sync profile picture everywhere on page load
    document.addEventListener('DOMContentLoaded', () => {
        const savedPic = localStorage.getItem('profilePicture');
        if (savedPic) {
            const headerPic = document.getElementById('profilePicture');
            if (headerPic) headerPic.src = savedPic;
            const mainPic = document.getElementById('profileImage');
            if (mainPic) mainPic.src = savedPic;
            const mainPic2 = document.getElementById('profileImg');
            if (mainPic2) mainPic2.src = savedPic;
        }
    });
</script>

<script>
    // Log Out Button Functionality
    const logoutBtn = document.querySelector('.nav-actions a[href="/pages/logout.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default link navigation

            try {
                // Clear all session and local storage data
                const keysToRemove = [
                    'memberProfile',
                    'profilePicture',
                    'paymentMethod',
                    'cardDetails',
                    'selectedPlan',
                    'selectedLanguage',
                    'authToken',
                    'userSession',
                    'lastLogin',
                    'preferences'
                ];

                // Remove specific keys
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                });

                // Clear any cookies that might be set
                document.cookie.split(';').forEach(cookie => {
                    const [name] = cookie.split('=');
                    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });

                // Optional: Call logout API endpoint if you have one
                // try {
                //     await fetch('/api/logout', {
                //         method: 'POST',
                //         credentials: 'include'
                //     });
                // } catch (error) {
                //     console.error('Logout API call failed:', error);
                // }

                // Clear any remaining localStorage data (optional, uncomment if needed)
                // localStorage.clear();
                // sessionStorage.clear();

                // Redirect to index page
                window.location.href = '/index.html';
            } catch (error) {
                console.error('Error during logout:', error);
                // Still redirect even if there's an error
                window.location.href = '/index.html';
            }
        });
    }
</script>

// Add Language Selector to the header (add to .nav-actions)
const navActions = document.querySelector('.nav-actions');
if (navActions && !document.getElementById('languageSelect')) {
    const languageSelect = document.createElement('select');
    languageSelect.id = 'languageSelect';
    languageSelect.className = 'language-select';
    languageSelect.setAttribute('aria-label', 'Select Language');
    languageSelect.innerHTML = `
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="zh">中文</option>
        <option value="ar">العربية</option>
    `;
    navActions.appendChild(languageSelect);
}

// Language Selector Functionality with API integration
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', async function () {
        const selectedLang = this.value;
        // Collect all text nodes to translate
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        const texts = Array.from(elementsToTranslate).map(el => el.textContent);

        try {
            // Call your translation API (replace '/api/translate' with your actual endpoint)
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    texts: texts,
                    targetLang: selectedLang
                })
            });
            if (!response.ok) throw new Error('Translation API error');
            const translated = await response.json();

            // Update the page with translated texts
            elementsToTranslate.forEach((el, idx) => {
                el.textContent = translated[idx];
            });

            // Optionally, save selected language to localStorage
            localStorage.setItem('selectedLanguage', selectedLang);
        } catch (error) {
            alert('Translation failed. Please try again.');
        }
    });

    // On page load, set language if previously selected
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        languageSelect.value = savedLang;
        languageSelect.dispatchEvent(new Event('change'));
    }
}

import profilePictureManager from './profile-picture-manager.js';

// Initialize profile picture manager
document.addEventListener('DOMContentLoaded', () => {
    // Register the header profile picture
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePictureManager.registerProfilePicture(profilePicture);
    }
    
    // Sync all profile pictures
    profilePictureManager.syncProfilePictures();
});