/**
 * User Data Manager
 * Handles user data storage and retrieval across the application
 */

class UserDataManager {
    constructor() {
        this.storageKeys = {
            onboardingData: 'onboardingData',
            userRegistrationData: 'userRegistrationData',
            currentUser: 'currentUser',
            memberProfile: 'memberProfile',
            userId: 'userId',
            phone: 'phone',
            needsOnboarding: 'needsOnboarding',
            onboardingCompleted: 'onboardingCompleted',
            profileComplete: 'profileComplete',
            registrationTimestamp: 'registrationTimestamp'
        };
    }

    /**
     * Get all user data
     * @returns {Object} Combined user data
     */
    getAllUserData() {
        return {
            onboardingData: this.getOnboardingData(),
            userRegistrationData: this.getUserRegistrationData(),
            currentUser: this.getCurrentUser(),
            memberProfile: this.getMemberProfile(),
            userId: this.getUserId(),
            phone: this.getPhone(),
            needsOnboarding: this.getNeedsOnboarding(),
            onboardingCompleted: this.getOnboardingCompleted(),
            profileComplete: this.getProfileComplete(),
            registrationTimestamp: this.getRegistrationTimestamp()
        };
    }

    /**
     * Get onboarding data
     * @returns {Object} Onboarding data
     */
    getOnboardingData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.onboardingData) || '{}');
        } catch (error) {
            console.error('Error parsing onboarding data:', error);
            return {};
        }
    }

    /**
     * Get user registration data
     * @returns {Object} Registration data
     */
    getUserRegistrationData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.userRegistrationData) || '{}');
        } catch (error) {
            console.error('Error parsing user registration data:', error);
            return {};
        }
    }

    /**
     * Get current user data
     * @returns {Object} Current user data
     */
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.currentUser) || '{}');
        } catch (error) {
            console.error('Error parsing current user data:', error);
            return {};
        }
    }

    /**
     * Get member profile
     * @returns {Object} Member profile data
     */
    getMemberProfile() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.memberProfile) || '{}');
        } catch (error) {
            console.error('Error parsing member profile:', error);
            return {};
        }
    }

    /**
     * Get user ID
     * @returns {string} User ID
     */
    getUserId() {
        return localStorage.getItem(this.storageKeys.userId) || null;
    }

    /**
     * Get phone number
     * @returns {string} Phone number
     */
    getPhone() {
        return localStorage.getItem(this.storageKeys.phone) || null;
    }

    /**
     * Check if user needs onboarding
     * @returns {boolean} Whether onboarding is needed
     */
    getNeedsOnboarding() {
        return localStorage.getItem(this.storageKeys.needsOnboarding) === 'true';
    }

    /**
     * Check if onboarding is completed
     * @returns {boolean} Whether onboarding is completed
     */
    getOnboardingCompleted() {
        return localStorage.getItem(this.storageKeys.onboardingCompleted) === 'true';
    }

    /**
     * Check if profile is complete
     * @returns {boolean} Whether profile is complete
     */
    getProfileComplete() {
        return localStorage.getItem(this.storageKeys.profileComplete) === 'true';
    }

    /**
     * Get registration timestamp
     * @returns {string} Registration timestamp
     */
    getRegistrationTimestamp() {
        return localStorage.getItem(this.storageKeys.registrationTimestamp) || null;
    }

    /**
     * Update onboarding data
     * @param {Object} data - New onboarding data
     */
    updateOnboardingData(data) {
        const currentData = this.getOnboardingData();
        const updatedData = { ...currentData, ...data };
        localStorage.setItem(this.storageKeys.onboardingData, JSON.stringify(updatedData));
    }

    /**
     * Update member profile
     * @param {Object} data - New profile data
     */
    updateMemberProfile(data) {
        const currentData = this.getMemberProfile();
        const updatedData = { ...currentData, ...data };
        localStorage.setItem(this.storageKeys.memberProfile, JSON.stringify(updatedData));
    }

    /**
     * Update current user
     * @param {Object} data - New user data
     */
    updateCurrentUser(data) {
        const currentData = this.getCurrentUser();
        const updatedData = { ...currentData, ...data };
        localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(updatedData));
    }

    /**
     * Mark onboarding as completed
     */
    markOnboardingCompleted() {
        localStorage.setItem(this.storageKeys.needsOnboarding, 'false');
        localStorage.setItem(this.storageKeys.onboardingCompleted, 'true');
        
        const onboardingData = this.getOnboardingData();
        onboardingData.onboardingCompleted = true;
        onboardingData.onboardingStep = 4;
        onboardingData.completedAt = new Date().toISOString();
        this.updateOnboardingData(onboardingData);
    }

    /**
     * Mark profile as complete
     */
    markProfileComplete() {
        localStorage.setItem(this.storageKeys.profileComplete, 'true');
        
        const onboardingData = this.getOnboardingData();
        onboardingData.profileComplete = true;
        onboardingData.profileCompletedAt = new Date().toISOString();
        this.updateOnboardingData(onboardingData);
    }

    /**
     * Clear all user data
     */
    clearAllUserData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isAuthenticated() {
        const currentUser = this.getCurrentUser();
        const userId = this.getUserId();
        return !!(currentUser && Object.keys(currentUser).length > 0 && userId);
    }

    /**
     * Get user's full name
     * @returns {string} User's full name
     */
    getUserFullName() {
        const onboardingData = this.getOnboardingData();
        const memberProfile = this.getMemberProfile();
        const currentUser = this.getCurrentUser();
        
        return onboardingData.fullName || 
               memberProfile.fullName || 
               currentUser.fullName || 
               `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
               'User';
    }

    /**
     * Get user's email
     * @returns {string} User's email
     */
    getUserEmail() {
        const onboardingData = this.getOnboardingData();
        const memberProfile = this.getMemberProfile();
        const currentUser = this.getCurrentUser();
        
        return onboardingData.email || 
               memberProfile.email || 
               currentUser.email || 
               '';
    }

    /**
     * Get user's phone
     * @returns {string} User's phone
     */
    getUserPhone() {
        const onboardingData = this.getOnboardingData();
        const memberProfile = this.getMemberProfile();
        const phone = this.getPhone();
        
        return onboardingData.phone || 
               memberProfile.phone || 
               phone || 
               '';
    }

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getUserPreferences() {
        const onboardingData = this.getOnboardingData();
        return onboardingData.preferences || {};
    }

    /**
     * Update user preferences
     * @param {Object} preferences - New preferences
     */
    updateUserPreferences(preferences) {
        const onboardingData = this.getOnboardingData();
        onboardingData.preferences = { ...onboardingData.preferences, ...preferences };
        this.updateOnboardingData(onboardingData);
    }

    /**
     * Get onboarding progress
     * @returns {number} Current onboarding step (1-4)
     */
    getOnboardingProgress() {
        const onboardingData = this.getOnboardingData();
        return onboardingData.onboardingStep || 1;
    }

    /**
     * Update onboarding progress
     * @param {number} step - New onboarding step
     */
    updateOnboardingProgress(step) {
        const onboardingData = this.getOnboardingData();
        onboardingData.onboardingStep = step;
        onboardingData.lastActivity = new Date().toISOString();
        this.updateOnboardingData(onboardingData);
    }
}

// Create and export singleton instance
const userDataManager = new UserDataManager();
export default userDataManager;

// Export individual methods for convenience
export const {
    getAllUserData,
    getOnboardingData,
    getUserRegistrationData,
    getCurrentUser,
    getMemberProfile,
    getUserId,
    getPhone,
    getNeedsOnboarding,
    getOnboardingCompleted,
    getProfileComplete,
    getRegistrationTimestamp,
    updateOnboardingData,
    updateMemberProfile,
    updateCurrentUser,
    markOnboardingCompleted,
    markProfileComplete,
    clearAllUserData,
    isAuthenticated,
    getUserFullName,
    getUserEmail,
    getUserPhone,
    getUserPreferences,
    updateUserPreferences,
    getOnboardingProgress,
    updateOnboardingProgress
} = userDataManager; 