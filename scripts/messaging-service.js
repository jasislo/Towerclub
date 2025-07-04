/**
 * TowerClub Messaging Service
 * Handles all messaging functionality including user contacts, conversations,
 * sending/receiving messages, and notifications.
 */

import { getAuth } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

class MessagingService {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        this.activeListeners = new Map();
        this.currentUser = null;
        
        // Initialize auth state listener
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
        });
    }

    /**
     * Get the current user's ID
     * @returns {string|null} User ID or null if not logged in
     */
    getCurrentUserId() {
        return this.currentUser?.uid || localStorage.getItem('userId');
    }

    /**
     * Add a contact to the user's contact list
     * @param {Object} contactData - Contact data including userId, fullName, email, profilePicture
     * @returns {Promise<Object>} The added contact
     */
    async addContact(contactData) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            const contactRef = collection(this.db, `users/${userId}/contacts`);
            const contactSnapshot = await getDocs(
                query(contactRef, where('userId', '==', contactData.userId))
            );

            // Check if contact already exists
            if (!contactSnapshot.empty) {
                return contactSnapshot.docs[0].data();
            }

            // Add new contact
            const newContact = {
                userId: contactData.userId,
                fullName: contactData.fullName,
                email: contactData.email,
                profilePicture: contactData.profilePicture,
                createdAt: serverTimestamp(),
                lastContactedAt: null
            };

            const docRef = await addDoc(contactRef, newContact);
            return { id: docRef.id, ...newContact };
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    }

    /**
     * Get all contacts for the current user
     * @returns {Promise<Array>} Array of contacts
     */
    async getUserContacts() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            const contactsRef = collection(this.db, `users/${userId}/contacts`);
            const snapshot = await getDocs(contactsRef);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                contactId: doc.data().userId,
                name: doc.data().fullName,
                email: doc.data().email,
                avatar: doc.data().profilePicture,
                lastContactedAt: doc.data().lastContactedAt
            }));
        } catch (error) {
            console.error('Error getting contacts:', error);
            // Fallback to localStorage for demo purposes
            return this._getLocalContacts();
        }
    }

    /**
     * Get a conversation between the current user and another user
     * @param {string} otherUserId - ID of the other user in the conversation
     * @returns {Promise<Array>} Array of messages in the conversation
     */
    async getConversation(otherUserId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            // Generate a unique conversation ID (combination of both user IDs, alphabetically sorted)
            const conversationId = [userId, otherUserId].sort().join('_');
            
            const messagesRef = collection(this.db, `conversations/${conversationId}/messages`);
            const snapshot = await getDocs(
                query(messagesRef, orderBy('timestamp', 'asc'))
            );
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                senderId: doc.data().senderId,
                message: doc.data().message,
                timestamp: doc.data().timestamp?.toDate() || new Date(),
                read: doc.data().read || false,
                messageType: doc.data().messageType || 'text'
            }));
        } catch (error) {
            console.error('Error getting conversation:', error);
            // Fallback to localStorage for demo purposes
            return this._getLocalConversation(userId, otherUserId);
        }
    }

    /**
     * Send a message to another user
     * @param {string} receiverId - ID of the recipient user
     * @param {string} message - Message content
     * @param {string} messageType - Type of message (text, image, etc.)
     * @returns {Promise<Object>} The sent message
     */
    async sendMessage(receiverId, message, messageType = 'text') {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            // Generate conversation ID
            const conversationId = [userId, receiverId].sort().join('_');
            
            // Add message to the conversation
            const messagesRef = collection(this.db, `conversations/${conversationId}/messages`);
            const newMessage = {
                senderId: userId,
                receiverId: receiverId,
                message: message,
                timestamp: serverTimestamp(),
                read: false,
                messageType: messageType
            };
            
            const docRef = await addDoc(messagesRef, newMessage);
            
            // Update last message in conversation summary
            const conversationRef = doc(this.db, `conversations/${conversationId}`);
            await updateDoc(conversationRef, {
                lastMessage: message,
                lastMessageTimestamp: serverTimestamp(),
                lastMessageSenderId: userId
            }).catch(async (error) => {
                // Create conversation document if it doesn't exist
                if (error.code === 'not-found') {
                    await setDoc(conversationRef, {
                        participants: [userId, receiverId],
                        lastMessage: message,
                        lastMessageTimestamp: serverTimestamp(),
                        lastMessageSenderId: userId,
                        createdAt: serverTimestamp()
                    });
                }
            });
            
            // Update last contacted timestamp in contacts
            const contactRef = collection(this.db, `users/${userId}/contacts`);
            const contactSnapshot = await getDocs(
                query(contactRef, where('userId', '==', receiverId))
            );
            
            if (!contactSnapshot.empty) {
                await updateDoc(doc(contactRef, contactSnapshot.docs[0].id), {
                    lastContactedAt: serverTimestamp()
                });
            }
            
            return { id: docRef.id, ...newMessage };
        } catch (error) {
            console.error('Error sending message:', error);
            // Fallback to localStorage for demo purposes
            return this._sendLocalMessage(userId, receiverId, message, messageType);
        }
    }

    /**
     * Subscribe to real-time updates for a conversation
     * @param {string} otherUserId - ID of the other user in the conversation
     * @param {Function} callback - Callback function to call with updated messages
     * @returns {Function} Unsubscribe function
     */
    subscribeToConversation(otherUserId, callback) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('User not authenticated');

        // Generate conversation ID
        const conversationId = [userId, otherUserId].sort().join('_');
        
        // Create listener key
        const listenerKey = `conversation_${conversationId}`;
        
        // Unsubscribe from any existing listener
        if (this.activeListeners.has(listenerKey)) {
            this.activeListeners.get(listenerKey)();
        }
        
        // Set up new listener
        const messagesRef = collection(this.db, `conversations/${conversationId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                senderId: doc.data().senderId,
                message: doc.data().message,
                timestamp: doc.data().timestamp?.toDate() || new Date(),
                read: doc.data().read || false,
                messageType: doc.data().messageType || 'text'
            }));
            
            callback(messages);
        });
        
        // Store the unsubscribe function
        this.activeListeners.set(listenerKey, unsubscribe);
        
        return unsubscribe;
    }

    /**
     * Get the number of unread messages for the current user
     * @returns {Promise<number>} Number of unread messages
     */
    async getUnreadMessageCount() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) return 0;

            // Query all conversations where the user is a participant
            const conversationsRef = collection(this.db, 'conversations');
            const conversationsSnapshot = await getDocs(
                query(conversationsRef, where('participants', 'array-contains', userId))
            );
            
            let totalUnread = 0;
            
            // For each conversation, count unread messages
            for (const conversationDoc of conversationsSnapshot.docs) {
                const conversationId = conversationDoc.id;
                const messagesRef = collection(this.db, `conversations/${conversationId}/messages`);
                const unreadSnapshot = await getDocs(
                    query(
                        messagesRef, 
                        where('receiverId', '==', userId),
                        where('read', '==', false)
                    )
                );
                
                totalUnread += unreadSnapshot.size;
            }
            
            return totalUnread;
        } catch (error) {
            console.error('Error counting unread messages:', error);
            return 0;
        }
    }

    /**
     * Get the number of unread notifications for the current user
     * @returns {Promise<number>} Number of unread notifications
     */
    async getUnreadNotificationCount() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) return 0;

            const notificationsRef = collection(this.db, `users/${userId}/notifications`);
            const unreadSnapshot = await getDocs(
                query(notificationsRef, where('read', '==', false))
            );
            
            return unreadSnapshot.size;
        } catch (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }
    }

    /**
     * Create a group chat
     * @param {string} name - Name of the group
     * @param {Array} members - Array of user IDs to include in the group
     * @returns {Promise<Object>} The created group
     */
    async createGroupChat(name, members) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');
            
            // Ensure the current user is included in the members
            if (!members.includes(userId)) {
                members.push(userId);
            }
            
            // Create group document
            const groupsRef = collection(this.db, 'groups');
            const newGroup = {
                name,
                members,
                createdBy: userId,
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastMessageTimestamp: null,
                lastMessageSenderId: null
            };
            
            const docRef = await addDoc(groupsRef, newGroup);
            return { id: docRef.id, ...newGroup };
        } catch (error) {
            console.error('Error creating group chat:', error);
            throw error;
        }
    }

    /**
     * Mark all messages in a conversation as read
     * @param {string} otherUserId - ID of the other user in the conversation
     * @returns {Promise<void>}
     */
    async markConversationAsRead(otherUserId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) throw new Error('User not authenticated');

            // Generate conversation ID
            const conversationId = [userId, otherUserId].sort().join('_');
            
            // Get all unread messages sent to the current user
            const messagesRef = collection(this.db, `conversations/${conversationId}/messages`);
            const unreadSnapshot = await getDocs(
                query(
                    messagesRef, 
                    where('receiverId', '==', userId),
                    where('read', '==', false)
                )
            );
            
            // Mark each message as read
            const batch = writeBatch(this.db);
            unreadSnapshot.docs.forEach(docSnapshot => {
                batch.update(doc(messagesRef, docSnapshot.id), { read: true });
            });
            
            await batch.commit();
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }

    // Fallback methods for localStorage (for demo purposes)
    
    _getLocalContacts() {
        try {
            const userId = this.getCurrentUserId();
            const contacts = JSON.parse(localStorage.getItem(`${userId}_contacts`) || '[]');
            return contacts;
        } catch (error) {
            console.error('Error getting local contacts:', error);
            return [];
        }
    }

    _getLocalConversation(userId, otherUserId) {
        try {
            const conversationId = [userId, otherUserId].sort().join('_');
            const messages = JSON.parse(localStorage.getItem(`conversation_${conversationId}`) || '[]');
            return messages;
        } catch (error) {
            console.error('Error getting local conversation:', error);
            return [];
        }
    }

    _sendLocalMessage(userId, receiverId, message, messageType) {
        try {
            const conversationId = [userId, receiverId].sort().join('_');
            const messages = JSON.parse(localStorage.getItem(`conversation_${conversationId}`) || '[]');
            
            const newMessage = {
                id: Date.now().toString(),
                senderId: userId,
                receiverId: receiverId,
                message: message,
                timestamp: new Date(),
                read: false,
                messageType: messageType
            };
            
            messages.push(newMessage);
            localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(messages));
            
            // Update contacts last contacted time
            const contacts = JSON.parse(localStorage.getItem(`${userId}_contacts`) || '[]');
            const contactIndex = contacts.findIndex(c => c.contactId === receiverId);
            
            if (contactIndex >= 0) {
                contacts[contactIndex].lastContactedAt = new Date();
                localStorage.setItem(`${userId}_contacts`, JSON.stringify(contacts));
            }
            
            return newMessage;
        } catch (error) {
            console.error('Error sending local message:', error);
            return null;
        }
    }
    
    // Helper method to seed demo data (for testing)
    seedDemoData() {
        const userId = this.getCurrentUserId() || 'demo_user';
        
        // Sample contacts
        const contacts = [
            {
                id: '1',
                contactId: 'user1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar: 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/finance-app-sample-kugwu4/assets/ijvuhvqbvns6/uiAvatar@2x.png',
                lastContactedAt: new Date()
            },
            {
                id: '2',
                contactId: 'user2',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                lastContactedAt: new Date()
            },
            {
                id: '3',
                contactId: 'user3',
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                lastContactedAt: new Date()
            }
        ];
        
        localStorage.setItem(`${userId}_contacts`, JSON.stringify(contacts));
        
        // Sample conversations
        const conversations = {
            [`${userId}_user1`]: [
                {
                    id: '1',
                    senderId: 'user1',
                    receiverId: userId,
                    message: 'Hey, how are you?',
                    timestamp: new Date(Date.now() - 3600000),
                    read: true,
                    messageType: 'text'
                },
                {
                    id: '2',
                    senderId: userId,
                    receiverId: 'user1',
                    message: "I'm good, thanks! How about you?",
                    timestamp: new Date(Date.now() - 3500000),
                    read: true,
                    messageType: 'text'
                }
            ],
            [`${userId}_user2`]: [
                {
                    id: '1',
                    senderId: 'user2',
                    receiverId: userId,
                    message: "Let's catch up later!",
                    timestamp: new Date(Date.now() - 86400000),
                    read: true,
                    messageType: 'text'
                }
            ],
            [`${userId}_user3`]: [
                {
                    id: '1',
                    senderId: userId,
                    receiverId: 'user3',
                    message: "Did you receive the document I sent?",
                    timestamp: new Date(Date.now() - 172800000),
                    read: true,
                    messageType: 'text'
                },
                {
                    id: '2',
                    senderId: 'user3',
                    receiverId: userId,
                    message: "Got it, thanks!",
                    timestamp: new Date(Date.now() - 172700000),
                    read: true,
                    messageType: 'text'
                }
            ]
        };
        
        Object.entries(conversations).forEach(([key, messages]) => {
            localStorage.setItem(`conversation_${key}`, JSON.stringify(messages));
        });
        
        console.log('Demo data seeded successfully');
    }
}

// Create and export a single instance
const messagingService = new MessagingService();

// Seed demo data if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => messagingService.seedDemoData(), 1000);
}

export default messagingService;
