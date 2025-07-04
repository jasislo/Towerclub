/**
 * Application Configuration
 * Store API credentials and settings here
 */

export const APP_CONFIG = {
    // GitHub API Configuration
    github: {
        token: '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',
        apiUrl: 'https://api.github.com',
        enabled: true
    },

    // API Base URL
    apiBaseUrl: '/api',

    // Authentication Settings
    auth: {
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
        refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    },

    // Security Settings
    security: {
        requirePhoneVerification: true,
        requireEmailVerification: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    },

    // Environment
    environment: 'development', // 'development', 'staging', 'production'
    
    // Feature Flags
    features: {
        githubIntegration: true,
        phoneVerification: true,
        emailVerification: true,
        twoFactorAuth: false
    }
};

/**
 * Get configuration for a specific service
 * @param {string} service - The service name
 * @returns {Object} Service configuration
 */
export function getServiceConfig(service) {
    return APP_CONFIG[service.toLowerCase()] || null;
}

/**
 * Check if a feature is enabled
 * @param {string} feature - The feature name
 * @returns {boolean} Whether the feature is enabled
 */
export function isFeatureEnabled(feature) {
    return APP_CONFIG.features[feature] || false;
}

/**
 * Get environment-specific configuration
 * @param {string} environment - The environment
 * @returns {Object} Environment-specific configuration
 */
export function getEnvironmentConfig(environment = APP_CONFIG.environment) {
    const baseConfig = { ...APP_CONFIG };
    
    switch (environment) {
        case 'production':
            baseConfig.apiBaseUrl = 'https://api.towerclub.com';
            baseConfig.security.requirePhoneVerification = true;
            baseConfig.security.requireEmailVerification = true;
            break;
            
        case 'staging':
            baseConfig.apiBaseUrl = 'https://staging-api.towerclub.com';
            baseConfig.security.requirePhoneVerification = true;
            baseConfig.security.requireEmailVerification = true;
            break;
            
        case 'development':
        default:
            baseConfig.apiBaseUrl = '/api';
            baseConfig.security.requirePhoneVerification = false;
            baseConfig.security.requireEmailVerification = false;
            break;
    }
    
    return baseConfig;
}

/**
 * Validate configuration
 * @returns {Object} Validation result
 */
export function validateConfig() {
    const errors = [];
    const warnings = [];

    // Check GitHub configuration
    if (APP_CONFIG.github.enabled) {
        if (!APP_CONFIG.github.token || APP_CONFIG.github.token === 'your_github_token_here') {
            errors.push('GitHub token is not configured');
        }
    }

    // Check environment
    if (!['development', 'staging', 'production'].includes(APP_CONFIG.environment)) {
        warnings.push('Invalid environment setting');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
} 