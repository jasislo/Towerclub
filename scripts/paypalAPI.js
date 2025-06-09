const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

// PayPal API credentials
const PAYPAL_CLIENT_ID = 'AfxfDtMQIvo3xh0u2CGcJtlWEjJA4ZflxcCsR1tG2tz4Auhqp32Xogkb3dFYrRteOpPrHpht3SRDcuH1';
const PAYPAL_SECRET = 'EDx7bP228aExk61SSWhmmtjAfJqEeU6yWBEbfaB8fuVWSmkM8IUfRdh2bdV840Ho8ec-qqqHfDJUfV5n';

// PayPal API base URL
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for live

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
                        value: '10.00', // Replace with dynamic amount
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

<!-- Add PayPal Button -->
<section class="paypal-login">
    <div id="paypal-button-container"></div>
</section>

<script src="https://www.paypal.com/sdk/js?client-id=AfxfDtMQIvo3xh0u2CGcJtlWEjJA4ZflxcCsR1tG2tz4Auhqp32Xogkb3dFYrRteOpPrHpht3SRDcuH1&currency=USD"></script>
<script>
    paypal.Buttons({
        createOrder: async () => {
            const response = await fetch('/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const order = await response.json();
            return order.id; // Use the order ID from the backend
        },
        onApprove: async (data) => {
            const response = await fetch('/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            const capture = await response.json();
            
            // Mark payment as complete in client-side storage
            window.paymentSecured = true;
            sessionStorage.setItem('paymentComplete', 'true');
            
            alert('Payment successful!');
        },
        onError: (err) => {
            console.error(err);
            alert('An error occurred during the transaction.');
        },
    }).render('#paypal-button-container');
</script>