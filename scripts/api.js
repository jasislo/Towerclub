// API utility functions for TowerClub web app
class API {
    static baseURL = '/.netlify/functions';
    
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        return response.json();
    }
    
    // Authentication
    static async login(email, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
    
    static async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    // Virtual Cards
    static async getVirtualCards() {
        return this.request('/virtual-cards');
    }
    
    static async createVirtualCard(cardData) {
        return this.request('/virtual-cards', {
            method: 'POST',
            body: JSON.stringify(cardData)
        });
    }
    
    // Transactions
    static async getTransactions() {
        return this.request('/transactions');
    }
    
    static async createTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }
    
    // Database test
    static async testDatabase() {
        return this.request('/test-db');
    }
}

// Auth utilities
class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
    
    static getUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
    
    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/pages/login.html';
    }
    
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
        }
    }
    
    static getToken() {
        return localStorage.getItem('authToken');
    }
}

// PayPal Session Management
class PayPalAuth {
    static isLoggedIn() {
        return localStorage.getItem('paypalLoggedIn') === 'true' || 
               sessionStorage.getItem('paypalLoggedIn') === 'true';
    }
    
    static login() {
        localStorage.setItem('paypalLoggedIn', 'true');
        sessionStorage.setItem('paypalLoggedIn', 'true');
        localStorage.setItem('paypalLoginTime', Date.now().toString());
    }
    
    static logout() {
        localStorage.removeItem('paypalLoggedIn');
        sessionStorage.removeItem('paypalLoggedIn');
        localStorage.removeItem('paypalLoginTime');
        localStorage.removeItem('paypalUserData');
    }
    
    static requirePayPalAuth() {
        if (!this.isLoggedIn()) {
            alert('Please log in with PayPal to access this feature.');
            return false;
        }
        return true;
    }
    
    static getLoginTime() {
        const loginTime = localStorage.getItem('paypalLoginTime');
        return loginTime ? parseInt(loginTime) : null;
    }
    
    static isSessionValid() {
        const loginTime = this.getLoginTime();
        if (!loginTime) return false;
        
        // Session expires after 24 hours
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const now = Date.now();
        
        if (now - loginTime > sessionDuration) {
            this.logout();
            return false;
        }
        
        return true;
    }
    
    static getUserData() {
        const userData = localStorage.getItem('paypalUserData');
        return userData ? JSON.parse(userData) : null;
    }
    
    static setUserData(data) {
        localStorage.setItem('paypalUserData', JSON.stringify(data));
    }
}

// UI utilities
class UI {
    static showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    }
    
    static hideLoading(element, content) {
        if (element) {
            element.innerHTML = content;
        }
    }
    
    static showError(message) {
        alert(message);
    }
    
    static showSuccess(message) {
        alert(message);
    }
    
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Export for use in other files
window.API = API;
window.Auth = Auth;
window.PayPalAuth = PayPalAuth;
window.UI = UI;

// Check PayPal authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!PayPalAuth.requirePayPalAuth()) {
        // User will be redirected or shown alert
        return;
    }
    
    // Your page functionality here
    // PayPal user is authenticated
});

PayPalAuth.login();
PayPalAuth.setUserData(paypalUserData); // Store user data if needed 