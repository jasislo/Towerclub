// Authentication utility functions
const AUTH_TOKEN_KEY = 'authToken';
const MEMBER_PROFILE_KEY = 'memberProfile';
const REMEMBER_ME_KEY = 'rememberMe';
const PAYPAL_SESSION_KEY = 'paypalSession';

// Store authentication data
function storeAuthData(token, profile, rememberMe = false, isPaypal = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(MEMBER_PROFILE_KEY, JSON.stringify(profile));
    if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
    }
    if (isPaypal) {
        storage.setItem(PAYPAL_SESSION_KEY, 'true');
    }
}

// Get authentication data
function getAuthData() {
    // First check localStorage (for "remember me" users)
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    const profile = JSON.parse(localStorage.getItem(MEMBER_PROFILE_KEY) || sessionStorage.getItem(MEMBER_PROFILE_KEY) || '{}');
    const isPaypal = localStorage.getItem(PAYPAL_SESSION_KEY) || sessionStorage.getItem(PAYPAL_SESSION_KEY);
    return { token, profile, isPaypal };
}

// Check if user is authenticated
function isAuthenticated() {
    const { token, profile, isPaypal } = getAuthData();
    return !!(token && profile && Object.keys(profile).length > 0);
}

// Clear authentication data
function clearAuthData() {
    // Clear from both storages to be safe
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(MEMBER_PROFILE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(PAYPAL_SESSION_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(MEMBER_PROFILE_KEY);
    sessionStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(PAYPAL_SESSION_KEY);
}

// Handle PayPal authentication
async function handlePaypalAuth(paypalData) {
    try {
        // Store PayPal session data
        storeAuthData(paypalData.token, paypalData.profile, false, true);
        
        // Redirect back to pay.html
        window.location.href = '/pages/PAY.HTML';
        return true;
    } catch (error) {
        console.error('PayPal authentication failed:', error);
        return false;
    }
}

// Check if user is authenticated via PayPal
function isPaypalAuthenticated() {
    const { isPaypal } = getAuthData();
    return !!isPaypal;
}

// Check authentication and redirect if not authenticated
function requireAuth(redirectUrl = '/pages/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Handle logout
async function handleLogout() {
    try {
        // Import auth API functions
        const { logoutUser } = await import('./auth-api.js');
        const { token } = getAuthData();
        
        // Call logout API if token exists
        if (token) {
            await logoutUser(token);
        }
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        // Clear auth data regardless of API call success
        clearAuthData();
        window.location.href = '/pages/login.html';
    }
}

// Export the functions
export {
    storeAuthData,
    getAuthData,
    isAuthenticated,
    clearAuthData,
    requireAuth,
    handleLogout,
    handlePaypalAuth,
    isPaypalAuthenticated
};