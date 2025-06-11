// Translation Manager
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = {};
        this.translationCache = new Map();
        this.pageTranslations = new Map(); // Cache translations per page
        this.GOOGLE_TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; // Replace with your API key
        this.initializeLanguageSelector();
        this.loadSavedTranslations();
        this.setupPageNavigationListener();
    }

    // Initialize language selector
    initializeLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', async (event) => {
                const newLanguage = event.target.value;
                await this.changeLanguage(newLanguage);
            });
        }
    }

    // Setup listener for page navigation to maintain language
    setupPageNavigationListener() {
        // Listen for navigation events
        window.addEventListener('popstate', () => {
            this.applyCurrentLanguage();
        });

        // Intercept link clicks to maintain language
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(link.href);
                url.searchParams.set('lang', this.currentLanguage);
                window.location.href = url.toString();
            }
        });
    }

    // Load saved translations from localStorage
    loadSavedTranslations() {
        const savedTranslations = localStorage.getItem('translations');
        if (savedTranslations) {
            this.translations = JSON.parse(savedTranslations);
            this.updatePageContent(this.translations);
        }
    }

    // Apply current language to the page
    async applyCurrentLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        
        if (langParam && langParam !== this.currentLanguage) {
            await this.changeLanguage(langParam);
        } else {
            await this.changeLanguage(this.currentLanguage);
        }
    }

    // Change website language
    async changeLanguage(languageCode) {
        try {
            // Show loading state
            document.body.style.opacity = '0.5';
            
            // Get current page path for caching
            const currentPage = window.location.pathname;
            
            // Get translations for the selected language and current page
            const translations = await this.getTranslations(languageCode, currentPage);
            
            // Update all translatable elements
            this.updatePageContent(translations);
            
            // Save selected language and translations
            this.currentLanguage = languageCode;
            localStorage.setItem('selectedLanguage', languageCode);
            
            // Update URL with language parameter
            const url = new URL(window.location.href);
            url.searchParams.set('lang', languageCode);
            window.history.replaceState({}, '', url);
            
            // Update HTML lang attribute
            document.documentElement.lang = languageCode;
            
            // Update RTL if needed
            this.updateTextDirection(languageCode);

            // Update meta tags
            this.updateMetaTags(translations);
            
        } catch (error) {
            console.error('Translation error:', error);
            alert('Failed to change language. Please try again.');
        } finally {
            // Reset loading state
            document.body.style.opacity = '1';
        }
    }

    // Get translations using Google Translate API
    async getTranslations(languageCode, pagePath) {
        // Check page-specific cache first
        const cacheKey = `${pagePath}-${languageCode}`;
        if (this.pageTranslations.has(cacheKey)) {
            return this.pageTranslations.get(cacheKey);
        }

        try {
            // Get all translatable elements
            const elements = document.querySelectorAll('[data-i18n]');
            const texts = Array.from(elements).map(el => ({
                key: el.getAttribute('data-i18n'),
                text: el.textContent.trim(),
                type: el.tagName.toLowerCase()
            }));

            // Filter out empty texts and duplicates
            const uniqueTexts = texts.filter((item, index, self) => 
                item.text && 
                index === self.findIndex(t => t.key === item.key)
            );

            // Prepare texts for translation
            const textArray = uniqueTexts.map(t => t.text);
            
            // Call Google Translate API
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_TRANSLATE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: textArray,
                    target: languageCode,
                    source: 'en',
                    format: 'html' // Enable HTML translation
                })
            });

            if (!response.ok) {
                throw new Error('Google Translate API error');
            }

            const data = await response.json();
            
            // Create translations object
            const translations = {};
            uniqueTexts.forEach((item, index) => {
                translations[item.key] = {
                    text: data.data.translations[index].translatedText,
                    type: item.type
                };
            });

            // Cache translations for this page
            this.pageTranslations.set(cacheKey, translations);
            
            return translations;

        } catch (error) {
            console.error('Error fetching translations:', error);
            // Fallback to local translations if API fails
            return this.getFallbackTranslations(languageCode);
        }
    }

    // Update page content with translations
    updatePageContent(translations) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                const translation = translations[key];
                
                // Handle different element types
                switch (element.tagName) {
                    case 'INPUT':
                        if (element.type === 'text' || element.type === 'email' || element.type === 'password') {
                            element.placeholder = translation.text;
                        }
                        break;
                    case 'IMG':
                        element.alt = translation.text;
                        break;
                    case 'META':
                        element.content = translation.text;
                        break;
                    case 'OPTION':
                        element.textContent = translation.text;
                        break;
                    default:
                        // Handle HTML content safely
                        if (translation.text.includes('<')) {
                            element.innerHTML = translation.text;
                        } else {
                            element.textContent = translation.text;
                        }
                }
            }
        });

        // Update dynamic content
        this.updateDynamicContent(translations);
    }

    // Update dynamic content (content added after page load)
    updateDynamicContent(translations) {
        // Handle dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const elements = node.querySelectorAll('[data-i18n]');
                        elements.forEach(element => {
                            const key = element.getAttribute('data-i18n');
                            if (translations[key]) {
                                const translation = translations[key];
                                if (translation.text.includes('<')) {
                                    element.innerHTML = translation.text;
                                } else {
                                    element.textContent = translation.text;
                                }
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Fallback translations (basic translations for common elements)
    getFallbackTranslations(languageCode) {
        const fallbackTranslations = {
            'en': {
                'nav-features': 'Features',
                'nav-pricing': 'Pricing',
                'nav-about': 'About',
                'nav-login': 'Login',
                'nav-get-started': 'Get Started',
                // Add more fallback translations
            },
            'es': {
                'nav-features': 'Características',
                'nav-pricing': 'Precios',
                'nav-about': 'Acerca de',
                'nav-login': 'Iniciar sesión',
                'nav-get-started': 'Comenzar',
                // Add more fallback translations
            },
            // Add more languages
        };

        return fallbackTranslations[languageCode] || fallbackTranslations['en'];
    }

    // Update meta tags
    updateMetaTags(translations) {
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations['meta-description']) {
            metaDescription.content = translations['meta-description'];
        }

        // Update title
        if (translations['page-title']) {
            document.title = translations['page-title'];
        }

        // Update other meta tags
        const metaTags = document.querySelectorAll('meta[data-i18n]');
        metaTags.forEach(tag => {
            const key = tag.getAttribute('data-i18n');
            if (translations[key]) {
                tag.content = translations[key];
            }
        });
    }

    // Update text direction based on language
    updateTextDirection(languageCode) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        document.body.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
        
        // Add/remove RTL class
        if (rtlLanguages.includes(languageCode)) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get translation for a specific key
    getTranslation(key) {
        return this.translations[key] || key;
    }
}

// Create and export singleton instance
const translationManager = new TranslationManager();

// Apply translations on page load
document.addEventListener('DOMContentLoaded', () => {
    translationManager.applyCurrentLanguage();
});

export default translationManager; 