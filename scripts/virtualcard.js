/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {string} [format='medium'] - The format style (short, medium, long)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
        short: { month: 'numeric', day: 'numeric' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' }
    }[format];

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Calculate the percentage
 * @param {number} value - The current value
 * @param {number} total - The total value
 * @returns {number} The percentage
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Format a number as a percentage
 * @param {number} value - The value to format
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, length) {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password is valid
 */
export function isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
}

/**
 * Get the current user's timezone
 * @returns {string} Timezone string
 */
export function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Get the file extension from a filename
 * @param {string} filename - The filename
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if a value is empty
 * @param {*} value - The value to check
 * @returns {boolean} Whether the value is empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Virtual Card Number Generator for PayPal and VISA APIs
 */

// Card BINs for different card types
const CARD_BINS = {
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
};

/**
 * Generate a random card number with Luhn algorithm validation
 * @param {string} cardType - The type of card (VISA, MASTERCARD, PAYPAL)
 * @param {string} cardCategory - The category (DEBIT, CREDIT, VIRTUAL)
 * @returns {string} Valid card number
 */
export function generateCardNumber(cardType = 'VISA', cardCategory = 'VIRTUAL') {
    const bins = CARD_BINS[cardType.toUpperCase()]?.[cardCategory.toUpperCase()];
    if (!bins || bins.length === 0) {
        throw new Error(`Invalid card type: ${cardType} ${cardCategory}`);
    }

    // Select a random BIN
    const bin = bins[Math.floor(Math.random() * bins.length)];
    
    // Generate the middle digits (excluding the last digit for checksum)
    const middleDigits = generateRandomDigits(15 - bin.length);
    
    // Combine BIN + middle digits
    const partialNumber = bin + middleDigits;
    
    // Calculate and append the checksum digit
    const checksum = calculateLuhnChecksum(partialNumber);
    
    return partialNumber + checksum;
}

/**
 * Generate random digits
 * @param {number} length - Number of digits to generate
 * @returns {string} Random digits
 */
function generateRandomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

/**
 * Calculate Luhn algorithm checksum
 * @param {string} number - The number to calculate checksum for
 * @returns {string} The checksum digit
 */
function calculateLuhnChecksum(number) {
    let sum = 0;
    let isEven = false;
    
    // Process digits from right to left
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
}

/**
 * Validate a card number using Luhn algorithm
 * @param {string} cardNumber - The card number to validate
 * @returns {boolean} Whether the card number is valid
 */
export function validateCardNumber(cardNumber) {
    if (!cardNumber || typeof cardNumber !== 'string') {
        return false;
    }
    
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits and has valid length
    if (!/^\d{13,19}$/.test(cleanNumber)) {
        return false;
    }
    
    // Apply Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Generate a virtual card with complete details
 * @param {Object} options - Card generation options
 * @param {string} options.cardType - Card type (VISA, MASTERCARD, PAYPAL)
 * @param {string} options.cardCategory - Card category (DEBIT, CREDIT, VIRTUAL)
 * @param {string} options.cardholderName - Name on the card
 * @param {number} options.creditLimit - Credit limit (for credit cards)
 * @param {string} options.currency - Currency code (default: USD)
 * @returns {Object} Complete virtual card object
 */
export function generateVirtualCard(options = {}) {
    const {
        cardType = 'VISA',
        cardCategory = 'VIRTUAL',
        cardholderName = 'VIRTUAL CARD',
        creditLimit = 1000,
        currency = 'USD'
    } = options;

    const cardNumber = generateCardNumber(cardType, cardCategory);
    const expiryDate = generateExpiryDate();
    const cvv = generateCVV();
    const cardId = generateCardId();

    return {
        id: cardId,
        cardNumber: formatCardNumber(cardNumber),
        maskedNumber: maskCardNumber(cardNumber),
        cardholderName: cardholderName.toUpperCase(),
        expiryDate: expiryDate,
        cvv: cvv,
        cardType: cardType,
        cardCategory: cardCategory,
        creditLimit: creditLimit,
        currency: currency,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        balance: 0,
        transactions: []
    };
}

/**
 * Generate a future expiry date (2-5 years from now)
 * @returns {string} Expiry date in MM/YY format
 */
function generateExpiryDate() {
    const now = new Date();
    const year = now.getFullYear() + Math.floor(Math.random() * 4) + 2; // 2-5 years from now
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
}

/**
 * Generate a 3-digit CVV
 * @returns {string} CVV
 */
function generateCVV() {
    return Math.floor(Math.random() * 900 + 100).toString();
}

/**
 * Generate a unique card ID
 * @returns {string} Card ID
 */
function generateCardId() {
    return 'vc_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Format card number with spaces for display
 * @param {string} cardNumber - The card number
 * @returns {string} Formatted card number
 */
export function formatCardNumber(cardNumber) {
    const clean = cardNumber.replace(/[\s-]/g, '');
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Mask card number for security (show only last 4 digits)
 * @param {string} cardNumber - The card number
 * @returns {string} Masked card number
 */
export function maskCardNumber(cardNumber) {
    const clean = cardNumber.replace(/[\s-]/g, '');
    const lastFour = clean.slice(-4);
    const masked = '*'.repeat(clean.length - 4);
    return formatCardNumber(masked + lastFour);
}

/**
 * PayPal Virtual Card API Integration
 */
export class PayPalVirtualCardAPI {
    constructor(clientId, clientSecret, environment = 'sandbox') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.environment = environment;
        this.baseURL = environment === 'production' 
            ? 'https://api.paypal.com' 
            : 'https://api.sandbox.paypal.com';
        this.accessToken = null;
    }

    /**
     * Get PayPal access token
     * @returns {Promise<string>} Access token
     */
    async getAccessToken() {
        if (this.accessToken) return this.accessToken;

        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        
        const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error('Failed to get PayPal access token');
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        return this.accessToken;
    }

    /**
     * Create a PayPal virtual card
     * @param {Object} cardData - Card data
     * @returns {Promise<Object>} Created card response
     */
    async createVirtualCard(cardData) {
        const token = await this.getAccessToken();
        
        const payload = {
            card_type: cardData.cardType || 'VIRTUAL',
            cardholder_name: cardData.cardholderName,
            credit_limit: {
                currency: cardData.currency || 'USD',
                value: cardData.creditLimit || 1000
            },
            card_program_id: 'VIRTUAL_CARD_PROGRAM'
        };

        const response = await fetch(`${this.baseURL}/v1/vault/credit-cards`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to create PayPal virtual card');
        }

        return await response.json();
    }

    /**
     * Get PayPal virtual card details
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Card details
     */
    async getCardDetails(cardId) {
        const token = await this.getAccessToken();
        
        const response = await fetch(`${this.baseURL}/v1/vault/credit-cards/${cardId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get PayPal card details');
        }

        return await response.json();
    }
}

/**
 * VISA Virtual Card API Integration
 */
export class VISAVirtualCardAPI {
    constructor(apiKey, environment = 'sandbox') {
        this.apiKey = apiKey;
        this.environment = environment;
        this.baseURL = environment === 'production' 
            ? 'https://api.visa.com' 
            : 'https://sandbox.api.visa.com';
    }

    /**
     * Create a VISA virtual card
     * @param {Object} cardData - Card data
     * @returns {Promise<Object>} Created card response
     */
    async createVirtualCard(cardData) {
        const payload = {
            cardType: cardData.cardType || 'VIRTUAL',
            cardholderName: cardData.cardholderName,
            creditLimit: {
                amount: cardData.creditLimit || 1000,
                currency: cardData.currency || 'USD'
            },
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv
        };

        const response = await fetch(`${this.baseURL}/vpa/v1/cards`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to create VISA virtual card');
        }

        return await response.json();
    }

    /**
     * Get VISA virtual card details
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Card details
     */
    async getCardDetails(cardId) {
        const response = await fetch(`${this.baseURL}/vpa/v1/cards/${cardId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get VISA card details');
        }

        return await response.json();
    }
}

/**
 * Virtual Card Manager - Main interface for card operations
 */
export class VirtualCardManager {
    constructor(paypalConfig = null, visaConfig = null) {
        this.paypalAPI = paypalConfig ? new PayPalVirtualCardAPI(
            paypalConfig.clientId, 
            paypalConfig.clientSecret, 
            paypalConfig.environment
        ) : null;
        
        this.visaAPI = visaConfig ? new VISAVirtualCardAPI(
            visaConfig.apiKey, 
            visaConfig.environment
        ) : null;
        
        this.cards = new Map();
    }

    /**
     * Create a virtual card with specified provider
     * @param {string} provider - Card provider (PAYPAL, VISA, LOCAL)
     * @param {Object} options - Card options
     * @returns {Promise<Object>} Created card
     */
    async createCard(provider = 'LOCAL', options = {}) {
        let card;

        switch (provider.toUpperCase()) {
            case 'PAYPAL':
                if (!this.paypalAPI) {
                    throw new Error('PayPal API not configured');
                }
                card = await this.paypalAPI.createVirtualCard(options);
                break;
                
            case 'VISA':
                if (!this.visaAPI) {
                    throw new Error('VISA API not configured');
                }
                card = await this.visaAPI.createVirtualCard(options);
                break;
                
            case 'LOCAL':
            default:
                card = generateVirtualCard(options);
                break;
        }

        this.cards.set(card.id, card);
        return card;
    }

    /**
     * Get card details
     * @param {string} cardId - Card ID
     * @returns {Object} Card details
     */
    getCard(cardId) {
        return this.cards.get(cardId);
    }

    /**
     * Get all cards
     * @returns {Array} All cards
     */
    getAllCards() {
        return Array.from(this.cards.values());
    }

    /**
     * Update card details
     * @param {string} cardId - Card ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated card
     */
    updateCard(cardId, updates) {
        const card = this.cards.get(cardId);
        if (!card) {
            throw new Error('Card not found');
        }

        Object.assign(card, updates);
        this.cards.set(cardId, card);
        return card;
    }

    /**
     * Deactivate a card
     * @param {string} cardId - Card ID
     * @returns {Object} Deactivated card
     */
    deactivateCard(cardId) {
        return this.updateCard(cardId, { isActive: false });
    }

    /**
     * Add transaction to card
     * @param {string} cardId - Card ID
     * @param {Object} transaction - Transaction details
     * @returns {Object} Updated card
     */
    addTransaction(cardId, transaction) {
        const card = this.cards.get(cardId);
        if (!card) {
            throw new Error('Card not found');
        }

        card.transactions.push({
            id: generateId(),
            ...transaction,
            timestamp: new Date().toISOString()
        });

        card.lastUsed = new Date().toISOString();
        card.balance += transaction.amount;

        this.cards.set(cardId, card);
        return card;
    }
}

/**
 * Initialize virtual card system with configuration
 * @param {Object} config - Configuration object
 * @returns {VirtualCardManager} Card manager instance
 */
export function initializeVirtualCardSystem(config = {}) {
    const paypalConfig = config.paypal ? {
        clientId: config.paypal.clientId,
        clientSecret: config.paypal.clientSecret,
        environment: config.paypal.environment || 'sandbox'
    } : null;

    const visaConfig = config.visa ? {
        apiKey: config.visa.apiKey,
        environment: config.visa.environment || 'sandbox'
    } : null;

    return new VirtualCardManager(paypalConfig, visaConfig);
}