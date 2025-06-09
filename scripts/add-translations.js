// Utility script to add translation support to HTML files
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const PAGES_DIR = '../pages';
const COMMON_TRANSLATIONS = {
    // Navigation
    'nav-features': 'Features',
    'nav-pricing': 'Pricing',
    'nav-about': 'About',
    'nav-login': 'Login',
    'nav-get-started': 'Get Started',
    'nav-dashboard': 'Dashboard',
    'nav-settings': 'Settings',
    'nav-profile': 'Profile',
    'nav-logout': 'Logout',

    // Common Actions
    'action-save': 'Save',
    'action-cancel': 'Cancel',
    'action-submit': 'Submit',
    'action-delete': 'Delete',
    'action-edit': 'Edit',
    'action-back': 'Back',
    'action-next': 'Next',
    'action-continue': 'Continue',

    // Form Labels
    'form-email': 'Email',
    'form-password': 'Password',
    'form-confirm-password': 'Confirm Password',
    'form-username': 'Username',
    'form-full-name': 'Full Name',
    'form-phone': 'Phone Number',
    'form-submit': 'Submit',
    'form-reset': 'Reset',

    // Messages
    'msg-loading': 'Loading...',
    'msg-success': 'Success!',
    'msg-error': 'Error!',
    'msg-warning': 'Warning!',
    'msg-info': 'Information',

    // Footer
    'footer-company': 'Company',
    'footer-about': 'About Us',
    'footer-careers': 'Careers',
    'footer-press': 'Press',
    'footer-blog': 'Blog',
    'footer-resources': 'Resources',
    'footer-help': 'Help Center',
    'footer-guides': 'Guides',
    'footer-api': 'API',
    'footer-status': 'Status',
    'footer-legal': 'Legal',
    'footer-privacy': 'Privacy',
    'footer-terms': 'Terms',
    'footer-security': 'Security',
    'footer-cookies': 'Cookies',
    'footer-social': 'Social',
    'footer-copyright': '© 2025 TowerClub LLC. All rights reserved.'
};

// Elements that should always be translated
const TRANSLATABLE_ELEMENTS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'a', 'button', 'label',
    'input[type="text"]', 'input[type="email"]',
    'input[type="password"]', 'textarea',
    'select', 'option', 'th', 'td'
];

// Elements that should not be translated
const EXCLUDE_ELEMENTS = [
    'script', 'style', 'code', 'pre',
    '[data-no-translate]', '[data-i18n]'
];

// Add translation support to a single HTML file
async function addTranslationSupport(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Add translation manager script if not present
        if (!document.querySelector('script[src*="translation-manager.js"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `import translationManager from '../scripts/translation-manager.js';`;
            document.head.appendChild(script);
        }

        // Add language selector if not present
        if (!document.querySelector('#languageSelect')) {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                const select = document.createElement('select');
                select.id = 'languageSelect';
                select.className = 'language-select';
                select.setAttribute('aria-label', 'Select Language');
                
                const languages = [
                    { code: 'en', name: 'English' },
                    { code: 'es', name: 'Español' },
                    { code: 'fr', name: 'Français' },
                    { code: 'zh', name: '中文' },
                    { code: 'ar', name: 'العربية' }
                ];

                languages.forEach(lang => {
                    const option = document.createElement('option');
                    option.value = lang.code;
                    option.setAttribute('data-i18n', `lang-${lang.code}`);
                    option.textContent = lang.name;
                    select.appendChild(option);
                });

                navActions.appendChild(select);
            }
        }

        // Add data-i18n attributes to translatable elements
        TRANSLATABLE_ELEMENTS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Skip if element or its parent is excluded
                if (element.closest(EXCLUDE_ELEMENTS.join(','))) {
                    return;
                }

                // Skip if element already has data-i18n
                if (element.hasAttribute('data-i18n')) {
                    return;
                }

                // Skip empty elements
                if (!element.textContent.trim()) {
                    return;
                }

                // Generate translation key
                const key = generateTranslationKey(element);
                element.setAttribute('data-i18n', key);

                // Add to common translations if not exists
                if (!COMMON_TRANSLATIONS[key]) {
                    COMMON_TRANSLATIONS[key] = element.textContent.trim();
                }
            });
        });

        // Add data-i18n-placeholder to input elements
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(element => {
            if (!element.hasAttribute('data-i18n-placeholder')) {
                const key = `${generateTranslationKey(element)}-placeholder`;
                element.setAttribute('data-i18n-placeholder', key);
                COMMON_TRANSLATIONS[key] = element.getAttribute('placeholder');
            }
        });

        // Add data-i18n to alt attributes
        document.querySelectorAll('img[alt]').forEach(element => {
            if (!element.hasAttribute('data-i18n')) {
                const key = `${generateTranslationKey(element)}-alt`;
                element.setAttribute('data-i18n', key);
                COMMON_TRANSLATIONS[key] = element.getAttribute('alt');
            }
        });

        // Update the file
        const updatedHtml = dom.serialize();
        fs.writeFileSync(filePath, updatedHtml);

        console.log(`Added translation support to ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return false;
    }
}

// Generate a translation key for an element
function generateTranslationKey(element) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `-${element.id}` : '';
    const classes = element.className ? `-${element.className.split(' ')[0]}` : '';
    const text = element.textContent.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);

    return `${tagName}${id}${classes}-${text}`;
}

// Process all HTML files in the pages directory
async function processAllFiles() {
    const files = fs.readdirSync(PAGES_DIR)
        .filter(file => file.endsWith('.html') || file.endsWith('.HTML'));

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const filePath = path.join(PAGES_DIR, file);
        const success = await addTranslationSupport(filePath);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Save common translations to a JSON file
    fs.writeFileSync(
        path.join(PAGES_DIR, 'translations.json'),
        JSON.stringify(COMMON_TRANSLATIONS, null, 2)
    );

    console.log(`\nProcessing complete:`);
    console.log(`Successfully processed: ${successCount} files`);
    console.log(`Failed to process: ${failCount} files`);
    console.log(`Common translations saved to translations.json`);
}

// Run the script
processAllFiles().catch(console.error); 