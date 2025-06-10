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
            <button id="logoutBtn" class="btn-outline">Log out</button>
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
if (profilePicture) {
    profilePicture.addEventListener('click', () => {
        profilePictureInput.click();
    });
}

// Handle the file input change event
if (profilePictureInput) {
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicture.src = e.target.result; // Update the profile picture preview
                // Save to localStorage for persistence
                localStorage.setItem('profilePicture', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Add functionality for navigation links
const navBrand = document.querySelector('.nav-brand');
if (navBrand) {
    navBrand.addEventListener('click', () => {
        window.location.href = '/pages/mainpage.html';
    });
}

// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        darkModeToggle.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    });
}

// Log Out Button Functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default button behavior

        // Show loading state
        logoutBtn.textContent = 'Logging out...';
        logoutBtn.disabled = true;

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
                'preferences',
                'currentUser',
                'userAuthenticated',
                'userLoggedIn',
                'rememberMe',
                'rememberedEmail',
                'users',
                'paypalLoggedIn',
                'paypalLoginInProgress',
                'returnToPayPage',
                'paymentComplete',
                'selectedPlanAmount'
            ];

            // Remove specific keys from localStorage
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // Remove specific keys from sessionStorage
            keysToRemove.forEach(key => {
                sessionStorage.removeItem(key);
            });

            // Clear any cookies that might be set
            document.cookie.split(';').forEach(cookie => {
                const [name] = cookie.split('=');
                if (name.trim()) {
                    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                }
            });

            // Optional: Call logout API endpoint if you have one
            // try {
            //     await fetch('/api/logout', {
            //         method: 'POST',
            //         credentials: 'include',
            //         headers: {
            //             'Content-Type': 'application/json'
            //         }
            //     });
            // } catch (error) {
            //     console.error('Logout API call failed:', error);
            // }

            // Clear any remaining localStorage data (optional, uncomment if needed)
            // localStorage.clear();
            // sessionStorage.clear();

            // Show success message briefly
            logoutBtn.textContent = 'Logged out successfully!';
            
            // Redirect to index page after a short delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);

        } catch (error) {
            console.error('Error during logout:', error);
            
            // Reset button state
            logoutBtn.textContent = 'Log out';
            logoutBtn.disabled = false;
            
            // Still redirect even if there's an error
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }
    });
}

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

// Initialize profile picture manager if available
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { default: profilePictureManager } = await import('../../scripts/profile-picture-manager.js');
        
        // Register the header profile picture
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture && profilePictureManager) {
            profilePictureManager.registerProfilePicture(profilePicture);
        }
        
        // Sync all profile pictures
        if (profilePictureManager) {
            profilePictureManager.syncProfilePictures();
        }
    } catch (error) {
        console.log('Profile picture manager not available:', error);
    }
});