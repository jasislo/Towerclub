/**
 * Profile Picture API Endpoints
 * Handles all profile picture related API operations
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

/**
 * Upload profile picture
 * POST /api/profile/upload-picture
 */
router.post('/upload-picture', upload.single('profilePicture'), async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Save to database
        const profilePictureData = {
            userId: userId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadDate: new Date(),
            isActive: true
        };

        // Insert into database
        const db = req.app.locals.db;
        const result = await db.collection('profilePictures').insertOne(profilePictureData);

        // Update user profile
        await db.collection('users').updateOne(
            { userId: userId },
            { 
                $set: { 
                    profilePicture: req.file.filename,
                    profilePicturePath: req.file.path,
                    updatedAt: new Date()
                }
            }
        );

        // Get updated user data
        const updatedUser = await db.collection('users').findOne({ userId: userId });

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            filename: req.file.filename,
            user: updatedUser
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

/**
 * Get profile picture
 * GET /api/profile/picture/:userId
 */
router.get('/picture/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = req.app.locals.db;
        const user = await db.collection('users').findOne({ userId: userId });
        
        if (!user || !user.profilePicture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        const picturePath = path.join(__dirname, '../uploads/profile-pictures', user.profilePicture);
        
        // Check if file exists
        try {
            await fs.access(picturePath);
        } catch (error) {
            return res.status(404).json({ error: 'Profile picture file not found' });
        }

        res.json({
            success: true,
            profilePicture: user.profilePicture,
            profilePicturePath: user.profilePicturePath
        });

    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
});

/**
 * Update profile picture
 * PUT /api/profile/update-picture
 */
router.put('/update-picture', async (req, res) => {
    try {
        const { userId, profilePicture, updatedAt } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const db = req.app.locals.db;
        
        // Deactivate old profile picture
        await db.collection('profilePictures').updateMany(
            { userId: userId, isActive: true },
            { $set: { isActive: false, deactivatedAt: new Date() } }
        );

        // Update user profile
        const updateResult = await db.collection('users').updateOne(
            { userId: userId },
            { 
                $set: { 
                    profilePicture: profilePicture,
                    updatedAt: new Date(updatedAt)
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get updated user data
        const updatedUser = await db.collection('users').findOne({ userId: userId });

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
});

/**
 * Delete profile picture
 * DELETE /api/profile/delete-picture
 */
router.delete('/delete-picture', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const db = req.app.locals.db;
        
        // Get current profile picture
        const user = await db.collection('users').findOne({ userId: userId });
        
        if (user && user.profilePicture) {
            // Delete file from filesystem
            const picturePath = path.join(__dirname, '../uploads/profile-pictures', user.profilePicture);
            try {
                await fs.unlink(picturePath);
            } catch (error) {
                console.warn('Could not delete file:', error);
            }
        }

        // Deactivate profile picture in database
        await db.collection('profilePictures').updateMany(
            { userId: userId, isActive: true },
            { $set: { isActive: false, deletedAt: new Date() } }
        );

        // Update user profile
        await db.collection('users').updateOne(
            { userId: userId },
            { 
                $unset: { profilePicture: "", profilePicturePath: "" },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Profile picture deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting profile picture:', error);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
});

/**
 * Get profile picture history
 * GET /api/profile/picture-history/:userId
 */
router.get('/picture-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = req.app.locals.db;
        const history = await db.collection('profilePictures')
            .find({ userId: userId })
            .sort({ uploadDate: -1 })
            .toArray();

        res.json({
            success: true,
            history: history
        });

    } catch (error) {
        console.error('Error fetching picture history:', error);
        res.status(500).json({ error: 'Failed to fetch picture history' });
    }
});

/**
 * Sync profile picture across sessions
 * POST /api/profile/sync-picture
 */
router.post('/sync-picture', async (req, res) => {
    try {
        const { userId, profilePicture, syncTimestamp } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const db = req.app.locals.db;
        
        // Update user's last sync timestamp
        await db.collection('users').updateOne(
            { userId: userId },
            { 
                $set: { 
                    lastPictureSync: new Date(syncTimestamp),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Profile picture synced successfully',
            syncTimestamp: syncTimestamp
        });

    } catch (error) {
        console.error('Error syncing profile picture:', error);
        res.status(500).json({ error: 'Failed to sync profile picture' });
    }
});

module.exports = router; 