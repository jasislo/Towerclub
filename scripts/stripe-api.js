/**
 * Stripe API Integration Service
 * This file manages all interactions with the Stripe API including:
 * - Payment method creation and management
 * - Payment intents
 * - Customer management
 * - Subscription handling
 */

class StripeService {
    constructor() {
        this.stripePublishableKey = 'pk_live_51O6cvwHdkQbwbNbSyOfZmxkqUiYlDw0GWnUX1aFqEiRmPQHNPEUmMfPMYdpJHqsBYgqVmIJCYZwnKvlpXGWwUJdc00MRo0eSvg'; // Live Stripe publishable key
        this.stripe = Stripe(this.stripePublishableKey);
        this.elements = null;
        this.paymentElement = null;
        this.apiBase = '/netlify/functions/stripe-api'; // Base URL for serverless functions
    }

    /**
     * Initialize Stripe Elements
     * @param {string} elementId - The ID of the container element
     * @param {Object} options - Stripe Elements configuration options
     * @returns {Object} - The created card element
     */
    initializeElements(elementId, options = {}) {
        this.elements = this.stripe.elements();
        
        const defaultOptions = {
            style: {
                base: {
                    color: '#32325d',
                    fontFamily: '"Lexend", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        const cardElement = this.elements.create('card', mergedOptions);
        cardElement.mount(`#${elementId}`);
        
        return cardElement;
    }

    /**
     * Create a payment method from card data
     * @param {Object} cardElement - The Stripe card element
     * @param {Object} billingDetails - Customer billing details
     * @returns {Promise} - Resolves with the payment method or rejects with error
     */
    async createPaymentMethod(cardElement, billingDetails = {}) {
        try {
            const result = await this.stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: billingDetails
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.paymentMethod;
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        }
    }

    /**
     * Create a payment intent on the server
     * @param {number} amount - Amount in cents
     * @param {string} currency - Three-letter ISO currency code
     * @returns {Promise} - Resolves with client secret
     */
    async createPaymentIntent(amount, currency = 'usd') {
        try {
            const response = await fetch(`${this.apiBase}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    currency,
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.clientSecret;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    /**
     * Confirm a payment with the Stripe API
     * @param {string} clientSecret - The client secret from the PaymentIntent
     * @param {Object} cardElement - The Stripe card element
     * @param {Object} paymentData - Additional payment data
     * @returns {Promise} - Resolves with payment result
     */
    async confirmCardPayment(clientSecret, cardElement, paymentData = {}) {
        try {
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: paymentData.billingDetails || {},
                },
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.paymentIntent;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }

    /**
     * Get saved payment methods for the current user
     * @param {string} customerId - The Stripe customer ID
     * @returns {Promise} - Resolves with payment methods array
     */
    async getPaymentMethods(customerId) {
        try {
            const response = await fetch(`${this.apiBase}/get-payment-methods?customer=${customerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.paymentMethods;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    /**
     * Delete a payment method
     * @param {string} paymentMethodId - The Stripe payment method ID
     * @returns {Promise} - Resolves with deletion result
     */
    async deletePaymentMethod(paymentMethodId) {
        try {
            const response = await fetch(`${this.apiBase}/delete-payment-method`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId,
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting payment method:', error);
            throw error;
        }
    }

    /**
     * Create a new customer in Stripe
     * @param {Object} customerData - Customer information
     * @returns {Promise} - Resolves with customer object
     */
    async createCustomer(customerData) {
        try {
            const response = await fetch(`${this.apiBase}/create-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }
}

// Export the service as a singleton
const stripeService = new StripeService();
