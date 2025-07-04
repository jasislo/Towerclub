/**
 * TowerClub Follow System
 * Handles following/unfollowing users and maintains follower counts
 */

class FollowSystem {
    constructor() {
        this.followData = this.loadFollowData();
    }

    // Load follow data from localStorage
    loadFollowData() {
        try {
            const data = localStorage.getItem('towerclub_follow_data');
            return data ? JSON.parse(data) : {
                following: {},  // userId -> array of users being followed
                followers: {},  // userId -> array of followers
                counts: {}      // userId -> follower count
            };
        } catch (error) {
            console.error('Error loading follow data:', error);
            return {
                following: {},
                followers: {},
                counts: {}
            };
        }
    }

    // Save follow data to localStorage
    saveFollowData() {
        try {
            localStorage.setItem('towerclub_follow_data', JSON.stringify(this.followData));
        } catch (error) {
            console.error('Error saving follow data:', error);
        }
    }

    // Get current user ID from localStorage or return default
    getCurrentUserId() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return currentUser.userId || currentUser.id || 'current_user';
    }

    // Follow a user
    followUser(targetUserId) {
        const currentUserId = this.getCurrentUserId();
        
        // Don't allow following yourself
        if (currentUserId === targetUserId) {
            console.warn('Cannot follow yourself');
            return false;
        }

        // Initialize arrays if they don't exist
        if (!this.followData.following[currentUserId]) {
            this.followData.following[currentUserId] = [];
        }
        if (!this.followData.followers[targetUserId]) {
            this.followData.followers[targetUserId] = [];
        }
        
        // Check if already following
        if (this.followData.following[currentUserId].includes(targetUserId)) {
            console.warn('Already following this user');
            return false;
        }
        
        // Add to following/followers lists
        this.followData.following[currentUserId].push(targetUserId);
        this.followData.followers[targetUserId].push(currentUserId);
        
        // Update follower count
        if (!this.followData.counts[targetUserId]) {
            this.followData.counts[targetUserId] = 0;
        }
        this.followData.counts[targetUserId]++;
        
        this.saveFollowData();
        return true;
    }
    
    // Unfollow a user
    unfollowUser(targetUserId) {
        const currentUserId = this.getCurrentUserId();
        
        // Check if following arrays exist
        if (!this.followData.following[currentUserId] || !this.followData.followers[targetUserId]) {
            console.warn('Not following this user');
            return false;
        }
        
        // Check if actually following
        const followingIndex = this.followData.following[currentUserId].indexOf(targetUserId);
        if (followingIndex === -1) {
            console.warn('Not following this user');
            return false;
        }
        
        // Remove from following/followers lists
        this.followData.following[currentUserId].splice(followingIndex, 1);
        const followerIndex = this.followData.followers[targetUserId].indexOf(currentUserId);
        if (followerIndex !== -1) {
            this.followData.followers[targetUserId].splice(followerIndex, 1);
        }
        
        // Update follower count
        if (this.followData.counts[targetUserId] && this.followData.counts[targetUserId] > 0) {
            this.followData.counts[targetUserId]--;
        }
        
        this.saveFollowData();
        return true;
    }
    
    // Check if user is following another user
    isFollowing(targetUserId) {
        const currentUserId = this.getCurrentUserId();
        return this.followData.following[currentUserId] && 
               this.followData.following[currentUserId].includes(targetUserId);
    }
    
    // Get follower count for a user
    getFollowerCount(userId) {
        return this.followData.counts[userId] || 0;
    }
    
    // Get all followers for a user
    getFollowers(userId) {
        return this.followData.followers[userId] || [];
    }
    
    // Get all users being followed by a user
    getFollowing(userId) {
        return this.followData.following[userId] || [];
    }
}

// Create and export a single instance
const followSystem = new FollowSystem();

// Legacy support for older code
document.addEventListener('DOMContentLoaded', () => {
    // Get current user from localStorage or session
    const currentUser = JSON.parse(localStorage.getItem('memberProfile') || '{}').username;
    if (!currentUser) return;

    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userCard = btn.closest('.user-card');
            const targetUser = userCard.getAttribute('data-username');
            if (!targetUser || targetUser === currentUser) return;

            // Use the new follow system
            if (followSystem.followUser(targetUser)) {
                btn.textContent = 'Following';
                btn.disabled = true;
            }
        });
    });
});

export default followSystem;