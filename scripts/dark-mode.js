// Dark Mode Module
const DarkMode = {
    // Initialize dark mode functionality
    init() {
        this.loadSavedPreference();
        this.setupEventListeners();
        this.loadDarkModeCSS();
    },

    // Load dark mode CSS file
    loadDarkModeCSS() {
        if (!document.querySelector('link[href*="dark-mode.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/dark-mode.css';
            document.head.appendChild(link);
        }
    },

    // Load saved dark mode preference from localStorage
    loadSavedPreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
            this.updateCSSVariables(true);
        } else {
            this.updateCSSVariables(false);
        }
    },

    // Set up event listeners for dark mode toggle
    setupEventListeners() {
        // Listen for dark mode toggle button clicks
        document.addEventListener('click', (e) => {
            if (e.target.id === 'darkModeToggle' || e.target.closest('#darkModeToggle')) {
                this.toggleDarkMode();
            }
        });

        // Listen for system dark mode preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('darkMode')) {
                    this.setDarkMode(e.matches);
                }
            });
        }

        // Listen for custom dark mode change events
        document.addEventListener('darkModeChange', (e) => {
            this.updatePageElements(e.detail.isDarkMode);
        });
    },

    // Toggle dark mode on/off
    toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode); // isDarkMode is true/false
        this.updateDarkModeIcon(isDarkMode);
        this.updateCSSVariables(isDarkMode);
        this.updatePageElements(isDarkMode);
        this.dispatchDarkModeChangeEvent(isDarkMode);
        
        // Add visual feedback
        this.showToggleFeedback(isDarkMode);
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
        this.updateCSSVariables(enabled);
        this.updatePageElements(enabled);
        this.dispatchDarkModeChangeEvent(enabled);
    },

    // Update the dark mode toggle icon and text
    updateDarkModeIcon(isDarkMode) {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            if (isDarkMode) {
                darkModeToggle.innerHTML = '<span class="material-icons">light_mode</span> Light Mode';
                darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                darkModeToggle.innerHTML = '<span class="material-icons">dark_mode</span> Dark Mode';
                darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    },

    // Update CSS custom properties based on dark mode state
    updateCSSVariables(isDarkMode) {
        const root = document.documentElement;
        
        if (isDarkMode) {
            // Dark mode variables
            root.style.setProperty('--primary-color', '#00B4A6');
            root.style.setProperty('--secondary-color', '#FFB088');
            root.style.setProperty('--background-color', '#15161E');
            root.style.setProperty('--text-color', '#F4F4F4');
            root.style.setProperty('--secondary-text-color', '#9CA3AF');
            root.style.setProperty('--card-background', '#1F2937');
            root.style.setProperty('--border-color', '#374151');
            root.style.setProperty('--button-color', '#2563EB');
            root.style.setProperty('--button-text-color', '#FFFFFF');
            root.style.setProperty('--header-bg', 'linear-gradient(90deg, #4B5563, #1F2937)');
            root.style.setProperty('--header-text-color', '#F4F4F4');
            root.style.setProperty('--footer-bg', '#111827');
            root.style.setProperty('--footer-text', '#6B7280');
            root.style.setProperty('--hover-bg', 'rgba(0, 180, 166, 0.2)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--card-shadow', '0 4px 8px rgba(0, 0, 0, 0.4)');
            root.style.setProperty('--input-bg', '#374151');
            root.style.setProperty('--input-border', '#4B5563');
            root.style.setProperty('--input-text', '#F4F4F4');
            root.style.setProperty('--menu-hover', 'rgba(0, 180, 166, 0.2)');
            root.style.setProperty('--menu-hover-text', '#00B4A6');
            root.style.setProperty('--menu-hover-border', '#00B4A6');
        } else {
            // Light mode variables
            root.style.setProperty('--primary-color', '#00968A');
            root.style.setProperty('--secondary-color', '#F2A384');
            root.style.setProperty('--background-color', '#F4F4F4');
            root.style.setProperty('--text-color', '#15161E');
            root.style.setProperty('--secondary-text-color', '#6B7280');
            root.style.setProperty('--card-background', '#FFFFFF');
            root.style.setProperty('--border-color', '#E5E7EB');
            root.style.setProperty('--button-color', '#3B82F6');
            root.style.setProperty('--button-text-color', '#FFFFFF');
            root.style.setProperty('--header-bg', 'linear-gradient(90deg, #22c55e, #a855f7)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--footer-bg', '#1f2937');
            root.style.setProperty('--footer-text', '#9ca3af');
            root.style.setProperty('--hover-bg', 'rgba(0, 150, 138, 0.1)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.15)');
            root.style.setProperty('--card-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)');
            root.style.setProperty('--input-bg', '#FFFFFF');
            root.style.setProperty('--input-border', '#E5E7EB');
            root.style.setProperty('--input-text', '#15161E');
            root.style.setProperty('--menu-hover', 'rgba(0, 150, 138, 0.1)');
            root.style.setProperty('--menu-hover-text', '#00968A');
            root.style.setProperty('--menu-hover-border', '#00968A');
        }
    },

    // Update page-specific elements for dark mode
    updatePageElements(isDarkMode) {
        // Update meta theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDarkMode ? '#15161E' : '#F4F4F4');
        }

        // Update favicon if needed
        this.updateFavicon(isDarkMode);

        // Trigger custom events for page-specific updates
        const event = new CustomEvent('darkModePageUpdate', {
            detail: { isDarkMode }
        });
        document.dispatchEvent(event);
    },

    // Update favicon based on dark mode
    updateFavicon(isDarkMode) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            // You can implement different favicons for dark/light mode here
            // favicon.href = isDarkMode ? '/assets/favicon-dark.png' : '/assets/favicon-light.png';
        }
    },

    // Show visual feedback when toggling dark mode
    showToggleFeedback(isDarkMode) {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            // Add a brief animation
            darkModeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                darkModeToggle.style.transform = 'scale(1)';
            }, 150);

            // Show a brief tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = isDarkMode ? 'Dark mode enabled' : 'Light mode enabled';
            tooltip.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${isDarkMode ? '#1F2937' : '#FFFFFF'};
                color: ${isDarkMode ? '#F4F4F4' : '#15161E'};
                padding: 8px 12px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-size: 14px;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(tooltip);

            setTimeout(() => {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 300);
            }, 2000);
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
    },

    // Get current theme preference
    getThemePreference() {
        return {
            isDarkMode: this.isDarkModeEnabled(),
            isSystemPreference: !localStorage.getItem('darkMode'),
            savedPreference: localStorage.getItem('darkMode')
        };
    },

    // Apply dark mode to specific elements
    applyToElement(element, isDarkMode) {
        if (isDarkMode) {
            element.classList.add('dark-mode');
        } else {
            element.classList.remove('dark-mode');
        }
    }
};

// Initialize dark mode when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
});

// Export the DarkMode module
export default DarkMode;