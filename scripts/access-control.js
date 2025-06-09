/**
 * Access Control Utility
 * Manages user access control and onboarding status across the application
 */

class AccessControl {
    constructor() {
        this.accessFlags = {
            userAuthenticated: 'userAuthenticated',
            userLoggedIn: 'userLoggedIn',
            accountActive: 'accountActive',
            needsOnboarding: 'needsOnboarding',
            onboardingCompleted: 'onboardingCompleted',
            profileComplete: 'profileComplete'
        };
    }

    /**
     * Check if user is fully authenticated and has access
     * @returns {boolean} Whether user has full access
     */
    hasFullAccess() {
        return this.isAuthenticated() && 
               this.isLoggedIn() && 
               this.isAccountActive() && 
               this.hasCompletedOnboarding() && 
               this.hasCompleteProfile();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isAuthenticated() {
        return localStorage.getItem(this.accessFlags.userAuthenticated) === 'true';
    }

    /**
     * Check if user is logged in
     * @returns {boolean} Whether user is logged in
     */
    isLoggedIn() {
        return localStorage.getItem(this.accessFlags.userLoggedIn) === 'true';
    }

    /**
     * Check if account is active
     * @returns {boolean} Whether account is active
     */
    isAccountActive() {
        return localStorage.getItem(this.accessFlags.accountActive) === 'true';
    }

    /**
     * Check if user needs onboarding
     * @returns {boolean} Whether user needs onboarding
     */
    needsOnboarding() {
        return localStorage.getItem(this.accessFlags.needsOnboarding) === 'true';
    }

    /**
     * Check if onboarding is completed
     * @returns {boolean} Whether onboarding is completed
     */
    hasCompletedOnboarding() {
        return localStorage.getItem(this.accessFlags.onboardingCompleted) === 'true';
    }

    /**
     * Check if profile is complete
     * @returns {boolean} Whether profile is complete
     */
    hasCompleteProfile() {
        return localStorage.getItem(this.accessFlags.profileComplete) === 'true';
    }

    /**
     * Get user access status
     * @returns {Object} User access status
     */
    getUserAccessStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            isLoggedIn: this.isLoggedIn(),
            isAccountActive: this.isAccountActive(),
            needsOnboarding: this.needsOnboarding(),
            hasCompletedOnboarding: this.hasCompletedOnboarding(),
            hasCompleteProfile: this.hasCompleteProfile(),
            hasFullAccess: this.hasFullAccess()
        };
    }

    /**
     * Redirect user based on their access status
     */
    redirectBasedOnAccess() {
        const status = this.getUserAccessStatus();
        
        if (!status.isAuthenticated) {
            // User not authenticated, redirect to login
            window.location.href = 'login.html';
            return;
        }
        
        if (status.needsOnboarding || !status.hasCompletedOnboarding) {
            // User needs to complete onboarding
            window.location.href = 'onboarding.html';
            return;
        }
        
        if (!status.hasCompleteProfile) {
            // User needs to complete profile
            window.location.href = 'onboarding.html';
            return;
        }
        
        // User has full access, allow current page
        return true;
    }

    /**
     * Protect a page - redirect if user doesn't have access
     * @param {string} redirectUrl - URL to redirect to if no access
     */
    protectPage(redirectUrl = 'login.html') {
        if (!this.hasFullAccess()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Check if user can access a specific feature
     * @param {string} feature - Feature name
     * @returns {boolean} Whether user can access the feature
     */
    canAccessFeature(feature) {
        const status = this.getUserAccessStatus();
        
        switch (feature) {
            case 'dashboard':
            case 'transactions':
            case 'payments':
            case 'profile':
            case 'settings':
                return status.hasFullAccess();
            
            case 'onboarding':
                return status.isAuthenticated && !status.hasCompletedOnboarding;
            
            case 'registration':
                return !status.isAuthenticated;
            
            case 'login':
                return !status.isAuthenticated;
            
            default:
                return status.hasFullAccess();
        }
    }

    /**
     * Get user session information
     * @returns {Object} User session data
     */
    getUserSession() {
        try {
            return JSON.parse(localStorage.getItem('userSession') || '{}');
        } catch (error) {
            console.error('Error parsing user session:', error);
            return {};
        }
    }

    /**
     * Check if user session is valid
     * @returns {boolean} Whether session is valid
     */
    isSessionValid() {
        const session = this.getUserSession();
        if (!session.isActive || !session.userId) {
            return false;
        }
        
        // Check if session is not expired (24 hours)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        return hoursDiff < 24;
    }

    /**
     * Update user session
     * @param {Object} sessionData - Session data to update
     */
    updateUserSession(sessionData = {}) {
        const currentSession = this.getUserSession();
        const updatedSession = {
            ...currentSession,
            ...sessionData,
            lastActivity: new Date().toISOString()
        };
        localStorage.setItem('userSession', JSON.stringify(updatedSession));
    }

    /**
     * Logout user
     */
    logout() {
        // Clear access flags
        Object.values(this.accessFlags).forEach(flag => {
            localStorage.removeItem(flag);
        });
        
        // Clear session
        localStorage.removeItem('userSession');
        
        // Clear user data (optional - you might want to keep some data)
        localStorage.removeItem('currentUser');
        localStorage.removeItem('memberProfile');
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('userFinancialData');
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    /**
     * Initialize access control for a page
     * @param {string} pageName - Name of the current page
     * @param {boolean} requireFullAccess - Whether page requires full access
     */
    initializePage(pageName, requireFullAccess = true) {
        // Update session activity
        this.updateUserSession();
        
        if (requireFullAccess && !this.hasFullAccess()) {
            this.redirectBasedOnAccess();
            return false;
        }
        
        // Log page access
        console.log(`User accessing ${pageName}`, this.getUserAccessStatus());
        return true;
    }

    /**
     * Get user's current access level
     * @returns {string} Access level
     */
    getAccessLevel() {
        const status = this.getUserAccessStatus();
        
        if (!status.isAuthenticated) {
            return 'guest';
        }
        
        if (status.needsOnboarding || !status.hasCompletedOnboarding) {
            return 'onboarding';
        }
        
        if (!status.hasCompleteProfile) {
            return 'profile_incomplete';
        }
        
        return 'full_access';
    }
}

// Create and export singleton instance
const accessControl = new AccessControl();
export default accessControl;

// Export individual methods for convenience
export const {
    hasFullAccess,
    isAuthenticated,
    isLoggedIn,
    isAccountActive,
    needsOnboarding,
    hasCompletedOnboarding,
    hasCompleteProfile,
    getUserAccessStatus,
    redirectBasedOnAccess,
    protectPage,
    canAccessFeature,
    getUserSession,
    isSessionValid,
    updateUserSession,
    logout,
    initializePage,
    getAccessLevel
} = accessControl; 