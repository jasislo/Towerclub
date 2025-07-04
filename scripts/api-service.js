const API_BASE_URL = '/api';

// Get the authentication token from localStorage
export function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to make authenticated API calls
async function fetchWithAuth(endpoint, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/auth-login.html';
            throw new Error('Authentication failed');
        } else if (response.status === 403) {
            throw new Error('Access forbidden');
        } else if (response.status === 404) {
            throw new Error('Resource not found');
        }
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

// Get user data from the API
export async function getUserData() {
    try {
        const userData = await fetchWithAuth('/user/profile');
        // Cache the user data
        localStorage.setItem('userData', JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Try to return cached data if available
        const cachedData = localStorage.getItem('userData');
        return cachedData ? JSON.parse(cachedData) : null;
    }
}

// Update user profile
export async function updateUserProfile(profileData) {
    try {
        const response = await fetchWithAuth('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
        
        // Update cached user data
        localStorage.setItem('userData', JSON.stringify(response));
        return response;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Upload profile image
export async function uploadProfileImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetchWithAuth('/user/profile/image', {
            method: 'POST',
            headers: {
                // Remove Content-Type to let browser set it with boundary for FormData
                'Content-Type': undefined,
            },
            body: formData,
        });

        return response.imageUrl;
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
}

// Verify phone number
export async function verifyPhone(code) {
    try {
        const response = await fetchWithAuth('/user/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
        return response;
    } catch (error) {
        console.error('Error verifying phone:', error);
        throw error;
    }
}

// Resend verification code
export async function resendVerificationCode() {
    try {
        const response = await fetchWithAuth('/user/resend-verification', {
            method: 'POST',
        });
        return response;
    } catch (error) {
        console.error('Error resending verification code:', error);
        throw error;
    }
}

// Get transactions
export async function getTransactions() {
    try {
        const transactions = await fetchWithAuth('/transactions');
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
}

// Get cryptocurrency data
export async function getCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd&include_24hr_change=true');
        if (!response.ok) {
            throw new Error('Failed to fetch cryptocurrency data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
}

// Fetch Financial News
export async function fetchFinancialNews() {
    try {
        const response = await fetch('https://api.example.com/financial-news?apiKey=YOUR_API_KEY');
        if (!response.ok) {
            throw new Error('Failed to fetch financial news');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching financial news:', error);
        throw error;
    }
}

// Fetch Account Balance
export async function fetchAccountBalance() {
    try {
        const response = await fetchWithAuth('/account/balance');
        return response;
    } catch (error) {
        console.error('Error fetching account balance:', error);
        throw error;
    }
}

// Fetch Recent Transactions
export async function fetchRecentTransactions() {
    try {
        const response = await fetchWithAuth('/transactions/recent');
        return response;
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        throw error;
    }
}

// Fetch Portfolio Data
export async function fetchPortfolioData() {
    try {
        const response = await fetchWithAuth('/portfolio');
        return response;
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        throw error;
    }
}

class ApiService {
    constructor() {
        this.baseUrl = '/api'; // Update this with your actual API base URL
        this.headers = {
            'Content-Type': 'application/json',
        };
    }

    // Set the authentication token
    setAuthToken(token) {
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.headers['Authorization'];
        }
    }

    // Generic request handler
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: this.headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Phone verification endpoints
    async verifyPhoneCode(code) {
        return this.request('/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    async resendVerificationCode(phoneNumber) {
        return this.request('/resend-code', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber }),
        });
    }

    // Get the phone number from the session/local storage
    getPhoneNumber() {
        return localStorage.getItem('phoneNumber') || sessionStorage.getItem('phoneNumber');
    }

    // Store the phone number temporarily
    setPhoneNumber(phoneNumber, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('phoneNumber', phoneNumber);
    }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;

// Update user settings
export async function updateUserSettings(settings) {
    try {
        const response = await fetchWithAuth('/user/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
        return response;
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
}

// Log activity for a transaction
export async function logTransactionActivity(transactionId, activityDetails) {
    try {
        const response = await fetchWithAuth('/activities/log', {
            method: 'POST',
            body: JSON.stringify({
                transactionId,
                activityDetails,
            }),
        });
        return response;
    } catch (error) {
        console.error('Error logging transaction activity:', error);
        throw error;
    }
}

// Make a transaction and log the activity
export async function makeTransaction(transactionData) {
    try {
        // Make the transaction
        const transactionResponse = await fetchWithAuth('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });

        // Log the activity
        await logTransactionActivity(transactionResponse.id, {
            description: `Transaction of $${transactionData.amount} to ${transactionData.recipient}`,
            type: 'transaction',
            timestamp: new Date().toISOString(),
        });

        return transactionResponse;
    } catch (error) {
        console.error('Error making transaction:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const newsData = await fetchFinancialNews();
        const balanceData = await fetchAccountBalance();
        const transactionsData = await fetchRecentTransactions();
        const portfolioData = await fetchPortfolioData();

        // Update the DOM with fetched data
        // Example: Update financial news
        const newsSection = document.querySelector('.news-section');
        newsSection.innerHTML = '<h2>Financial News</h2>';
        newsData.articles.forEach(article => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.innerHTML = `
                <span>${article.title}</span>
                <span>Source: ${article.source.name}</span>
            `;
            newsSection.appendChild(newsItem);
        });

        // Update balance
        document.querySelector('.balance-card .amount').textContent = `$${balanceData.balance}`;

        // Update transactions
        const transactionSection = document.querySelector('.transaction-section');
        transactionSection.innerHTML = '<h2>Recent Transactions</h2>';
        transactionsData.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.classList.add('transaction-item');
            transactionItem.innerHTML = `
                <span>${transaction.description}</span>
                <span class="amount">${transaction.amount < 0 ? '-' : '+'}$${Math.abs(transaction.amount)}</span>
            `;
            transactionSection.appendChild(transactionItem);
        });

        // Update portfolio
        document.querySelector('.portfolio-value').textContent = `$${portfolioData.totalValue}`;
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});

document.querySelector('#makeTransactionButton').addEventListener('click', async () => {
    const transactionData = {
        amount: 100, // Example amount
        recipient: 'John Doe', // Example recipient
    };

    try {
        const transactionResponse = await makeTransaction(transactionData);
        console.log('Transaction successful:', transactionResponse);

        // Optionally update the UI or redirect the user
        alert('Transaction completed and activity logged!');
    } catch (error) {
        console.error('Error processing transaction:', error);
        alert('Failed to complete the transaction.');
    }
});

// POST /activities/log
app.post('/activities/log', authenticate, async (req, res) => {
    const { transactionId, activityDetails } = req.body;

    try {
        const activity = await Activity.create({
            transactionId,
            ...activityDetails,
        });
        res.status(201).json(activity);
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});