// paypal-auth.js
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const router = express.Router();

// PayPal OAuth credentials
const PAYPAL_CLIENT_ID = 'AfxfDtMQIvo3xh0u2CGcJtlWEjJA4ZflxcCsR1tG2tz4Auhqp32Xogkb3dFYrRteOpPrHpht3SRDcuH1';
const PAYPAL_SECRET = 'YOUR_PAYPAL_SECRET'; // Replace with your actual secret
const PAYPAL_REDIRECT_URI = 'http://localhost:3000/api/paypal/callback'; // Update with your actual domain

// Handle PayPal OAuth callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://api-m.paypal.com/v1/oauth2/token', 
            `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(PAYPAL_REDIRECT_URI)}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // Store tokens in session
        req.session.paypalTokens = {
            access_token,
            refresh_token,
            expiry: Date.now() + (tokenResponse.data.expires_in * 1000)
        };
        
        // Mark user as logged in with PayPal
        req.session.paymentComplete = true;
        
        // Redirect back to crypto dashboard
        res.redirect('/pages/crypto.html');
    } catch (error) {
        console.error('PayPal OAuth error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to authenticate with PayPal' });
    }
});

// Verification endpoint
router.get('/verify', (req, res) => {
    const isLoggedIn = req.session && req.session.paymentComplete === true;
    res.json({ paymentComplete: isLoggedIn });
});

// Logout endpoint
router.get('/logout', (req, res) => {
    if (req.session) {
        delete req.session.paypalTokens;
        req.session.paymentComplete = false;
    }
    res.json({ success: true });
});

module.exports = router;
