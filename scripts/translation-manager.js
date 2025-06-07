// Translation Manager
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = {};
        this.translationCache = new Map();
        this.initializeLanguageSelector();
    }

    // Initialize language selector
    initializeLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            // Set initial language
            languageSelect.value = this.currentLanguage;
            
            // Add change event listener
            languageSelect.addEventListener('change', async (event) => {
                const newLanguage = event.target.value;
                await this.changeLanguage(newLanguage);
            });
        }
    }

    // Change website language
    async changeLanguage(languageCode) {
        try {
            // Show loading state
            document.body.style.opacity = '0.5';
            
            // Get translations for the selected language
            const translations = await this.getTranslations(languageCode);
            
            // Update all translatable elements
            this.updatePageContent(translations);
            
            // Save selected language
            this.currentLanguage = languageCode;
            localStorage.setItem('selectedLanguage', languageCode);
            
            // Update HTML lang attribute
            document.documentElement.lang = languageCode;
            
            // Update RTL if needed
            this.updateTextDirection(languageCode);
            
        } catch (error) {
            console.error('Translation error:', error);
            alert('Failed to change language. Please try again.');
        } finally {
            // Reset loading state
            document.body.style.opacity = '1';
        }
    }

    // Get translations for a language
    async getTranslations(languageCode) {
        // Check cache first
        if (this.translationCache.has(languageCode)) {
            return this.translationCache.get(languageCode);
        }

        try {
            // Get all translatable elements
            const elements = document.querySelectorAll('[data-i18n]');
            const texts = Array.from(elements).map(el => ({
                key: el.getAttribute('data-i18n'),
                text: el.textContent.trim()
            }));

            // Call translation API
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texts: texts.map(t => t.text),
                    targetLang: languageCode,
                    sourceLang: 'en' // Assuming English is the source language
                })
            });

            if (!response.ok) {
                throw new Error('Translation API error');
            }

            const translatedTexts = await response.json();
            
            // Create translations object
            const translations = {};
            texts.forEach((item, index) => {
                translations[item.key] = translatedTexts[index];
            });

            // Cache translations
            this.translationCache.set(languageCode, translations);
            
            return translations;

        } catch (error) {
            console.error('Error fetching translations:', error);
            throw error;
        }
    }

    // Update page content with translations
    updatePageContent(translations) {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                // Handle different element types
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translations[key];
                } else if (element.tagName === 'IMG') {
                    element.alt = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        // Update meta tags
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations['meta-description']) {
            metaDescription.content = translations['meta-description'];
        }

        // Update title
        if (translations['page-title']) {
            document.title = translations['page-title'];
        }
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
}

// Create and export singleton instance
const translationManager = new TranslationManager();
export default translationManager; 