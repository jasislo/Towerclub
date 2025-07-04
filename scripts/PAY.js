import React, { useState } from 'react';

function ReferralCodeComponent() {
  const [referralCode, setReferralCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validReferralCode = 'YOUR_VALID_CODE'; // Replace with your actual code

  const handleApplyCode = () => {
    if (referralCode === validReferralCode) {
      setSuccessMessage('Referral code Applied Successfully!');
    } else {
      setSuccessMessage(''); // Optionally handle invalid code
    }
  };

  return (
    <div>
      <input
        type="text"
        value={referralCode}
        onChange={e => setReferralCode(e.target.value)}
        placeholder="Enter referral code"
      />
      <button onClick={handleApplyCode}>Apply code</button>
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </div>
  );
}

export default ReferralCodeComponent;

// Track selected plan and payment status
let selectedPlan = null;
let selectedPlanAmount = null;
window.paymentSecured = false;

// Pricing for each plan (must match your pricing section)
const planPrices = {
    "Basic": 12.95,
    "VIP Member": 14.95,
    "Business": 16.95
};

// Membership selection algorithm for "Get Started" buttons
function scrollToPaymentSection() {
    const paymentSection = document.querySelector('.payment-section');
    if (paymentSection) paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.get-started-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const plan = btn.getAttribute('data-plan');
        if (plan && planPrices[plan]) {
            // Update button states
            document.querySelectorAll('.get-started-btn').forEach(b => {
                if (b !== btn) {
                    b.textContent = 'Get Started';
                    b.classList.remove('selected-plan');
                }
            });
            
            // Set selected state
            btn.textContent = 'Selected';
            btn.classList.add('selected-plan');
            selectedPlan = plan;
            selectedPlanAmount = planPrices[plan];
            btn.setAttribute('data-selected', 'true');
            
            // Scroll and check payment
            scrollToPaymentSection();
            if (!window.paymentSecured && !sessionStorage.getItem('paymentComplete')) {
                alert('Please complete your payment for the selected plan.');
            }
        }
            window.selectedPlan = plan;
            window.selectedPlanAmount = planPrices[plan];
        }
        // Update Pay Now button text
        const makePaypalPayment = document.getElementById('makePaypalPayment');
        if (makePaypalPayment && window.selectedPlanAmount) {
            makePaypalPayment.textContent = `Pay $${window.selectedPlanAmount.toFixed(2)} with PayPal`;
        }
    });
});

// Make Payment with PayPal button handler
document.getElementById('makePaypalPayment').addEventListener('click', function() {
    if (!selectedPlan || !selectedPlanAmount) {
        alert('Please select a plan before making payment.');
        return;
    }
    
    // Process the payment with the selected plan
    alert(`Processing PayPal payment of $${selectedPlanAmount.toFixed(2)} for ${selectedPlan} plan.`);
    window.paymentSecured = true;
    
    // Show success message and enable proceed button
    showPaymentSuccess();
    
    // Store payment status for session
    sessionStorage.setItem('paymentComplete', 'true');
    sessionStorage.setItem('selectedPlan', selectedPlan);
    sessionStorage.setItem('selectedPlanAmount', selectedPlanAmount);

    // --- Add this block to update PayPal button behavior ---
    const makePaypalPayment = document.getElementById('makePaypalPayment');
    if (makePaypalPayment) {
        // Change button text
        makePaypalPayment.textContent = 'Get Started Now';
        // Add hover effect
        makePaypalPayment.addEventListener('mouseenter', function() {
            makePaypalPayment.textContent = 'Get Started Now';
        });
        makePaypalPayment.addEventListener('mouseleave', function() {
            makePaypalPayment.textContent = 'Get Started Now';
        });
        // Redirect to register.html on click
        makePaypalPayment.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        };
    }
    // --- End block ---
});

// Track selected plan and payment status
let selectedPlan = null;
let selectedPlanAmount = null;
window.paymentSecured = false;

// Pricing for each plan (must match your pricing section)
const planPrices = {
    "Basic": 12.95,
    "VIP Member": 14.95,
    "Business": 16.95
};

// Membership selection algorithm for "Get Started" buttons
document.querySelectorAll('.get-started-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        // ...existing code...
        
        // Special handling for Get Started buttons
        document.addEventListener('DOMContentLoaded', function() {
            // Header Get Started button - scroll to pricing section
            const headerGetStarted = document.querySelector('.nav-actions .btn-primary');
            if (headerGetStarted) {
                headerGetStarted.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                        pricingSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        
            // Hero section Get Started Now button - allow direct navigation to register.html
            const heroGetStarted = document.querySelector('.hero-actions .btn-primary');
            if (heroGetStarted) {
                heroGetStarted.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Only allow redirect if payment is complete
                    if (window.paymentSecured || sessionStorage.getItem('paymentComplete') === 'true') {
                        window.location.href = 'register.html';
                    } else {
                        // Optionally, scroll to payment section or show a message
                        document.querySelector('.payment-section').scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        });
        //        e.preventDefault();
        e.stopPropagation();

        // Remove "Selected" from all buttons and reset text
        document.querySelectorAll('.get-started-btn').forEach(function(b) {
            b.classList.remove('selected-plan');
            b.textContent = 'Get Started';
        });

        // Mark this button as selected
        btn.classList.add('selected-plan');
        btn.textContent = 'Selected';

        // Set selected plan and amount (assuming data attributes)
        selectedPlan = btn.getAttribute('data-plan');
        selectedPlanAmount = planPrices[selectedPlan];
    });

    // Show "Selected" on hover if this button is selected
    btn.addEventListener('mouseenter', function() {
        if (btn.classList.contains('selected-plan')) {
            btn.textContent = 'Selected';
        }
    });

    // Restore text on mouse leave
    btn.addEventListener('mouseleave', function() {
        if (btn.classList.contains('selected-plan')) {
            btn.textContent = 'Selected';
        } else {
            btn.textContent = 'Get Started';
        }
    });
});

// Payment logic for card
document.getElementById('cardPaymentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!selectedPlan || !selectedPlanAmount) {
        alert('Please select a plan before making payment.');
        return;
    }
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVC = document.getElementById('cardCVC').value;
    const cardHolder = document.getElementById('cardHolder').value;

    // Simulate payment processing for the selected plan
    alert(`Processing payment of $${selectedPlanAmount.toFixed(2)} for ${selectedPlan} plan. Card ending in ${cardNumber.slice(-4)} under ${cardHolder}.`);
    window.paymentSecured = true;
    
    // Show success message and redirect to register.html
    showPaymentSuccessAndRedirect();
});

// Special handling for Get Started buttons
document.addEventListener('DOMContentLoaded', function() {
    // Header Get Started button - always redirect to pay.html
    const headerGetStarted = document.querySelector('.nav-actions .btn-primary');
    if (headerGetStarted) {
        headerGetStarted.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'PAY.HTML';
        });
    }

    // Hero section Get Started Now button - allow direct navigation to register.html
    const heroGetStarted = document.querySelector('.hero-actions .btn-primary');
    if (heroGetStarted) {
        heroGetStarted.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    // Allow all links to register.html without payment requirement
    document.querySelectorAll('a[href="register.html"], a[href="./register.html"], a[href="../pages/register.html"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Allow navigation without any restrictions
            // No prevention of default behavior
        });
    });
});

// Update the enableProceedButtons function to handle different button behaviors
function enableProceedButtons() {
    // Enable header buttons but keep their special behavior
    document.querySelectorAll('.nav-actions .btn-primary, .nav-actions .btn-outline').forEach(function(btn) {
        if (btn.classList.contains('btn-primary')) {
            // Keep the header Get Started button behavior
            btn.onclick = function(e) {
                e.preventDefault();
                document.querySelector('.pricing-section').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            };
        }
    });

    // Enable hero section buttons without payment check
    document.querySelectorAll('.hero-actions .btn').forEach(function(btn) {
        if (btn.classList.contains('btn-primary')) {
            btn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'register.html';
            };
        }
    });

    // Enable pricing card buttons
    document.querySelectorAll('.get-started-btn').forEach(function(btn) {
        btn.onclick = null;
    });

    // Store payment status
    sessionStorage.setItem('paymentComplete', 'true');
}

// Remove any existing click handlers that might interfere
document.querySelectorAll('.btn-primary, .btn-outline').forEach(function(btn) {
    if (!btn.closest('.nav-actions') && !btn.closest('.hero-actions')) {
        btn.onclick = null;
    }
});

// Check for existing payment on page load
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('paymentComplete') === 'true') {
        window.paymentSecured = true;
        enableProceedButtons();
    }
    
    // Restore selected plan if returning from PayPal
    const savedPlan = sessionStorage.getItem('selectedPlan');
    const savedAmount = sessionStorage.getItem('selectedPlanAmount');
    if (savedPlan && savedAmount) {
        selectedPlan = savedPlan;
        selectedPlanAmount = parseFloat(savedAmount);
        
        // Update the button to show selected state
        const selectedButton = document.querySelector(`[data-plan="${savedPlan}"]`);
        if (selectedButton) {
            selectedButton.textContent = 'Selected';
            selectedButton.classList.add('selected-plan');
            selectedButton.setAttribute('data-selected', 'true');
        }
        
        // Show PayPal payment button if payment not completed
        if (!window.paymentSecured) {
            const makePaypalPayment = document.getElementById('makePaypalPayment');
            if (makePaypalPayment) {
                makePaypalPayment.style.display = 'block';
                makePaypalPayment.textContent = `Pay $${selectedPlanAmount.toFixed(2)} with PayPal`;
            }
        }
    }
    
    // Check if returning from PayPal (you can add URL parameters to detect this)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paypal_return') === 'true') {
        // User returned from PayPal, show payment button
        const makePaypalPayment = document.getElementById('makePaypalPayment');
        if (makePaypalPayment && selectedPlan) {
            makePaypalPayment.style.display = 'block';
            makePaypalPayment.textContent = `Pay $${selectedPlanAmount.toFixed(2)} with PayPal`;
        }
    }
});

// Payment Option Show/Hide Logic (matches onboarding.html)
document.addEventListener('DOMContentLoaded', function() {
    const creditCardOption = document.getElementById('creditCardOption');
    const paypalOption = document.getElementById('paypalOption');
    const cardForm = document.getElementById('cardPaymentFormContainer');
    const paypalForm = document.getElementById('paypalPaymentFormContainer');
    const paypalButton = document.getElementById('paypalButton');

    if (creditCardOption && cardForm && paypalForm) {
        creditCardOption.addEventListener('click', function() {
            cardForm.style.display = 'block';
            paypalForm.style.display = 'none';
            creditCardOption.classList.add('active');
            paypalOption.classList.remove('active');
        });
    }

    if (paypalOption && cardForm && paypalForm) {
        paypalOption.addEventListener('click', function() {
            cardForm.style.display = 'none';
            paypalForm.style.display = 'block';
            paypalOption.classList.add('active');
            creditCardOption.classList.remove('active');
        });
    }
});

// Referral Code Form Logic is now implemented in PAY.HTML
// This section is commented out to avoid conflicts

/*
document.getElementById('referralCodeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const codeInput = document.getElementById('referralCodeInput');
    const message = document.getElementById('referralCodeMessage');
    const referralCode = codeInput.value.trim();

    // Call backend API to validate and apply referral code
    try {
        const response = await fetch('/api/referral/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            message.textContent = 'Referral code Applied Successfully!';
            message.style.color = 'green';
            message.style.display = 'inline';
            sessionStorage.setItem('referralCode', referralCode);
            // Optionally: handle free months or other rewards here
        } else {
            message.textContent = data.message || 'Invalid referral code. Please try again.';
            message.style.color = 'red';
            message.style.display = 'inline';
        }
    } catch (err) {
        message.textContent = 'Error validating code. Please try again.';
        message.style.color = 'red';
        message.style.display = 'inline';
    }
});
*/
        }
    } catch (err) {
        message.textContent = 'Error validating referral code. Please try again.';
        message.style.color = 'red';
        message.style.display = 'inline';
    }
});

// Update payment success messages with translations
function showPaymentSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'payment-success';
    successMessage.style.cssText = 'background-color: #22c55e; color: white; padding: 20px; border-radius: 5px; margin-top: 15px; text-align: center;';
    successMessage.innerHTML = `
        <p style="margin-bottom: 15px; font-size: 1.1rem;">Payment successful! Choose your next step:</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="register.html" class="btn btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 24px; min-width: 180px;">
                Create Account
            </a>
            <a href="register.html" class="btn btn-outline" style="display: inline-block; text-decoration: none; padding: 12px 24px; min-width: 180px; background: white; color: #22c55e; border: 2px solid white;">
                Proceed to Registration
            </a>
        </div>
    `;
    document.querySelector('.payment-form').appendChild(successMessage);
}

// Add payment verification function
function verifyPaymentStatus() {
    return window.paymentSecured || sessionStorage.getItem('paymentComplete') === 'true';
}

// Remove payment requirement for register.html links
document.addEventListener('DOMContentLoaded', function() {
    // Allow all links to register.html without payment requirement
    document.querySelectorAll('a[href="register.html"], a[href="./register.html"], a[href="../pages/register.html"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Allow navigation without any restrictions
            // No prevention of default behavior
        });
    });
});

// --- STRIPE INTEGRATION START ---

// Initialize Stripe
const stripe = Stripe('pk_live_51Q1c9WKxFfFtkJUstOvyWc7Wvvuma7hmZtslUdXcGj4Ri5cVDXET75L0M0Bpvq8BIvDPQdK9pa74i9jWuTHz2Ujw00eADQnvsR');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#cardElement'); // Make sure your HTML has <div id="cardElement"></div>

// Handle card form submission
document.getElementById('cardPaymentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!selectedPlan || !selectedPlanAmount) {
        alert('Please select a plan before making payment.');
        return;
    }

    // Optionally, disable the button to prevent multiple clicks
    const submitBtn = document.querySelector('#cardPaymentForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Call your backend to create a PaymentIntent and get its client_secret
    const response = await fetch('http://localhost:4242/create-payment-intent', { // <-- Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(selectedPlanAmount * 100) }) // amount in cents
    });
    const { clientSecret } = await response.json();

    // Confirm the card payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElement,
            billing_details: {
                name: document.getElementById('cardHolder').value
            }
        }
    });

    if (error) {
        alert(error.message);
        if (submitBtn) submitBtn.disabled = false;
        return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
        window.paymentSecured = true;
        showPaymentSuccess();
        sessionStorage.setItem('paymentComplete', 'true');
        sessionStorage.setItem('selectedPlan', selectedPlan);
        sessionStorage.setItem('selectedPlanAmount', selectedPlanAmount);
    }
    if (submitBtn) submitBtn.disabled = false;
});

// --- STRIPE INTEGRATION END ---

const express = require('express');
/* 
// Server-side code that should be moved to a proper server file
// This code should not be in a frontend JavaScript file
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
// SECURITY ISSUE: Secret key should NEVER be in frontend code
// const stripe = Stripe('sk_live_YOUR_SECRET_KEY'); 

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4242, () => console.log('Server running on port 4242'));

const express = require('express');
const router = express.Router();
// Assume you have a User model for your database
const User = require('./models/User');
*/

router.post('/api/referral/apply', async (req, res) => {
    const { referralCode } = req.body;
    try {
        // Check if referralCode exists for any user in the database
        const user = await User.findOne({ referralCode });
        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;

// Function to scroll to payment section
function scrollToPaymentSection() {
    document.querySelector('.payment-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Handle all "Get Started" button clicks
function handleGetStartedClick(e) {
    e.preventDefault();
    scrollToPaymentSection();
    if (!window.paymentSecured && !sessionStorage.getItem('paymentComplete')) {
        alert('Please complete your payment before proceeding to registration.');
    }
}

// Add click handlers when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Header Get Started button
    const headerGetStarted = document.querySelector('.nav-actions .btn-primary');
    if (headerGetStarted) {
        headerGetStarted.addEventListener('click', handleGetStartedClick);
    }

    // Hero section Get Started Now button
    const heroGetStarted = document.querySelector('.hero-actions .btn-primary');
    if (heroGetStarted) {
        heroGetStarted.addEventListener('click', handleGetStartedClick);
    }

    // Plan selection Get Started buttons
    document.querySelectorAll('.get-started-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove "Selected" from all buttons
            document.querySelectorAll('.get-started-btn').forEach(b => {
                b.textContent = 'Get Started';
                b.classList.remove('selected-plan');
            });

            // Set this button as selected
            btn.textContent = 'Selected';
            btn.classList.add('selected-plan');
            selectedPlan = btn.getAttribute('data-plan');
            selectedPlanAmount = planPrices[selectedPlan];
            
            // Store the selected state
            btn.setAttribute('data-selected', 'true');
            
            // Scroll to payment section
            scrollToPaymentSection();
            
            // Show message if payment not completed
            if (!window.paymentSecured && !sessionStorage.getItem('paymentComplete')) {
                alert('Please complete your payment for the selected plan.');
            }
        });
    });
});
