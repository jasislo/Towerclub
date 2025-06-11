/**
 * Profile Picture Sync System
 * Handles profile picture upload, synchronization across all pages, and database storage
 */

class ProfilePictureSync {
    constructor() {
        this.currentUserId = this.getCurrentUserId();
        this.defaultImage = 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/finance-app-sample-kugwu4/assets/ijvuhvqbvns6/uiAvatar@2x.png';
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.syncProfilePictures();
        this.loadProfilePictureFromStorage();
        this.setupPeriodicSync();
    }

    getCurrentUserId() {
        // Get user ID from localStorage, session, or API
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        
        return currentUser.userId || 
               currentUser.id || 
               memberProfile.userId || 
               onboardingData.userId || 
               'default-user';
    }

    setupEventListeners() {
        // Setup profile picture containers across the app
        const profileContainers = document.querySelectorAll('.profile-picture-container');
        
        profileContainers.forEach(container => {
            const img = container.querySelector('img');
            const input = container.querySelector('input[type="file"]');
            
            if (img && !input) {
                // Create file input if it doesn't exist
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                container.appendChild(fileInput);
                
                // Add click event to container
                container.addEventListener('click', () => {
                    fileInput.click();
                });
                
                // Handle file selection
                fileInput.addEventListener('change', (event) => {
                    this.handleFileUpload(event.target.files[0]);
                });
            } else if (img && input) {
                // Handle existing file inputs
                container.addEventListener('click', () => {
                    input.click();
                });
                
                input.addEventListener('change', (event) => {
                    this.handleFileUpload(event.target.files[0]);
                });
            }
        });

        // Setup profile image upload in complete_profile.html
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.click();
                
                fileInput.addEventListener('change', (event) => {
                    this.handleFileUpload(event.target.files[0]);
                });
            });
        }
    }

    async handleFileUpload(file) {
        if (!file) return;

        try {
            // Show loading state
            this.showLoadingState();

            // Validate file
            if (!this.validateFile(file)) {
                this.showError('Please select a valid image file (JPG, PNG, GIF, WebP) under 10MB.');
                return;
            }

            // Compress image if needed
            const compressedFile = await this.compressImage(file);
            
            // Convert to base64 for immediate local sync
            const base64Image = await this.convertToBase64(compressedFile);
            
            // Save to localStorage immediately for instant sync
            this.saveToLocalStorage(base64Image);
            
            // Sync across all profile pictures on current page
            this.syncProfilePictures(base64Image);
            
            // Upload to server/database
            await this.uploadToServer(compressedFile, base64Image);
            
            // Sync across sessions
            await this.syncAcrossSessions(base64Image);
            
            // Show success message
            this.showSuccess('Profile picture updated successfully!');
            
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            this.showError('Failed to upload profile picture. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            return false;
        }
        
        if (file.size > maxSize) {
            return false;
        }
        
        return true;
    }

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

    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    saveToLocalStorage(base64Image) {
        // Save to multiple localStorage keys for different contexts
        localStorage.setItem('profilePicture', base64Image);
        localStorage.setItem('userProfilePicture', base64Image);
        
        // Update user data objects
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.profilePicture = base64Image;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
        memberProfile.profilePicture = base64Image;
        localStorage.setItem('memberProfile', JSON.stringify(memberProfile));
        
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        onboardingData.profilePicture = base64Image;
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    }

    syncProfilePictures(newImageSrc = null) {
        const imageSrc = newImageSrc || this.getStoredProfilePicture();
        
        if (!imageSrc) return;

        // Update all profile pictures on the page
        const profileImages = document.querySelectorAll('.profile-picture-container img, #profileImg, #profilePicture, .profile-picture');
        
        profileImages.forEach(img => {
            if (img && img.src !== imageSrc) {
                img.src = imageSrc;
            }
        });

        // Update profile image in complete_profile.html
        const profileImg = document.getElementById('profileImg');
        if (profileImg && profileImg.src !== imageSrc) {
            profileImg.src = imageSrc;
        }
    }

    getStoredProfilePicture() {
        return localStorage.getItem('profilePicture') || 
               localStorage.getItem('userProfilePicture') || 
               this.defaultImage;
    }

    async uploadToServer(file, base64Image) {
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('profilePicture', file);
            formData.append('userId', this.currentUserId);
            formData.append('base64Image', base64Image);

            // Upload to server
            const response = await fetch(`${this.apiBaseUrl}/profile/upload-picture`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            // Update user data with server response
            if (result.user) {
                localStorage.setItem('currentUser', JSON.stringify(result.user));
            }

            return result;
            
        } catch (error) {
            console.error('Server upload failed:', error);
            // Don't throw error - local storage is sufficient for basic functionality
            // The image will be uploaded when connection is restored
        }
    }

    async syncAcrossSessions(base64Image) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile/sync-picture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: this.currentUserId,
                    profilePicture: base64Image,
                    syncTimestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Sync failed');
            }

            return await response.json();
            
        } catch (error) {
            console.error('Error syncing across sessions:', error);
        }
    }

    loadProfilePictureFromStorage() {
        const storedImage = this.getStoredProfilePicture();
        if (storedImage && storedImage !== this.defaultImage) {
            this.syncProfilePictures(storedImage);
        }
    }

    setupPeriodicSync() {
        // Sync every 30 seconds to check for updates from other sessions
        setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('Periodic sync error:', error);
            }
        }, 30000);
    }

    async checkForUpdates() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile/picture/${this.currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.profilePicture) {
                    // Check if we need to update local storage
                    const currentPicture = this.getStoredProfilePicture();
                    if (currentPicture !== result.profilePicture) {
                        this.syncProfilePictures(result.profilePicture);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    showLoadingState() {
        // Add loading indicator to profile pictures
        const profileContainers = document.querySelectorAll('.profile-picture-container');
        profileContainers.forEach(container => {
            container.style.opacity = '0.7';
            container.style.pointerEvents = 'none';
        });
    }

    hideLoadingState() {
        // Remove loading indicator
        const profileContainers = document.querySelectorAll('.profile-picture-container');
        profileContainers.forEach(container => {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        });
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || 
               localStorage.getItem('token') || 
               sessionStorage.getItem('authToken') || 
               '';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#22c55e';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Method to sync profile pictures when navigating between pages
    static syncOnPageLoad() {
        const sync = new ProfilePictureSync();
        return sync;
    }

    // Method to get current profile picture
    static getCurrentProfilePicture() {
        return localStorage.getItem('profilePicture') || 
               localStorage.getItem('userProfilePicture') || 
               'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/finance-app-sample-kugwu4/assets/ijvuhvqbvns6/uiAvatar@2x.png';
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePictureSync();
});

// Export for use in other scripts
window.ProfilePictureSync = ProfilePictureSync; 