// Profile Picture Manager
import { uploadProfileImage } from './api-service.js';

class ProfilePictureManager {
    constructor() {
        this.profilePictureElements = new Set();
        this.initializeEventListeners();
    }

    // Register a profile picture element to be synced
    registerProfilePicture(element) {
        if (element && element.tagName === 'IMG') {
            this.profilePictureElements.add(element);
            // Set initial image if available
            const savedPic = localStorage.getItem('profilePicture');
            if (savedPic) {
                element.src = savedPic;
            }
        }
    }

    // Initialize event listeners for profile picture uploads
    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Find all profile picture containers
            const containers = document.querySelectorAll('.profile-picture-container');
            containers.forEach(container => {
                const img = container.querySelector('img');
                const input = container.querySelector('input[type="file"]');
                
                if (img && input) {
                    this.registerProfilePicture(img);
                    
                    // Make the image clickable
                    img.addEventListener('click', () => {
                        input.click();
                    });

                    // Handle file selection
                    input.addEventListener('change', async (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            try {
                                // Show loading state
                                img.style.opacity = '0.5';
                                
                                // Upload to server
                                const imageUrl = await uploadProfileImage(file);
                                
                                // Update all profile pictures
                                this.updateAllProfilePictures(imageUrl);
                                
                                // Save to localStorage as backup
                                localStorage.setItem('profilePicture', imageUrl);
                                
                                // Update member profile
                                const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
                                memberProfile.profilePicture = imageUrl;
                                localStorage.setItem('memberProfile', JSON.stringify(memberProfile));
                                
                            } catch (error) {
                                console.error('Error uploading profile picture:', error);
                                alert('Failed to upload profile picture. Please try again.');
                            } finally {
                                // Reset loading state
                                img.style.opacity = '1';
                            }
                        }
                    });
                }
            });
        });
    }

    // Update all registered profile pictures
    updateAllProfilePictures(imageUrl) {
        this.profilePictureElements.forEach(element => {
            element.src = imageUrl;
        });
    }

    // Sync profile pictures on page load
    syncProfilePictures() {
        const savedPic = localStorage.getItem('profilePicture');
        if (savedPic) {
            this.updateAllProfilePictures(savedPic);
        }
    }
}

// Create and export a singleton instance
const profilePictureManager = new ProfilePictureManager();
export default profilePictureManager; 