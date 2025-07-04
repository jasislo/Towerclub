const express = require('express');
const cors = require('cors');
const session = require('express-session');
const referralRoutes = require('./referral');
const paypalAuthRoutes = require('./paypal-auth');

const app = express();
app.use(cors());
app.use(express.json());

// Setup session
app.use(session({
    secret: 'towerclub_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use('/api/referral', referralRoutes);
app.use('/api/paypal', paypalAuthRoutes);

// Verification endpoint for the client to check PayPal login status
app.get('/verify-payment', (req, res) => {
    const paymentComplete = req.session && req.session.paymentComplete === true;
    res.json({ paymentComplete: !!paymentComplete });
});

app.listen(4242, () => console.log('Server running on port 4242'));