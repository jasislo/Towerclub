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

// Utility: Update all profile picture elements on the page
function updateAllProfilePictures(src) {
    // Add all possible profile picture element IDs here
    const picIds = ['profilePicture', 'profileImage', 'profileImg'];
    picIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    });
}

// On page load, sync profile pictures from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedPic = localStorage.getItem('profilePicture');
    if (savedPic) {
        updateAllProfilePictures(savedPic);
    }
});

// Handle profile picture upload and sync everywhere
profilePictureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            // Save to localStorage
            localStorage.setItem('profilePicture', dataUrl);
            // Update all profile pictures immediately
            updateAllProfilePictures(dataUrl);
        };
        reader.readAsDataURL(file);
    }
});