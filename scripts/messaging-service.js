// Messaging Service
/**
 * Messaging and Interaction Service
 * Handles user communications, profile interactions, and data sharing
 */

class MessagingService {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('userMessages') || '[]');
        this.contacts = JSON.parse(localStorage.getItem('userContacts') || '[]');
        this.notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        this.transfers = JSON.parse(localStorage.getItem('userTransfers') || '[]');
    }

    /**
     * Send a message to another user
     * @param {string} recipientId - Recipient's user ID
     * @param {string} message - Message content
     * @param {string} type - Message type (text, transfer, profile)
     * @returns {Object} Message result
     */
    sendMessage(recipientId, message, type = 'text') {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const senderId = currentUser.userId || currentUser.id;
            
            if (!senderId) {
                throw new Error('User not authenticated');
            }

            const newMessage = {
                id: Date.now().toString(),
                senderId: senderId,
                recipientId: recipientId,
                message: message,
                type: type,
                timestamp: new Date().toISOString(),
                read: false,
                senderName: currentUser.fullName || currentUser.username || 'User',
                senderAvatar: currentUser.profilePicture || ''
            };

            this.messages.push(newMessage);
            localStorage.setItem('userMessages', JSON.stringify(this.messages));

            // Add to recipient's notifications
            this.addNotification(recipientId, {
                type: 'message',
                title: `New message from ${newMessage.senderName}`,
                message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                timestamp: new Date().toISOString(),
                read: false,
                senderId: senderId
            });

            return {
                success: true,
                message: newMessage,
                messageId: newMessage.id
            };
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get messages for current user
     * @param {string} userId - User ID
     * @returns {Array} User's messages
     */
    getUserMessages(userId) {
        return this.messages.filter(msg => 
            msg.senderId === userId || msg.recipientId === userId
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get conversation between two users
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @returns {Array} Conversation messages
     */
    getConversation(userId1, userId2) {
        return this.messages.filter(msg => 
            (msg.senderId === userId1 && msg.recipientId === userId2) ||
            (msg.senderId === userId2 && msg.recipientId === userId1)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Mark message as read
     * @param {string} messageId - Message ID
     * @returns {boolean} Success status
     */
    markMessageAsRead(messageId) {
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
            message.read = true;
            localStorage.setItem('userMessages', JSON.stringify(this.messages));
            return true;
        }
        return false;
    }

    /**
     * Add a contact
     * @param {Object} contactData - Contact information
     * @returns {Object} Contact result
     */
    addContact(contactData) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = currentUser.userId || currentUser.id;
            
            const newContact = {
                id: contactData.userId || Date.now().toString(),
                userId: userId,
                contactId: contactData.userId,
                name: contactData.fullName || contactData.username,
                email: contactData.email,
                phone: contactData.phone,
                avatar: contactData.profilePicture,
                addedAt: new Date().toISOString(),
                lastInteraction: null
            };

            // Check if contact already exists
            const existingContact = this.contacts.find(c => 
                c.userId === userId && c.contactId === contactData.userId
            );

            if (!existingContact) {
                this.contacts.push(newContact);
                localStorage.setItem('userContacts', JSON.stringify(this.contacts));
            }

            return {
                success: true,
                contact: newContact
            };
        } catch (error) {
            console.error('Error adding contact:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's contacts
     * @param {string} userId - User ID
     * @returns {Array} User's contacts
     */
    getUserContacts(userId) {
        return this.contacts.filter(contact => contact.userId === userId);
    }

    /**
     * Send money transfer message
     * @param {string} recipientId - Recipient's user ID
     * @param {number} amount - Transfer amount
     * @param {string} description - Transfer description
     * @returns {Object} Transfer result
     */
    sendTransferMessage(recipientId, amount, description = '') {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const senderId = currentUser.userId || currentUser.id;
            
            if (!senderId) {
                throw new Error('User not authenticated');
            }

            const transferMessage = {
                id: Date.now().toString(),
                senderId: senderId,
                recipientId: recipientId,
                type: 'transfer',
                amount: amount,
                description: description,
                timestamp: new Date().toISOString(),
                status: 'pending',
                senderName: currentUser.fullName || currentUser.username || 'User',
                senderAvatar: currentUser.profilePicture || ''
            };

            this.transfers.push(transferMessage);
            localStorage.setItem('userTransfers', JSON.stringify(this.transfers));

            // Send message notification
            this.sendMessage(recipientId, 
                `You have received a transfer request for $${amount.toFixed(2)}${description ? ': ' + description : ''}`, 
                'transfer'
            );

            return {
                success: true,
                transfer: transferMessage,
                transferId: transferMessage.id
            };
        } catch (error) {
            console.error('Error sending transfer:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Accept or reject transfer
     * @param {string} transferId - Transfer ID
     * @param {boolean} accept - Whether to accept the transfer
     * @returns {Object} Transfer result
     */
    processTransfer(transferId, accept) {
        try {
            const transfer = this.transfers.find(t => t.id === transferId);
            if (!transfer) {
                throw new Error('Transfer not found');
            }

            transfer.status = accept ? 'completed' : 'rejected';
            transfer.processedAt = new Date().toISOString();

            localStorage.setItem('userTransfers', JSON.stringify(this.transfers));

            // Send response message
            const responseMessage = accept ? 
                `Transfer of $${transfer.amount.toFixed(2)} has been accepted.` :
                `Transfer of $${transfer.amount.toFixed(2)} has been declined.`;

            this.sendMessage(transfer.senderId, responseMessage, 'transfer_response');

            return {
                success: true,
                transfer: transfer,
                status: transfer.status
            };
        } catch (error) {
            console.error('Error processing transfer:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add notification
     * @param {string} userId - User ID
     * @param {Object} notification - Notification data
     */
    addNotification(userId, notification) {
        const userNotifications = this.notifications.filter(n => n.userId === userId);
        userNotifications.push({
            id: Date.now().toString(),
            userId: userId,
            ...notification
        });

        // Keep only last 50 notifications per user
        if (userNotifications.length > 50) {
            userNotifications.splice(0, userNotifications.length - 50);
        }

        this.notifications = this.notifications.filter(n => n.userId !== userId);
        this.notifications.push(...userNotifications);
        localStorage.setItem('userNotifications', JSON.stringify(this.notifications));
    }

    /**
     * Get user notifications
     * @param {string} userId - User ID
     * @returns {Array} User's notifications
     */
    getUserNotifications(userId) {
        return this.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {boolean} Success status
     */
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('userNotifications', JSON.stringify(this.notifications));
            return true;
        }
        return false;
    }

    /**
     * Get unread message count
     * @param {string} userId - User ID
     * @returns {number} Unread message count
     */
    getUnreadMessageCount(userId) {
        return this.messages.filter(msg => 
            msg.recipientId === userId && !msg.read
        ).length;
    }

    /**
     * Get unread notification count
     * @param {string} userId - User ID
     * @returns {number} Unread notification count
     */
    getUnreadNotificationCount(userId) {
        return this.notifications.filter(n => 
            n.userId === userId && !n.read
        ).length;
    }

    /**
     * Search users by name or email
     * @param {string} query - Search query
     * @returns {Array} Matching users
     */
    searchUsers(query) {
        // In a real app, this would search a database
        // For now, we'll search through contacts and mock data
        const allUsers = [
            ...this.contacts,
            // Add some mock users for demonstration
            {
                id: 'user1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: 'user2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
            }
        ];

        return allUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Share profile information
     * @param {string} recipientId - Recipient's user ID
     * @param {Object} profileData - Profile data to share
     * @returns {Object} Share result
     */
    shareProfile(recipientId, profileData) {
        const message = `Profile shared: ${profileData.fullName || profileData.username}`;
        return this.sendMessage(recipientId, message, 'profile_share');
    }

    /**
     * Get user's transfer history
     * @param {string} userId - User ID
     * @returns {Array} Transfer history
     */
    getTransferHistory(userId) {
        return this.transfers.filter(t => 
            t.senderId === userId || t.recipientId === userId
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

// Create and export singleton instance
const messagingService = new MessagingService();
export default messagingService;

// Export individual methods for convenience
export const {
    sendMessage,
    getUserMessages,
    getConversation,
    markMessageAsRead,
    addContact,
    getUserContacts,
    sendTransferMessage,
    processTransfer,
    addNotification,
    getUserNotifications,
    markNotificationAsRead,
    getUnreadMessageCount,
    getUnreadNotificationCount,
    searchUsers,
    shareProfile,
    getTransferHistory
} = messagingService;
