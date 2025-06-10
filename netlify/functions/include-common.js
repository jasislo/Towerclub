// Common include script for TowerClub
// This script adds common elements to any page

// Function to include header
function includeHeader() {
    const header = `
    <nav class="main-nav">
        <div class="nav-content">
            <!-- Brand Section -->
            <a href="/pages/mainpage.html" class="nav-brand">
                <img src="/assets/images/towerclub_logo.png" alt="TowerClub Logo">
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
    
    document.body.insertAdjacentHTML('afterbegin', header);
}

// Function to include footer
function includeFooter() {
    const footer = `
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="brand-wrapper">
                        <img src="/assets/images/towerclub_logo.png" alt="TowerClub Logo" data-i18n="footer-logo-alt">
                        <span class="brand-name" data-i18n="footer-brand-name">TowerClub</span>
                    </div>
                    <p class="brand-description" data-i18n="footer-description">
                        Your trusted platform for financial growth and investment opportunities.
                    </p>
                </div>
                <div class="footer-links-section">
                    <div class="footer-column">
                        <h4 data-i18n="footer-company">Company</h4>
                        <ul>
                            <li><a href="#" data-i18n="footer-about">About Us</a></li>
                            <li><a href="#" data-i18n="footer-careers">Careers</a></li>
                            <li><a href="#" data-i18n="footer-press">Press</a></li>
                            <li><a href="#" data-i18n="footer-blog">Blog</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 data-i18n="footer-resources">Resources</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Guides</a></li>
                            <li><a href="#">API</a></li>
                            <li><a href="#">Status</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 data-i18n="footer-legal">Legal</h4>
                        <ul>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Terms</a></li>
                            <li><a href="#">Security</a></li>
                            <li><a href="#">Cookies</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 data-i18n="footer-social">Social</h4>
                        <ul>
                            <li><a href="#">Twitter</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Facebook</a></li>
                            <li><a href="#">Instagram</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p data-i18n="footer-copyright">&copy; 2025 TowerClub LLC. All rights reserved.</p>
            </div>
        </div>
    </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footer);
}

// Function to include common CSS
function includeCommonCSS() {
    const commonCSS = `
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/main.css">
    `;
    
    document.head.insertAdjacentHTML('beforeend', commonCSS);
}

// Function to include common scripts
function includeCommonScripts() {
    const commonScripts = `
    <script src="/scripts/header.js"></script>
    <script src="/scripts/profile-picture-sync.js"></script>
    <script src="/scripts/sync.js"></script>
    <script src="/scripts/lang.js"></script>
    `;
    
    document.body.insertAdjacentHTML('beforeend', commonScripts);
}

// Auto-include everything when this script loads
document.addEventListener('DOMContentLoaded', () => {
    // Only include if not already present
    if (!document.querySelector('.main-nav')) {
        includeHeader();
    }
    if (!document.querySelector('.main-footer')) {
        includeFooter();
    }
    if (!document.querySelector('link[href*="header.css"]')) {
        includeCommonCSS();
    }
});

// Export functions for manual use
window.TowerClubCommon = {
    includeHeader,
    includeFooter,
    includeCommonCSS,
    includeCommonScripts
}; 