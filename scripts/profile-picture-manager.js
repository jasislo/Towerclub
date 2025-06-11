/**
 * Profile Picture Manager
 * Handles database operations and API calls for profile picture management
 */

class ProfilePictureManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentUserId = this.getCurrentUserId();
    }

    getCurrentUserId() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        
        return currentUser.userId || 
               currentUser.id || 
               memberProfile.userId || 
               onboardingData.userId || 
               'default-user';
    }

    /**
     * Upload profile picture to server and save to database
     */
    async uploadProfilePicture(file, userId = null) {
        try {
            const targetUserId = userId || this.currentUserId;
            
            // Create FormData
            const formData = new FormData();
            formData.append('profilePicture', file);
            formData.append('userId', targetUserId);
            formData.append('uploadDate', new Date().toISOString());

            // Upload to server
            const response = await fetch(`${this.apiBaseUrl}/profile/upload-picture`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Update local storage with server response
            this.updateLocalUserData(result.user);
            
            return result;
            
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    }

    /**
     * Get profile picture from database
     */
    async getProfilePicture(userId = null) {
        try {
            const targetUserId = userId || this.currentUserId;
            
            const response = await fetch(`${this.apiBaseUrl}/profile/picture/${targetUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch profile picture: ${response.statusText}`);
            }

            const result = await response.json();
            return result.profilePicture;
            
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            return null;
        }
    }

    /**
     * Update profile picture in database
     */
    async updateProfilePicture(userId, pictureData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile/update-picture`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: userId,
                    profilePicture: pictureData,
                    updatedAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Update failed: ${response.statusText}`);
            }

            const result = await response.json();
            this.updateLocalUserData(result.user);
            
            return result;
            
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    }

    /**
     * Delete profile picture from database
     */
    async deleteProfilePicture(userId = null) {
        try {
            const targetUserId = userId || this.currentUserId;
            
            const response = await fetch(`${this.apiBaseUrl}/profile/delete-picture`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: targetUserId
                })
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Clear local storage
            this.clearLocalProfilePicture();
            
            return result;
            
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            throw error;
        }
    }

    /**
     * Sync profile picture across all user sessions
     */
    async syncProfilePictureAcrossSessions(userId, pictureData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile/sync-picture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: userId,
                    profilePicture: pictureData,
                    syncTimestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('Error syncing profile picture:', error);
            throw error;
        }
    }

    /**
     * Get profile picture history from database
     */
    async getProfilePictureHistory(userId = null) {
        try {
            const targetUserId = userId || this.currentUserId;
            
            const response = await fetch(`${this.apiBaseUrl}/profile/picture-history/${targetUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch picture history: ${response.statusText}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('Error fetching picture history:', error);
            return [];
        }
    }

    /**
     * Update local user data with server response
     */
    updateLocalUserData(userData) {
        if (!userData) return;

        // Update currentUser
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedCurrentUser = { ...currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

        // Update memberProfile
        const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
        const updatedMemberProfile = { ...memberProfile, ...userData };
        localStorage.setItem('memberProfile', JSON.stringify(updatedMemberProfile));

        // Update onboardingData
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        const updatedOnboardingData = { ...onboardingData, ...userData };
        localStorage.setItem('onboardingData', JSON.stringify(updatedOnboardingData));

        // Update profile picture specifically
        if (userData.profilePicture) {
            localStorage.setItem('profilePicture', userData.profilePicture);
            localStorage.setItem('userProfilePicture', userData.profilePicture);
        }
    }

    /**
     * Clear local profile picture data
     */
    clearLocalProfilePicture() {
        localStorage.removeItem('profilePicture');
        localStorage.removeItem('userProfilePicture');
        
        // Update user data objects
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        delete currentUser.profilePicture;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
        delete memberProfile.profilePicture;
        localStorage.setItem('memberProfile', JSON.stringify(memberProfile));
        
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        delete onboardingData.profilePicture;
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    }

    /**
     * Get authentication token
     */
    getAuthToken() {
        return localStorage.getItem('authToken') || 
               localStorage.getItem('token') || 
               sessionStorage.getItem('authToken') || 
               '';
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please select a JPG, PNG, GIF, or WebP image.');
        }
        
        if (file.size > maxSize) {
            throw new Error('File size too large. Please select an image under 10MB.');
        }
        
        return true;
    }

    /**
     * Compress image before upload
     */
    async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// Initialize manager
const profilePictureManager = new ProfilePictureManager();

// Export for use in other scripts
window.profilePictureManager = profilePictureManager;

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // The manager is already initialized above
    console.log('Profile Picture Manager initialized');
}); 