const express = require('express');
const router = express.Router();

// Calculate referral commission based on plan and referral level
function calculateCommission(planPrice, level = 1) {
    // Base commission rate
    let rate = 0.1; // 10% for first level referrals
    
    // Adjust rate based on referral level (for multi-level referrals)
    if (level === 2) rate = 0.05; // 5% for second level
    if (level === 3) rate = 0.025; // 2.5% for third level
    
    // Calculate commission amount
    return planPrice * rate;
}

// Dummy validation function - in a real app, this would query your database
async function validateReferralCode(code) {
    // Check if it's a username-based code
    if (code.startsWith('USER_')) {
        const username = code.substring(5); // Extract username after 'USER_'
        
        // In a real app, you would:
        // 1. Check if this username exists
        // 2. Verify the user is eligible to refer others
        // For this example, we'll accept any username longer than 3 characters
        return { 
            isValid: username.length >= 3,
            type: 'username',
            referrer: username
        };
    }
    
    // For regular referral codes
    // Replace with your real validation logic that checks against your database
    const validCodes = ['TOWER123', 'WELCOME25', 'VIP2025'];
    return { 
        isValid: validCodes.includes(code),
        type: 'code',
        referrer: null
    };
}

// Apply a referral code
router.post('/apply', async (req, res) => {
    const { referralCode } = req.body;
    const validation = await validateReferralCode(referralCode);
    
    if (validation.isValid) {
        return res.json({ 
            success: true, 
            message: 'Referral code applied successfully!',
            referrerType: validation.type,
            referrer: validation.referrer
        });
    }
    
    res.json({ success: false, message: 'Invalid or expired referral code.' });
});

// Record a successful referral when a payment is made
router.post('/record', async (req, res) => {
    const { referrer, newUser, plan, planAmount } = req.body;
    
    try {
        // Calculate commission based on the plan price
        const commission = calculateCommission(planAmount);
        
        // In a real app, you would:
        // 1. Store the referral in your database
        // 2. Create a pending commission record
        // 3. Update the referrer's stats
        
        console.log(`Recorded referral: ${referrer} referred ${newUser}, earned $${commission.toFixed(2)}`);
        
        // Return success
        res.json({
            success: true,
            message: 'Referral recorded successfully',
            commission: commission.toFixed(2)
        });
    } catch (error) {
        console.error('Error recording referral:', error);
        res.status(500).json({ success: false, message: 'Failed to record referral' });
    }
});

// Get referral stats for a user
router.get('/stats/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        // In a real app, you would query your database for:
        // 1. Number of people referred
        // 2. Total commissions earned
        // 3. Pending commissions
        // 4. Recent referral activity
        
        // For this example, we'll return dummy data
        res.json({
            success: true,
            stats: {
                totalReferred: Math.floor(Math.random() * 20),
                totalEarned: (Math.random() * 500).toFixed(2),
                pendingCommissions: (Math.random() * 100).toFixed(2),
                level: Math.floor(Math.random() * 3) + 1,
                recentActivity: [
                    { user: 'user1', date: new Date(), amount: (Math.random() * 20).toFixed(2) },
                    { user: 'user2', date: new Date(Date.now() - 86400000), amount: (Math.random() * 20).toFixed(2) }
                ]
            }
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch referral stats' });
    }
});

module.exports = router;