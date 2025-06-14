// Example Node.js/Express backend endpoint for Stripe Checkout

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_XXXXXXXXXXXXXXXXXXXXXXXX'); // Replace with your Stripe secret key

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TowerClub Membership',
            },
            unit_amount: 1200 * 100, // $1,200 in cents (example)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://yourdomain.com/pages/register.html',
      cancel_url: 'https://yourdomain.com/pages/PAY.HTML',
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

<!-- Example client-side code to redirect to Stripe Checkout -->
<!-- Place this in your PAY.HTML or payment page -->
<script src="https://js.stripe.com/v3/"></script>
<script>
const stripe = Stripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'); // Replace with your Stripe publishable key

document.getElementById('cardPayBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    // Call your backend to create a Checkout Session
    const response = await fetch('/api/create-checkout-session', { method: 'POST' });
    const data = await response.json();
    if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
        alert('Unable to start payment session.');
    }
});
</script>