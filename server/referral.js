const express = require('express');
const router = express.Router();

// Dummy validation function
async function validateReferralCode(code) {
    // Replace with your real validation logic
    return code === 'TOWER123';
}

router.post('/apply', async (req, res) => {
    const { referralCode } = req.body;
    const isValid = await validateReferralCode(referralCode);
    if (isValid) {
        return res.json({ success: true, message: 'Referral code applied successfully!' });
    }
    res.json({ success: false, message: 'Invalid or expired referral code.' });
});

module.exports = router;