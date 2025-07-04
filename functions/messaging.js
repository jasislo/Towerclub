/**
 * TowerClub Messaging API
 * Serverless function to handle messaging operations including sending messages,
 * retrieving conversations, and managing contacts.
 */

const admin = require('firebase-admin');
const { db } = require('../../scripts/firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

/**
 * Sends a message from one user to another
 */
exports.handler = async (event, context) => {
    try {
        // Basic CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        };

        // Handle preflight requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 204,
                headers,
                body: ''
            };
        }

        // Get request path and method
        const path = event.path.replace('/.netlify/functions/messaging', '');
        const method = event.httpMethod;

        // Verify authentication
        let userId = null;
        const authHeader = event.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (error) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }
        } else {
            // For development/demo, allow requests without auth
            // In production, you would uncomment the following return statement
            // return {
            //     statusCode: 401,
            //     headers,
            //     body: JSON.stringify({ error: 'Unauthorized - No token provided' })
            // };
            
            // For demo purposes, use a demo user ID if no auth
            userId = event.queryStringParameters?.userId || 'demo_user_123';
        }

        // API Routes
        if (method === 'GET') {
            // GET /contacts - Get user contacts
            if (path === '/contacts') {
                const contactsRef = db.collection(`users/${userId}/contacts`);
                const snapshot = await contactsRef.get();
                
                const contacts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    contactId: doc.data().userId,
                    name: doc.data().fullName,
                    email: doc.data().email,
                    avatar: doc.data().profilePicture,
                    lastContactedAt: doc.data().lastContactedAt?.toDate()
                }));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(contacts)
                };
            }
            
            // GET /conversations/:contactId - Get conversation with a contact
            else if (path.startsWith('/conversations/')) {
                const contactId = path.split('/')[2];
                if (!contactId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Contact ID is required' })
                    };
                }
                
                // Generate conversation ID (sort user IDs to ensure consistency)
                const conversationId = [userId, contactId].sort().join('_');
                
                const messagesRef = db.collection(`conversations/${conversationId}/messages`);
                const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
                
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    senderId: doc.data().senderId,
                    message: doc.data().message,
                    timestamp: doc.data().timestamp?.toDate() || new Date(),
                    read: doc.data().read || false,
                    messageType: doc.data().messageType || 'text'
                }));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(messages)
                };
            }
            
            // GET /unread - Get count of unread messages
            else if (path === '/unread') {
                // Query all conversations where the user is a participant
                const conversationsRef = db.collection('conversations');
                const conversationsSnapshot = await conversationsRef
                    .where('participants', 'array-contains', userId)
                    .get();
                
                let totalUnread = 0;
                
                // For each conversation, count unread messages
                for (const conversationDoc of conversationsSnapshot.docs) {
                    const conversationId = conversationDoc.id;
                    const messagesRef = db.collection(`conversations/${conversationId}/messages`);
                    const unreadSnapshot = await messagesRef
                        .where('receiverId', '==', userId)
                        .where('read', '==', false)
                        .get();
                    
                    totalUnread += unreadSnapshot.size;
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ count: totalUnread })
                };
            }
        } 
        else if (method === 'POST') {
            // Parse request body
            const requestBody = JSON.parse(event.body);
            
            // POST /contacts - Add a new contact
            if (path === '/contacts') {
                const { fullName, email, profilePicture, contactUserId } = requestBody;
                
                if (!fullName || !contactUserId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Full name and contact user ID are required' })
                    };
                }
                
                // Check if contact already exists
                const contactsRef = db.collection(`users/${userId}/contacts`);
                const existingContact = await contactsRef
                    .where('userId', '==', contactUserId)
                    .get();
                
                if (!existingContact.empty) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Contact already exists' })
                    };
                }
                
                // Add new contact
                const newContact = {
                    userId: contactUserId,
                    fullName,
                    email: email || '',
                    profilePicture: profilePicture || '',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastContactedAt: null
                };
                
                const docRef = await contactsRef.add(newContact);
                
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ id: docRef.id, ...newContact })
                };
            }
            
            // POST /messages - Send a message
            else if (path === '/messages') {
                const { receiverId, message, messageType } = requestBody;
                
                if (!receiverId || !message) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Receiver ID and message are required' })
                    };
                }
                
                // Generate conversation ID
                const conversationId = [userId, receiverId].sort().join('_');
                
                // Add message to the conversation
                const messagesRef = db.collection(`conversations/${conversationId}/messages`);
                const newMessage = {
                    senderId: userId,
                    receiverId,
                    message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                    messageType: messageType || 'text'
                };
                
                const docRef = await messagesRef.add(newMessage);
                
                // Update or create conversation summary
                const conversationRef = db.collection('conversations').doc(conversationId);
                const conversationDoc = await conversationRef.get();
                
                if (conversationDoc.exists) {
                    await conversationRef.update({
                        lastMessage: message,
                        lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                        lastMessageSenderId: userId
                    });
                } else {
                    await conversationRef.set({
                        participants: [userId, receiverId],
                        lastMessage: message,
                        lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                        lastMessageSenderId: userId,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                // Update last contacted timestamp in contacts
                const contactsRef = db.collection(`users/${userId}/contacts`);
                const contactSnapshot = await contactsRef
                    .where('userId', '==', receiverId)
                    .get();
                
                if (!contactSnapshot.empty) {
                    await contactSnapshot.docs[0].ref.update({
                        lastContactedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ id: docRef.id, ...newMessage })
                };
            }
            
            // POST /read - Mark messages as read
            else if (path === '/read') {
                const { contactId } = requestBody;
                
                if (!contactId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Contact ID is required' })
                    };
                }
                
                // Generate conversation ID
                const conversationId = [userId, contactId].sort().join('_');
                
                // Get all unread messages in the conversation
                const messagesRef = db.collection(`conversations/${conversationId}/messages`);
                const unreadSnapshot = await messagesRef
                    .where('receiverId', '==', userId)
                    .where('read', '==', false)
                    .get();
                
                // Mark each message as read
                const batch = db.batch();
                unreadSnapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { read: true });
                });
                
                await batch.commit();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ marked: unreadSnapshot.size })
                };
            }
            
            // POST /groups - Create a group chat
            else if (path === '/groups') {
                const { name, members } = requestBody;
                
                if (!name || !members || !Array.isArray(members) || members.length === 0) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Group name and at least one member are required' })
                    };
                }
                
                // Ensure the current user is included in the members
                const allMembers = new Set([...members, userId]);
                
                // Create group document
                const groupsRef = db.collection('groups');
                const newGroup = {
                    name,
                    members: Array.from(allMembers),
                    createdBy: userId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastMessage: null,
                    lastMessageTimestamp: null,
                    lastMessageSenderId: null
                };
                
                const docRef = await groupsRef.add(newGroup);
                
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ id: docRef.id, ...newGroup })
                };
            }
        }
        
        // Route not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
    } catch (error) {
        console.error('Error in messaging API:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};
