# Profile Picture Sync System

## Overview
The Profile Picture Sync System is a comprehensive solution that handles profile picture uploads, synchronization across all pages in the TowerClub web app, and persistent storage in the database.

## Features

### 🔄 Real-time Synchronization
- Profile pictures sync instantly across all pages when uploaded
- Automatic updates when navigating between pages
- Cross-session synchronization for multiple browser tabs/windows

### 📱 Multi-Platform Support
- Works on all profile picture containers across the app
- Supports header navigation, profile pages, and user cards
- Responsive design for mobile and desktop

### 💾 Database Integration
- Automatic upload to server and database storage
- Version control for profile picture history
- Soft delete functionality to preserve data

### 🖼️ Image Processing
- Automatic image compression for optimal performance
- Support for multiple formats (JPG, PNG, GIF, WebP)
- File size validation and optimization

## How It Works

### 1. File Upload Process
```
User clicks profile picture → File selection → Validation → Compression → 
Local storage → Database upload → Cross-session sync → Success notification
```

### 2. Synchronization Flow
- **Immediate Sync**: Profile picture updates instantly in localStorage
- **Page Sync**: All profile pictures on current page update automatically
- **Cross-Page Sync**: Profile pictures sync when navigating between pages
- **Session Sync**: Updates sync across multiple browser sessions

### 3. Database Storage
- **Profile Pictures Collection**: Stores all uploaded images with metadata
- **User Profiles Collection**: Links users to their active profile picture
- **Session Sync Collection**: Tracks synchronization across sessions

## File Structure

```
scripts/
├── profile-picture-sync.js      # Main sync system
├── profile-picture-manager.js   # Database operations
└── main.js                      # Updated with sync integration

api/
└── profile-picture-api.js       # API endpoints

database/
└── schema/
    └── profile-pictures.js      # Database schemas

styles/
└── header.css                   # Updated header styles
```

## API Endpoints

### Upload Profile Picture
```
POST /api/profile/upload-picture
Content-Type: multipart/form-data
Body: { profilePicture: File, userId: String }
```

### Get Profile Picture
```
GET /api/profile/picture/:userId
Authorization: Bearer <token>
```

### Update Profile Picture
```
PUT /api/profile/update-picture
Content-Type: application/json
Body: { userId: String, profilePicture: String, updatedAt: Date }
```

### Delete Profile Picture
```
DELETE /api/profile/delete-picture
Content-Type: application/json
Body: { userId: String }
```

### Sync Across Sessions
```
POST /api/profile/sync-picture
Content-Type: application/json
Body: { userId: String, profilePicture: String, syncTimestamp: Date }
```

## Database Schema

### Profile Pictures Collection
```javascript
{
  userId: String,           // User identifier
  filename: String,         // Unique filename
  originalName: String,     // Original file name
  filePath: String,         // Server file path
  fileSize: Number,         // File size in bytes
  mimeType: String,         // File MIME type
  uploadDate: Date,         // Upload timestamp
  isActive: Boolean,        // Active status
  metadata: Object,         // Image metadata
  version: Number           // Version number
}
```

### User Profiles Collection
```javascript
{
  userId: String,           // User identifier
  profilePicture: String,   // Active profile picture filename
  profilePicturePath: String, // File path
  lastPictureSync: Date,    // Last sync timestamp
  preferences: Object       // User preferences
}
```

## Usage Examples

### Basic Implementation
```html
<!-- Profile picture container -->
<div class="profile-picture-container">
    <img src="default-avatar.png" alt="Profile Picture">
    <input type="file" accept="image/*" style="display: none;">
</div>
```

### JavaScript Integration
```javascript
// The system auto-initializes on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // ProfilePictureSync is automatically initialized
    console.log('Profile picture sync system ready');
});

// Manual sync if needed
ProfilePictureSync.syncOnPageLoad();
```

### Custom Event Handling
```javascript
// Listen for profile picture updates
document.addEventListener('profilePictureUpdated', (event) => {
    console.log('Profile picture updated:', event.detail);
});
```

## Configuration Options

### File Validation
- **Max File Size**: 10MB
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Auto Compression**: Enabled by default

### Sync Settings
- **Periodic Sync**: Every 30 seconds
- **Cross-Session Sync**: Enabled
- **Local Storage**: Immediate sync

### Database Settings
- **Version Control**: Enabled
- **Soft Delete**: Enabled
- **History Tracking**: Enabled

## Error Handling

### Upload Errors
- File size too large
- Invalid file type
- Network connection issues
- Server errors

### Sync Errors
- Authentication failures
- Database connection issues
- Cross-origin restrictions

### Recovery Mechanisms
- Local storage fallback
- Retry mechanisms
- Graceful degradation

## Security Features

### File Validation
- MIME type checking
- File size limits
- Malware scanning (server-side)

### Authentication
- Bearer token validation
- User ID verification
- Session management

### Data Protection
- Secure file storage
- Access control
- Audit logging

## Performance Optimizations

### Image Processing
- Automatic compression
- Format optimization
- Lazy loading

### Caching
- Local storage caching
- Browser cache utilization
- CDN integration

### Database
- Indexed queries
- Connection pooling
- Query optimization

## Browser Support

### Modern Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Mobile Browsers
- iOS Safari 12+
- Chrome Mobile 60+
- Samsung Internet 8+

## Troubleshooting

### Common Issues

1. **Profile picture not updating**
   - Check browser console for errors
   - Verify file size and format
   - Clear browser cache

2. **Sync not working**
   - Check network connection
   - Verify authentication token
   - Check API endpoint availability

3. **Database errors**
   - Check database connection
   - Verify user permissions
   - Check schema compatibility

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('profilePictureDebug', 'true');
```

## Future Enhancements

### Planned Features
- AI-powered image enhancement
- Social media integration
- Batch upload support
- Advanced image editing

### Performance Improvements
- WebP format optimization
- Progressive image loading
- Advanced caching strategies

### Security Enhancements
- End-to-end encryption
- Advanced malware detection
- Enhanced access controls 