// Dark Mode Module
const DarkMode = {
    // Initialize dark mode functionality
    init() {
        this.loadSavedPreference();
        this.setupEventListeners();
    },

    // Load saved dark mode preference from localStorage
    loadSavedPreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
        }
    },

    // Set up event listeners for dark mode toggle
    setupEventListeners() {
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Listen for system dark mode preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('darkMode')) {
                    this.setDarkMode(e.matches);
                }
            });
        }
    },

    // Toggle dark mode on/off
    toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.updateDarkModeIcon(isDarkMode);
        this.dispatchDarkModeChangeEvent(isDarkMode);
    },

    // Set dark mode explicitly
    setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', enabled);
        this.updateDarkModeIcon(enabled);
        this.dispatchDarkModeChangeEvent(enabled);
    },

    // Update the dark mode toggle icon
    updateDarkModeIcon(isDarkMode) {
        const icon = document.querySelector('.dark-mode-toggle i');
        if (icon) {
            icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
            // Update aria-label for accessibility
            icon.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
        }
    },

    // Dispatch a custom event when dark mode changes
    dispatchDarkModeChangeEvent(isDarkMode) {
        const event = new CustomEvent('darkModeChange', {
            detail: { isDarkMode }
        });
        document.dispatchEvent(event);
    },

    // Check if dark mode is currently enabled
    isDarkModeEnabled() {
        return document.body.classList.contains('dark-mode');
    },

    // Reset dark mode preference
    resetPreference() {
        localStorage.removeItem('darkMode');
        this.loadSavedPreference();
    }
};

// Initialize dark mode when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
});

// Export the DarkMode module
export default DarkMode;