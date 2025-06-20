// User Interaction Dashboard
/**
 * User Interaction Dashboard
 * Provides comprehensive user data sharing, messaging, and service integration
 */

import messagingService from './messaging-service.js';
import userDataManager from './user-data-manager.js';
import accessControl from './access-control.js';

class UserInteractionDashboard {
    constructor() {
        this.currentUser = null;
        this.userStats = {};
        this.activeConnections = [];
        this.realTimeUpdates = new Map();
        this.eventListeners = new Map();
    }

    /**
     * Initialize the dashboard
     */
    async initialize() {
        try {
            // Get current user
            this.currentUser = userDataManager.getCurrentUser();
            
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            // Initialize user stats
            await this.loadUserStats();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Initialize event listeners
            this.setupEventListeners();
            
            console.log('User Interaction Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Error initializing User Interaction Dashboard:', error);
        }
    }

    /**
     * Load user statistics and data
     */
    async loadUserStats() {
        try {
            const userId = this.currentUser.userId || this.currentUser.id;
            
            // Get user messages
            const messages = messagingService.getUserMessages(userId);
            
            // Get user contacts
            const contacts = messagingService.getUserContacts(userId);
            
            // Get transfer history
            const transfers = messagingService.getTransferHistory(userId);
            
            // Get notifications
            const notifications = messagingService.getUserNotifications(userId);
            
            // Calculate stats
            this.userStats = {
                totalMessages: messages.length,
                unreadMessages: messagingService.getUnreadMessageCount(userId),
                totalContacts: contacts.length,
                totalTransfers: transfers.length,
                pendingTransfers: transfers.filter(t => t.status === 'pending').length,
                unreadNotifications: messagingService.getUnreadNotificationCount(userId),
                lastActivity: this.currentUser.lastActivity || new Date().toISOString(),
                memberSince: this.currentUser.memberSince || this.currentUser.registrationDate,
                profileCompleteness: this.calculateProfileCompleteness()
            };

            return this.userStats;
            
        } catch (error) {
            console.error('Error loading user stats:', error);
            return {};
        }
    }

    /**
     * Calculate profile completeness percentage
     */
    calculateProfileCompleteness() {
        const profile = userDataManager.getMemberProfile();
        const onboarding = userDataManager.getOnboardingData();
        
        const requiredFields = [
            'fullName', 'email', 'phone', 'dateOfBirth', 
            'address', 'city', 'state', 'zipCode', 'country'
        ];
        
        let completedFields = 0;
        const allData = { ...profile, ...onboarding };
        
        requiredFields.forEach(field => {
            if (allData[field] && allData[field].toString().trim() !== '') {
                completedFields++;
            }
        });
        
        return Math.round((completedFields / requiredFields.length) * 100);
    }

    /**
     * Set up real-time updates
     */
    setupRealTimeUpdates() {
        // Update user stats every 30 seconds
        setInterval(async () => {
            await this.loadUserStats();
            this.emitEvent('statsUpdated', this.userStats);
        }, 30000);

        // Update session activity
        setInterval(() => {
            accessControl.updateUserSession();
            this.currentUser.lastActivity = new Date().toISOString();
            userDataManager.updateCurrentUser(this.currentUser);
        }, 60000);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for new messages
        this.addEventListener('newMessage', (data) => {
            this.handleNewMessage(data);
        });

        // Listen for transfer updates
        this.addEventListener('transferUpdate', (data) => {
            this.handleTransferUpdate(data);
        });

        // Listen for profile updates
        this.addEventListener('profileUpdate', (data) => {
            this.handleProfileUpdate(data);
        });
    }

    /**
     * Handle new message
     */
    handleNewMessage(data) {
        // Update notification counts
        this.loadUserStats();
        
        // Show notification if enabled
        if (this.shouldShowNotification('message')) {
            this.showNotification('New Message', data.message.substring(0, 50) + '...');
        }
    }

    /**
     * Handle transfer update
     */
    handleTransferUpdate(data) {
        // Update transfer stats
        this.loadUserStats();
        
        // Show notification
        if (this.shouldShowNotification('transfer')) {
            const message = data.status === 'completed' ? 
                `Transfer of $${data.amount} completed` :
                `Transfer of $${data.amount} ${data.status}`;
            this.showNotification('Transfer Update', message);
        }
    }

    /**
     * Handle profile update
     */
    handleProfileUpdate(data) {
        // Update profile completeness
        this.userStats.profileCompleteness = this.calculateProfileCompleteness();
        
        // Emit update event
        this.emitEvent('profileCompletenessUpdated', this.userStats.profileCompleteness);
    }

    /**
     * Send message to user
     */
    async sendMessage(recipientId, message, type = 'text') {
        try {
            const result = messagingService.sendMessage(recipientId, message, type);
            
            if (result.success) {
                // Update stats
                await this.loadUserStats();
                
                // Emit event
                this.emitEvent('messageSent', result.message);
                
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Send money transfer
     */
    async sendTransfer(recipientId, amount, description = '') {
        try {
            const result = messagingService.sendTransferMessage(recipientId, amount, description);
            
            if (result.success) {
                // Update stats
                await this.loadUserStats();
                
                // Emit event
                this.emitEvent('transferSent', result.transfer);
                
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error sending transfer:', error);
            throw error;
        }
    }

    /**
     * Process transfer (accept/reject)
     */
    async processTransfer(transferId, accept) {
        try {
            const result = messagingService.processTransfer(transferId, accept);
            
            if (result.success) {
                // Update stats
                await this.loadUserStats();
                
                // Emit event
                this.emitEvent('transferProcessed', result.transfer);
                
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error processing transfer:', error);
            throw error;
        }
    }

    /**
     * Search users
     */
    searchUsers(query) {
        return messagingService.searchUsers(query);
    }

    /**
     * Add contact
     */
    async addContact(contactData) {
        try {
            const result = messagingService.addContact(contactData);
            
            if (result.success) {
                // Update stats
                await this.loadUserStats();
                
                // Emit event
                this.emitEvent('contactAdded', result.contact);
                
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    }

    /**
     * Share profile
     */
    async shareProfile(recipientId, profileData = null) {
        try {
            const dataToShare = profileData || userDataManager.getMemberProfile();
            const result = messagingService.shareProfile(recipientId, dataToShare);
            
            if (result.success) {
                // Emit event
                this.emitEvent('profileShared', { recipientId, profileData: dataToShare });
                
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error sharing profile:', error);
            throw error;
        }
    }

    /**
     * Get user dashboard data
     */
    getDashboardData() {
        return {
            user: this.currentUser,
            stats: this.userStats,
            recentMessages: this.getRecentMessages(),
            recentTransfers: this.getRecentTransfers(),
            notifications: this.getRecentNotifications(),
            contacts: this.getRecentContacts()
        };
    }

    /**
     * Get recent messages
     */
    getRecentMessages(limit = 5) {
        const userId = this.currentUser.userId || this.currentUser.id;
        const messages = messagingService.getUserMessages(userId);
        return messages.slice(0, limit);
    }

    /**
     * Get recent transfers
     */
    getRecentTransfers(limit = 5) {
        const userId = this.currentUser.userId || this.currentUser.id;
        const transfers = messagingService.getTransferHistory(userId);
        return transfers.slice(0, limit);
    }

    /**
     * Get recent notifications
     */
    getRecentNotifications(limit = 5) {
        const userId = this.currentUser.userId || this.currentUser.id;
        const notifications = messagingService.getUserNotifications(userId);
        return notifications.slice(0, limit);
    }

    /**
     * Get recent contacts
     */
    getRecentContacts(limit = 5) {
        const userId = this.currentUser.userId || this.currentUser.id;
        const contacts = messagingService.getUserContacts(userId);
        return contacts.slice(0, limit);
    }

    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
        // Check if browser supports notifications
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/images/towerclub_logo.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification(title, message, type);
                }
            });
        }
    }

    /**
     * Check if should show notification
     */
    shouldShowNotification(type) {
        const preferences = userDataManager.getUserPreferences();
        return preferences.notifications && preferences.notifications[type] !== false;
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emitEvent(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get user stats
     */
    getUserStats() {
        return this.userStats;
    }

    /**
     * Update user stats
     */
    async updateUserStats() {
        await this.loadUserStats();
        return this.userStats;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user has unread items
     */
    hasUnreadItems() {
        return this.userStats.unreadMessages > 0 || this.userStats.unreadNotifications > 0;
    }

    /**
     * Mark all messages as read
     */
    async markAllMessagesAsRead() {
        try {
            const userId = this.currentUser.userId || this.currentUser.id;
            const messages = messagingService.getUserMessages(userId);
            
            messages.forEach(msg => {
                if (!msg.read && msg.recipientId === userId) {
                    messagingService.markMessageAsRead(msg.id);
                }
            });
            
            // Update stats
            await this.loadUserStats();
            
            // Emit event
            this.emitEvent('allMessagesRead', { userId });
            
        } catch (error) {
            console.error('Error marking all messages as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsAsRead() {
        try {
            const userId = this.currentUser.userId || this.currentUser.id;
            const notifications = messagingService.getUserNotifications(userId);
            
            notifications.forEach(notification => {
                if (!notification.read) {
                    messagingService.markNotificationAsRead(notification.id);
                }
            });
            
            // Update stats
            await this.loadUserStats();
            
            // Emit event
            this.emitEvent('allNotificationsRead', { userId });
            
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
}

// Create and export singleton instance
const userInteractionDashboard = new UserInteractionDashboard();
export default userInteractionDashboard;

// Export individual methods for convenience
export const {
    initialize,
    loadUserStats,
    sendMessage,
    sendTransfer,
    processTransfer,
    searchUsers,
    addContact,
    shareProfile,
    getDashboardData,
    getUserStats,
    updateUserStats,
    getCurrentUser,
    hasUnreadItems,
    markAllMessagesAsRead,
    markAllNotificationsAsRead,
    addEventListener,
    removeEventListener,
    emitEvent
} = userInteractionDashboard;
