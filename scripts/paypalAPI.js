const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

// PayPal API credentials
const PAYPAL_CLIENT_ID = 'AW5Y3lm_yH0JQwcy00O1YN1O2VtRk_qEjbpWV5yVLcpKMhRNGYyIayxKZd45clIeCqF4joJ7cXWXC5Zj';
const PAYPAL_SECRET = 'ENxRW5htK5pPUFKM4YirHwWqmReEzfwDj9CRSPZN3RamVGVp37J3bro58jpJ90tnXmgB7RppepwkhmJE';
const PAYPAL_API = 'https://api-m.paypal.com'; // Switch to LIVE for real payments

// Payment verification middleware
function verifyPaymentMiddleware(req, res, next) {
    const paymentComplete = req.session && req.session.paymentComplete;
    if (!paymentComplete) {
        return res.status(403).json({ error: 'Payment not completed' });
    }
    next();
}

// Create an order
app.post('/create-order', async (req, res) => {
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        const { data: { access_token } } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const order = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: req.body.amount || '10.00', // Use dynamic amount from frontend
                    },
                },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(order.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating PayPal order');
    }
});

// Capture payment
app.post('/capture-order', async (req, res) => {
    const { orderID } = req.body;

    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        const { data: { access_token } } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const capture = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        // Mark payment as complete in session
        if (req.session) {
            req.session.paymentComplete = true;
        }

        res.json(capture.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error capturing PayPal order');
    }
});

// Payment verification endpoint
app.get('/verify-payment', (req, res) => {
    const paymentComplete = req.session && req.session.paymentComplete;
    res.json({ paymentComplete: !!paymentComplete });
});

app.get('/pages/crypto.html', async (req, res) => {
    const authorizationCode = req.query.code;

    if (authorizationCode) {
        try {
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
            const { data } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, `grant_type=authorization_code&code=${authorizationCode}`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            // Save the access token in a session or database (if needed)
            const accessToken = data.access_token;

            const userInfo = await axios.get(`${PAYPAL_API}/v1/identity/oauth2/userinfo?schema=paypalv1.1`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(userInfo.data);

            // Mark payment as complete
            if (req.session) {
                req.session.paymentComplete = true;
            }

            // Redirect back to crypto.html
            res.redirect('/pages/crypto.html');
        } catch (error) {
            console.error('Error exchanging authorization code:', error);
            res.status(500).send('Error logging in with PayPal');
        }
    } else {
        res.sendFile(path.join(__dirname, 'pages', 'crypto.html')); // Serve the crypto.html file
    }
});

// --- New: Get Crypto Currencies Status from PayPal ---
app.get('/api/crypto-status', async (req, res) => {
    try {
        // Get OAuth2 token
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        const { data: { access_token } } = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Get crypto quotes (status)
        const quotesRes = await axios.get(
            `${PAYPAL_API}/v1/crypto/quotes`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json(quotesRes.data);
    } catch (error) {
        console.error('Error fetching crypto status:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch crypto status' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

