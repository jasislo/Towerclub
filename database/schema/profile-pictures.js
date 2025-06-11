/**
 * Profile Pictures Database Schema
 * MongoDB schema for profile picture management
 */

const mongoose = require('mongoose');

// Profile Picture Schema
const profilePictureSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    filename: {
        type: String,
        required: true,
        unique: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true,
        enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    uploadDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    deactivatedAt: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },
    metadata: {
        width: Number,
        height: Number,
        compression: {
            type: String,
            enum: ['none', 'lossy', 'lossless'],
            default: 'none'
        },
        quality: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        }
    },
    tags: [{
        type: String
    }],
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// User Profile Schema (updated to include profile picture)
const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    profilePicturePath: {
        type: String,
        default: null
    },
    lastPictureSync: {
        type: Date,
        default: null
    },
    profilePictureHistory: [{
        pictureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProfilePicture'
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: false
        }
    }],
    preferences: {
        autoCompress: {
            type: Boolean,
            default: true
        },
        maxFileSize: {
            type: Number,
            default: 10 * 1024 * 1024 // 10MB
        },
        allowedFormats: [{
            type: String,
            enum: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            default: ['jpeg', 'jpg', 'png', 'gif', 'webp']
        }]
    }
}, {
    timestamps: true
});

// Session Sync Schema (for cross-session synchronization)
const sessionSyncSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    lastSync: {
        type: Date,
        default: Date.now,
        index: true
    },
    deviceInfo: {
        userAgent: String,
        platform: String,
        browser: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
profilePictureSchema.index({ userId: 1, isActive: 1 });
profilePictureSchema.index({ uploadDate: -1 });
profilePictureSchema.index({ userId: 1, uploadDate: -1 });

userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ lastPictureSync: -1 });

sessionSyncSchema.index({ userId: 1, sessionId: 1 });
sessionSyncSchema.index({ lastSync: -1 });

// Virtual for getting active profile picture
profilePictureSchema.virtual('isCurrent').get(function() {
    return this.isActive && !this.deletedAt;
});

// Pre-save middleware to handle versioning
profilePictureSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.version += 1;
    }
    next();
});

// Static method to get active profile picture for user
profilePictureSchema.statics.getActivePicture = function(userId) {
    return this.findOne({ userId: userId, isActive: true, deletedAt: null });
};

// Static method to deactivate all pictures for user
profilePictureSchema.statics.deactivateAllForUser = function(userId) {
    return this.updateMany(
        { userId: userId, isActive: true },
        { 
            $set: { 
                isActive: false, 
                deactivatedAt: new Date() 
            } 
        }
    );
};

// Instance method to deactivate picture
profilePictureSchema.methods.deactivate = function() {
    this.isActive = false;
    this.deactivatedAt = new Date();
    return this.save();
};

// Instance method to soft delete picture
profilePictureSchema.methods.softDelete = function() {
    this.isActive = false;
    this.deletedAt = new Date();
    return this.save();
};

// User Profile methods
userProfileSchema.methods.updateProfilePicture = function(filename, filePath) {
    this.profilePicture = filename;
    this.profilePicturePath = filePath;
    this.lastPictureSync = new Date();
    return this.save();
};

userProfileSchema.methods.removeProfilePicture = function() {
    this.profilePicture = null;
    this.profilePicturePath = null;
    this.lastPictureSync = new Date();
    return this.save();
};

// Session Sync methods
sessionSyncSchema.methods.updateSync = function(profilePicture) {
    this.profilePicture = profilePicture;
    this.lastSync = new Date();
    return this.save();
};

// Create models
const ProfilePicture = mongoose.model('ProfilePicture', profilePictureSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const SessionSync = mongoose.model('SessionSync', sessionSyncSchema);

module.exports = {
    ProfilePicture,
    UserProfile,
    SessionSync,
    schemas: {
        profilePictureSchema,
        userProfileSchema,
        sessionSyncSchema
    }
}; 