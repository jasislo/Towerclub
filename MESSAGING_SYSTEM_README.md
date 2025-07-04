# TowerClub Messaging System Documentation

This document provides an overview of the TowerClub messaging system, how it works, and how to use it.

## Overview

The TowerClub messaging system enables real-time communication between users. It supports:

- One-on-one conversations
- Group chats
- Message notifications
- Read status tracking
- Message search

## Architecture

The messaging system uses a combination of:

1. **Firebase Firestore** for data storage and real-time updates
2. **Netlify Functions** for serverless API endpoints
3. **Firebase Authentication** for secure user identification

## Database Structure

### Firestore Collections

- **users/{userId}/contacts**: User's contacts list
- **conversations/{conversationId}/messages**: Messages in a conversation
- **conversations/{conversationId}**: Conversation metadata
- **groups/{groupId}**: Group chat information
- **users/{userId}/notifications**: User notifications

## Front-end Implementation

The front-end messaging interface consists of:

1. **messaging-service.js**: Core service that handles all messaging operations
2. **Chatssection.html**: Main chat interface

## API Endpoints

The messaging API is implemented as Netlify Functions:

- **GET /api/messaging/contacts**: Get user contacts
- **GET /api/messaging/conversations/{contactId}**: Get conversation messages
- **GET /api/messaging/unread**: Get unread message count
- **POST /api/messaging/contacts**: Add a new contact
- **POST /api/messaging/messages**: Send a message
- **POST /api/messaging/read**: Mark messages as read
- **POST /api/messaging/groups**: Create a group chat

## Setting Up Firebase

To set up Firebase for the messaging system:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Add a Web App to your Firebase project
5. Get your Firebase configuration (apiKey, authDomain, etc.)
6. Create a service account for server-side access
7. Update the environment variables in your Netlify dashboard

## Environment Variables

These environment variables need to be set in your Netlify dashboard:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## Security Rules

Add these Firestore security rules to secure your messaging data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversations can be accessed by participants only
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
                          conversationId.split('_').hasAny([request.auth.uid]);
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants.hasAny([request.auth.uid]);
      }
    }
    
    // Group chats can be accessed by members only
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
                          get(/databases/$(database)/documents/groups/$(groupId)).data.members.hasAny([request.auth.uid]);
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/groups/$(groupId)).data.members.hasAny([request.auth.uid]);
      }
    }
  }
}
```

## Usage Examples

### Adding a Contact

```javascript
// Add a new contact
const newContact = {
  userId: 'user123',
  fullName: 'John Doe',
  email: 'john@example.com',
  profilePicture: '/assets/images/john.jpg'
};

try {
  const contact = await messagingService.addContact(newContact);
  console.log('Contact added:', contact);
} catch (error) {
  console.error('Error adding contact:', error);
}
```

### Sending a Message

```javascript
// Send a message to a contact
try {
  const message = await messagingService.sendMessage('user123', 'Hello there!');
  console.log('Message sent:', message);
} catch (error) {
  console.error('Error sending message:', error);
}
```

### Creating a Group Chat

```javascript
// Create a group chat
try {
  const group = await messagingService.createGroupChat('Project Team', ['user123', 'user456']);
  console.log('Group created:', group);
} catch (error) {
  console.error('Error creating group:', error);
}
```

## Troubleshooting

Common issues and solutions:

1. **Messages not sending**: Check your Firebase configuration and make sure you're authenticated.
2. **Real-time updates not working**: Ensure your Firestore security rules allow access to the collections.
3. **Environment variables not working**: Verify they are correctly set in Netlify dashboard.

## Further Development

Potential enhancements for the messaging system:

1. Media sharing (images, files)
2. Message reactions
3. Message threading
4. Read receipts with timestamps
5. Typing indicators
6. Voice messages
7. Video calls integration
