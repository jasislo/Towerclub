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
window.UI = UI; 