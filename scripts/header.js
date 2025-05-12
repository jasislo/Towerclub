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