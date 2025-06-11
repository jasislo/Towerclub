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

// Mock API responses for development (remove in production)
function getMockResponse(endpoint) {
    const mockData = {
        '/user/profile': {
            id: 'user123',
            fullName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            profilePicture: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
            memberSince: '2024-01-15T10:30:00Z',
            balance: 7302.50,
            bitcoinBalance: 0.15,
            referralReward: 2340
        },
        '/account/balance': {
            balance: 7302.50,
            currency: 'USD',
            referralReward: 2340,
            bitcoinBalance: 0.15,
            ethereumBalance: 2.5,
            litecoinBalance: 15.8
        },
        '/transactions/recent': [
            {
                id: 'tx1',
                type: 'transfer',
                amount: -150.00,
                description: 'Transfer to Sarah',
                status: 'completed',
                timestamp: '2024-01-20T14:30:00Z'
            },
            {
                id: 'tx2',
                type: 'deposit',
                amount: 500.00,
                description: 'Bank deposit',
                status: 'completed',
                timestamp: '2024-01-19T09:15:00Z'
            },
            {
                id: 'tx3',
                type: 'crypto',
                amount: 75.25,
                description: 'Bitcoin purchase',
                status: 'pending',
                timestamp: '2024-01-18T16:45:00Z'
            }
        ],
        '/portfolio': {
            totalValue: 12543.75,
            walletPercentage: 32,
            cryptoPercentage: 32,
            referralPercentage: 40,
            assets: {
                cash: 7302.50,
                bitcoin: 5201.02,
                ethereum: 0,
                litecoin: 0,
                referralReward: 2340
            }
        }
    };
    
    return mockData[endpoint] || null;
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
        // Return mock data for development
        const mockData = getMockResponse('/user/profile');
        if (mockData) {
            localStorage.setItem('userData', JSON.stringify(mockData));
            return mockData;
        }
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
        // Return mock data for development
        return getMockResponse('/transactions/recent') || [];
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
        // Return mock data for development
        return {
            bitcoin: { usd: 34678.50, usd_24h_change: 2.45 },
            ethereum: { usd: 2089.75, usd_24h_change: -1.23 },
            litecoin: { usd: 68.90, usd_24h_change: 0.87 }
        };
    }
}

// Fetch Financial News
export async function fetchFinancialNews() {
    try {
        // Using a free financial news API (replace with your preferred API)
        const response = await fetch('https://api.example.com/financial-news?apiKey=YOUR_API_KEY');
        if (!response.ok) {
            throw new Error('Failed to fetch financial news');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching financial news:', error);
        // Return mock data for development
        return [
            {
                title: 'Bitcoin reaches new yearly high',
                source: 'CryptoNews',
                publishedAt: '2024-01-20T10:00:00Z'
            },
            {
                title: 'Federal Reserve maintains interest rates',
                source: 'Financial Times',
                publishedAt: '2024-01-19T15:30:00Z'
            },
            {
                title: 'Tech stocks rally on strong earnings',
                source: 'Bloomberg',
                publishedAt: '2024-01-18T14:20:00Z'
            }
        ];
    }
}

// Fetch Account Balance
export async function fetchAccountBalance() {
    try {
        const response = await fetchWithAuth('/account/balance');
        return response;
    } catch (error) {
        console.error('Error fetching account balance:', error);
        // Return mock data for development
        return getMockResponse('/account/balance') || {
            balance: 7302.50,
            currency: 'USD',
            referralReward: 2340
        };
    }
}

// Fetch Recent Transactions
export async function fetchRecentTransactions() {
    try {
        const response = await fetchWithAuth('/transactions/recent');
        return response;
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        // Return mock data for development
        return getMockResponse('/transactions/recent') || [];
    }
}

// Fetch Portfolio Data
export async function fetchPortfolioData() {
    try {
        const response = await fetchWithAuth('/portfolio');
        return response;
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        // Return mock data for development
        return getMockResponse('/portfolio') || {
            totalValue: 12543.75,
            walletPercentage: 32,
            cryptoPercentage: 32,
            referralPercentage: 40
        };
    }
}

// Get user notifications
export async function getUserNotifications() {
    try {
        const response = await fetchWithAuth('/user/notifications');
        return response;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // Return mock data for development
        return [
            {
                id: 'notif1',
                type: 'transaction',
                title: 'Transaction completed',
                message: 'Your transfer to Sarah has been completed',
                read: false,
                timestamp: '2024-01-20T14:35:00Z'
            },
            {
                id: 'notif2',
                type: 'crypto',
                title: 'Bitcoin price alert',
                message: 'Bitcoin has increased by 5% in the last hour',
                read: true,
                timestamp: '2024-01-20T12:00:00Z'
            }
        ];
    }
}

// Get user messages
export async function getUserMessages() {
    try {
        const response = await fetchWithAuth('/user/messages');
        return response;
    } catch (error) {
        console.error('Error fetching messages:', error);
        // Return mock data for development
        return [
            {
                id: 'msg1',
                senderId: 'user456',
                senderName: 'Sarah Johnson',
                message: 'Thanks for the transfer!',
                read: false,
                timestamp: '2024-01-20T14:30:00Z'
            },
            {
                id: 'msg2',
                senderId: 'user789',
                senderName: 'Mike Wilson',
                message: 'Can you send me your referral code?',
                read: true,
                timestamp: '2024-01-19T16:45:00Z'
            }
        ];
    }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetchWithAuth(`/user/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        return response;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

// Mark message as read
export async function markMessageAsRead(messageId) {
    try {
        const response = await fetchWithAuth(`/user/messages/${messageId}/read`, {
            method: 'PUT'
        });
        return response;
    } catch (error) {
        console.error('Error marking message as read:', error);
        throw error;
    }
}

// Get user statistics
export async function getUserStats() {
    try {
        const response = await fetchWithAuth('/user/stats');
        return response;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        // Return mock data for development
        return {
            totalTransactions: 45,
            totalTransfers: 23,
            totalCryptoTransactions: 12,
            referralCount: 8,
            memberSince: '2024-01-15T10:30:00Z',
            lastActivity: '2024-01-20T14:35:00Z'
        };
    }
}

// Get referral data
export async function getReferralData() {
    try {
        const response = await fetchWithAuth('/user/referrals');
        return response;
    } catch (error) {
        console.error('Error fetching referral data:', error);
        // Return mock data for development
        return {
            referralCode: 'JOHN2024',
            referralCount: 8,
            totalEarnings: 2340,
            pendingEarnings: 150,
            referrals: [
                {
                    id: 'ref1',
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    joinedAt: '2024-01-18T10:00:00Z',
                    status: 'active',
                    earnings: 300
                },
                {
                    id: 'ref2',
                    name: 'Mike Wilson',
                    email: 'mike@example.com',
                    joinedAt: '2024-01-17T14:30:00Z',
                    status: 'pending',
                    earnings: 0
                }
            ]
        };
    }
}

// Send referral invitation
export async function sendReferralInvitation(email) {
    try {
        const response = await fetchWithAuth('/user/referrals/invite', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        return response;
    } catch (error) {
        console.error('Error sending referral invitation:', error);
        throw error;
    }
}

// Get market data
export async function getMarketData() {
    try {
        const response = await fetchWithAuth('/market/data');
        return response;
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Return mock data for development
        return {
            marketCap: 2500000000000,
            volume24h: 45000000000,
            marketTrend: 'bullish',
            topGainers: [
                { symbol: 'BTC', change: 2.45 },
                { symbol: 'ETH', change: 1.87 },
                { symbol: 'LTC', change: 0.93 }
            ],
            topLosers: [
                { symbol: 'ADA', change: -1.23 },
                { symbol: 'DOT', change: -0.87 },
                { symbol: 'LINK', change: -0.45 }
            ]
        };
    }
}

// Enhanced API class for additional functionality
class EnhancedAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.authToken = getAuthToken();
    }

    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem('authToken', token);
    }

    async request(endpoint, options = {}) {
        if (!this.authToken) {
            throw new Error('No authentication token available');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    async verifyPhoneCode(code) {
        return this.request('/user/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    async resendVerificationCode(phoneNumber) {
        return this.request('/user/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber }),
        });
    }

    getPhoneNumber() {
        return localStorage.getItem('phoneNumber');
    }

    setPhoneNumber(phoneNumber, rememberMe = false) {
        if (rememberMe) {
            localStorage.setItem('phoneNumber', phoneNumber);
        } else {
            sessionStorage.setItem('phoneNumber', phoneNumber);
        }
    }
}

// Create and export singleton instance
const enhancedAPI = new EnhancedAPI();
export { enhancedAPI };

// Additional utility functions
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

export async function logTransactionActivity(transactionId, activityDetails) {
    try {
        const response = await fetchWithAuth('/transactions/activity', {
            method: 'POST',
            body: JSON.stringify({
                transactionId,
                activityDetails,
                timestamp: new Date().toISOString(),
            }),
        });
        return response;
    } catch (error) {
        console.error('Error logging transaction activity:', error);
        throw error;
    }
}

export async function makeTransaction(transactionData) {
    try {
        const response = await fetchWithAuth('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
        return response;
    } catch (error) {
        console.error('Error making transaction:', error);
        throw error;
    }
}