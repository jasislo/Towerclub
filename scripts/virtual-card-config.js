/**
 * Virtual Card Configuration
 * Store your API credentials and settings here
 */

export const VIRTUAL_CARD_CONFIG = {
    // PayPal API Configuration
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id_here',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_client_secret_here',
        environment: 'sandbox', // Change to 'production' for live environment
        enabled: false // Set to true when you have valid PayPal credentials
    },

    // VISA API Configuration
    visa: {
        apiKey: process.env.VISA_API_KEY || 'your_visa_api_key_here',
        environment: 'sandbox', // Change to 'production' for live environment
        enabled: false // Set to true when you have valid VISA credentials
    },

    // Local Card Generation Settings
    local: {
        enabled: true, // Always enabled for local generation
        defaultCardType: 'VISA',
        defaultCreditLimit: 1000,
        defaultCurrency: 'USD',
        cardBins: {
            VISA: {
                DEBIT: ['400000', '400001', '400002', '400003', '400004'],
                CREDIT: ['400005', '400006', '400007', '400008', '400009'],
                VIRTUAL: ['400010', '400011', '400012', '400013', '400014']
            },
            MASTERCARD: {
                DEBIT: ['510000', '510001', '510002', '510003', '510004'],
                CREDIT: ['510005', '510006', '510007', '510008', '510009'],
                VIRTUAL: ['510010', '510011', '510012', '510013', '510014']
            },
            PAYPAL: {
                VIRTUAL: ['400015', '400016', '400017', '400018', '400019']
            }
        }
    },

    // Security Settings
    security: {
        maskCardNumbers: true,
        requireAuthentication: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxCardsPerUser: 5,
        maxTransactionsPerCard: 1000
    },

    // UI Settings
    ui: {
        showCardNumber: false, // Default to masked
        autoRefreshInterval: 30000, // 30 seconds
        enableNotifications: true,
        theme: 'light' // 'light' or 'dark'
    },

    // Validation Settings
    validation: {
        requireLuhnCheck: true,
        validateExpiryDate: true,
        validateCVV: true,
        minCreditLimit: 100,
        maxCreditLimit: 50000
    }
};

/**
 * Get configuration for a specific provider
 * @param {string} provider - The provider name
 * @returns {Object} Provider configuration
 */
export function getProviderConfig(provider) {
    return VIRTUAL_CARD_CONFIG[provider.toLowerCase()] || null;
}

/**
 * Check if a provider is enabled
 * @param {string} provider - The provider name
 * @returns {boolean} Whether the provider is enabled
 */
export function isProviderEnabled(provider) {
    const config = getProviderConfig(provider);
    return config ? config.enabled : false;
}

/**
 * Get all enabled providers
 * @returns {Array} Array of enabled provider names
 */
export function getEnabledProviders() {
    return Object.keys(VIRTUAL_CARD_CONFIG)
        .filter(provider => isProviderEnabled(provider))
        .map(provider => provider.toUpperCase());
}

/**
 * Validate configuration
 * @returns {Object} Validation result
 */
export function validateConfig() {
    const errors = [];
    const warnings = [];

    // Check PayPal configuration
    if (VIRTUAL_CARD_CONFIG.paypal.enabled) {
        if (!VIRTUAL_CARD_CONFIG.paypal.clientId || VIRTUAL_CARD_CONFIG.paypal.clientId === 'your_paypal_client_id_here') {
            errors.push('PayPal Client ID is not configured');
        }
        if (!VIRTUAL_CARD_CONFIG.paypal.clientSecret || VIRTUAL_CARD_CONFIG.paypal.clientSecret === 'your_paypal_client_secret_here') {
            errors.push('PayPal Client Secret is not configured');
        }
    }

    // Check VISA configuration
    if (VIRTUAL_CARD_CONFIG.visa.enabled) {
        if (!VIRTUAL_CARD_CONFIG.visa.apiKey || VIRTUAL_CARD_CONFIG.visa.apiKey === 'your_visa_api_key_here') {
            errors.push('VISA API Key is not configured');
        }
    }

    // Check if at least one provider is enabled
    if (!getEnabledProviders().length) {
        warnings.push('No payment providers are enabled. Only local card generation will be available.');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get environment-specific configuration
 * @param {string} environment - The environment (development, staging, production)
 * @returns {Object} Environment-specific configuration
 */
export function getEnvironmentConfig(environment = 'development') {
    const baseConfig = { ...VIRTUAL_CARD_CONFIG };
    
    switch (environment) {
        case 'production':
            baseConfig.paypal.environment = 'production';
            baseConfig.visa.environment = 'production';
            baseConfig.security.requireAuthentication = true;
            baseConfig.ui.enableNotifications = true;
            break;
            
        case 'staging':
            baseConfig.paypal.environment = 'sandbox';
            baseConfig.visa.environment = 'sandbox';
            baseConfig.security.requireAuthentication = true;
            baseConfig.ui.enableNotifications = true;
            break;
            
        case 'development':
        default:
            baseConfig.paypal.environment = 'sandbox';
            baseConfig.visa.environment = 'sandbox';
            baseConfig.security.requireAuthentication = false;
            baseConfig.ui.enableNotifications = false;
            break;
    }
    
    return baseConfig;
} 