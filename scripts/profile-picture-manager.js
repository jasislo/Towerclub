// Profile Picture Manager
import { uploadProfileImage } from './api-service.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

class ProfilePictureManager {
    constructor() {
        this.profilePictureElements = new Set();
        this.auth = getAuth();
        this.db = getFirestore();
        this.initializeEventListeners();
        this.initializeAuthListener();
    }

    // Initialize auth state listener to handle user changes
    initializeAuthListener() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                // Sync profile pictures when auth state changes
                this.syncProfilePictures();
            }
        });
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
            // Add loading state class
            element.classList.add('profile-picture-loading');
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
                                img.classList.add('profile-picture-loading');
                                
                                // Upload to server
                                const imageUrl = await uploadProfileImage(file);
                                
                                // Update all profile pictures
                                await this.updateAllProfilePictures(imageUrl);
                                
                                // Update user profile in Firebase if user is logged in
                                const user = this.auth.currentUser;
                                if (user) {
                                    const userRef = doc(this.db, 'users', user.uid);
                                    await updateDoc(userRef, {
                                        profilePicture: imageUrl,
                                        lastUpdated: new Date().toISOString()
                                    });
                                }
                                
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
                                img.classList.remove('profile-picture-loading');
                            }
                        }
                    });
                }
            });
        });
    }

    // Update all registered profile pictures
    async updateAllProfilePictures(imageUrl) {
        // Update all elements on current page
        this.profilePictureElements.forEach(element => {
            element.src = imageUrl;
            element.classList.remove('profile-picture-loading');
        });

        // Update header profile pictures if they exist
        const headerProfilePictures = document.querySelectorAll('header .profile-picture-container img');
        headerProfilePictures.forEach(img => {
            img.src = imageUrl;
            img.classList.remove('profile-picture-loading');
        });
    }

    // Sync profile pictures on page load
    async syncProfilePictures() {
        const user = this.auth.currentUser;
        if (user) {
            try {
                // Try to get profile picture from Firebase first
                const userRef = doc(this.db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists() && userDoc.data().profilePicture) {
                    const imageUrl = userDoc.data().profilePicture;
                    await this.updateAllProfilePictures(imageUrl);
                    localStorage.setItem('profilePicture', imageUrl);
                } else {
                    // Fallback to localStorage if Firebase doesn't have the image
                    const savedPic = localStorage.getItem('profilePicture');
                    if (savedPic) {
                        await this.updateAllProfilePictures(savedPic);
                    }
                }
            } catch (error) {
                console.error('Error syncing profile pictures:', error);
                // Fallback to localStorage on error
                const savedPic = localStorage.getItem('profilePicture');
                if (savedPic) {
                    await this.updateAllProfilePictures(savedPic);
                }
            }
        } else {
            // If not logged in, use localStorage
            const savedPic = localStorage.getItem('profilePicture');
            if (savedPic) {
                await this.updateAllProfilePictures(savedPic);
            }
        }
    }
}

// Create and export a singleton instance
const profilePictureManager = new ProfilePictureManager();
export default profilePictureManager; 