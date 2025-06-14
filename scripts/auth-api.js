// Authentication API Service
const API_BASE_URL = '/api';

// Mock user database for demonstration
// In a real application, this would be replaced with actual database calls
const mockUsers = [
    {
        id: 1,
        email: 'demo@towerclub.com',
        password: 'password123', // In real app, this would be hashed
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1234567890',
        isVerified: true,
        memberSince: '2024-01-01',
        balance: 1250.75,
        profile: {
            avatar: '/assets/images/default-avatar.png',
            bio: 'Demo user for TowerClub',
            location: 'New York, NY'
        },
        paymentMethods: [
            {
                id: 1,
                type: 'card',
                last4: '1234',
                brand: 'Visa',
                isDefault: true
            }
        ],
        transactions: [
            {
                id: 1,
                type: 'deposit',
                amount: 1000,
                date: '2024-01-15',
                status: 'completed'
            }
        ]
    }
];

// Mock verification codes storage
const verificationCodes = new Map();

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    return response.json();
}

// Helper function to make authenticated API calls
async function authenticatedApiCall(endpoint, options = {}) {
    const { getAuthData } = await import('./aut-utils.js');
    const { token } = getAuthData();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    return apiCall(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}

// Login API endpoint
export async function loginUser(email, password, rememberMe = false) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find user in mock database
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Generate mock JWT token
        const token = btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            exp: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 1 day
        }));

        // Return user data without password
        const { password: _, ...userData } = user;
        
        return {
            success: true,
            token,
            user: userData,
            message: 'Login successful'
        };
    } catch (error) {
        throw new Error(error.message || 'Login failed');
    }
}

// Logout API endpoint
export async function logoutUser(token) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real application, you would invalidate the token on the server
        // For now, we'll just return success
        return {
            success: true,
            message: 'Logout successful'
        };
    } catch (error) {
        throw new Error('Logout failed');
    }
}

// Check authentication status
export async function checkAuthStatus(token) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!token) {
            return { authenticated: false };
        }

        // Decode and validate token
        const tokenData = JSON.parse(atob(token));
        
        if (tokenData.exp < Date.now()) {
            return { authenticated: false, error: 'Token expired' };
        }

        // Find user in mock database
        const user = mockUsers.find(u => u.id === tokenData.userId);
        
        if (!user) {
            return { authenticated: false, error: 'User not found' };
        }

        const { password: _, ...userData } = user;
        
        return {
            authenticated: true,
            user: userData
        };
    } catch (error) {
        return { authenticated: false, error: 'Invalid token' };
    }
}

// Register new user
export async function registerUser(userData) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Import GitHub integration
        const githubIntegration = await import('./github-integration.js').then(module => module.default);
        
        // Try to get GitHub profile data if username is provided
        let githubProfile = null;
        if (userData.githubUsername) {
            try {
                const githubResult = await githubIntegration.getUserInfo(userData.githubUsername);
                if (githubResult.success) {
                    githubProfile = githubResult.user;
                }
            } catch (error) {
                console.warn('Failed to fetch GitHub profile:', error.message);
            }
        }

        // Create new user with enhanced profile data
        const newUser = {
            id: mockUsers.length + 1,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            username: userData.username || userData.email.split('@')[0],
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            isVerified: false,
            memberSince: new Date().toISOString().split('T')[0],
            balance: 0,
            profile: {
                avatar: githubProfile?.avatar || '/assets/images/default-avatar.png',
                bio: githubProfile?.bio || '',
                location: githubProfile?.location || '',
                company: githubProfile?.company || '',
                blog: githubProfile?.blog || '',
                githubUsername: userData.githubUsername || null
            },
            github: githubProfile ? {
                id: githubProfile.id,
                username: githubProfile.username,
                publicRepos: githubProfile.publicRepos,
                followers: githubProfile.followers,
                following: githubProfile.following,
                createdAt: githubProfile.createdAt,
                updatedAt: githubProfile.updatedAt
            } : null,
            paymentMethods: [],
            transactions: []
        };

        // Add to mock database
        mockUsers.push(newUser);

        // Generate token
        const token = btoa(JSON.stringify({
            userId: newUser.id,
            email: newUser.email,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 1 day
        }));

        const { password: _, ...userDataWithoutPassword } = newUser;

        return {
            success: true,
            token,
            user: userDataWithoutPassword,
            message: 'Registration successful',
            githubProfile: githubProfile ? 'GitHub profile linked successfully' : null
        };
    } catch (error) {
        throw new Error(error.message || 'Registration failed');
    }
}

// Send verification code
export async function sendVerificationCode(phoneNumber) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(phoneNumber, {
            code,
            expires: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // In a real application, you would send an SMS with verification code
        console.log(`Verification code for ${phoneNumber}: ${code}`);

        return {
            success: true,
            message: 'Verification code sent to your phone number',
            code: code // Remove this in production
        };
    } catch (error) {
        throw new Error('Failed to send verification code');
    }
}

// Verify phone number
export async function verifyPhone(token, phoneNumber, verificationCode) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const tokenData = JSON.parse(atob(token));
        const user = mockUsers.find(u => u.id === tokenData.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Check verification code
        const storedCode = verificationCodes.get(phoneNumber);
        if (!storedCode || storedCode.expires < Date.now()) {
            throw new Error('Verification code expired or invalid');
        }

        if (storedCode.code !== verificationCode) {
            throw new Error('Invalid verification code');
        }

        // Mark phone as verified
        user.phone = phoneNumber;
        user.isVerified = true;
        verificationCodes.delete(phoneNumber);
        
        const { password: _, ...userData } = user;
        
        return {
            success: true,
            user: userData,
            message: 'Phone number verified successfully'
        };
    } catch (error) {
        throw new Error(error.message || 'Phone verification failed');
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            throw new Error('User not found');
        }

        // In a real application, you would send a password reset email
        return {
            success: true,
            message: 'Password reset instructions sent to your email'
        };
    } catch (error) {
        throw new Error(error.message || 'Password reset failed');
    }
}

// Update user profile
export async function updateUserProfile(token, profileData) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const tokenData = JSON.parse(atob(token));
        const user = mockUsers.find(u => u.id === tokenData.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Update user profile
        Object.assign(user, profileData);

        const { password: _, ...userData } = user;
        
        return {
            success: true,
            user: userData,
            message: 'Profile updated successfully'
        };
    } catch (error) {
        throw new Error(error.message || 'Profile update failed');
    }
}

// Get user dashboard data
export async function getUserDashboard() {
    try {
        const response = await authenticatedApiCall('/user/dashboard');
        return response;
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        throw error;
    }
}

// Get user transactions
export async function getUserTransactions() {
    try {
        const response = await authenticatedApiCall('/user/transactions');
        return response;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
}

// Add payment method
export async function addPaymentMethod(paymentData) {
    try {
        const response = await authenticatedApiCall('/user/payment-methods', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
        return response;
    } catch (error) {
        console.error('Error adding payment method:', error);
        throw error;
    }
}

// Get payment methods
export async function getPaymentMethods() {
    try {
        const response = await authenticatedApiCall('/user/payment-methods');
        return response;
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }
}

// Delete payment method
export async function deletePaymentMethod(paymentMethodId) {
    try {
        const response = await authenticatedApiCall(`/user/payment-methods/${paymentMethodId}`, {
            method: 'DELETE'
        });
        return response;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
}

// Add transaction
export async function addTransaction(transactionData) {
    try {
        const response = await authenticatedApiCall('/user/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
        return response;
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
}

// Complete onboarding step
export async function completeOnboardingStep(step, data) {
    try {
        const response = await authenticatedApiCall('/user/onboarding/step', {
            method: 'POST',
            body: JSON.stringify({ step, data })
        });
        return response;
    } catch (error) {
        console.error('Error completing onboarding step:', error);
        throw error;
    }
}

// Get user data
export async function getUserData() {
    try {
        const response = await authenticatedApiCall('/user/profile');
        return response;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Verify GitHub username
export async function verifyGitHubUsername(username) {
    try {
        // Import GitHub integration
        const githubIntegration = await import('./github-integration.js').then(module => module.default);
        
        // Check if GitHub integration is enabled
        const { isFeatureEnabled } = await import('./config.js');
        if (!isFeatureEnabled('githubIntegration')) {
            return {
                success: false,
                error: 'GitHub integration is disabled'
            };
        }

        // Verify the username exists on GitHub
        const exists = await githubIntegration.verifyAccount(username);
        
        if (!exists) {
            return {
                success: false,
                error: 'GitHub username not found'
            };
        }

        // Get additional user info
        const userInfo = await githubIntegration.getUserInfo(username);
        
        return {
            success: true,
            exists: true,
            user: userInfo.success ? userInfo.user : null,
            message: 'GitHub username verified successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to verify GitHub username'
        };
    }
}
