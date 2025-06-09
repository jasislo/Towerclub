// Track selected plan and payment status
let selectedPlan = null;
let selectedPlanAmount = null;
window.paymentSecured = false;

// Pricing for each plan (must match your pricing section)
const planPrices = {
    "Basic": 11.95,
    "VIP Member": 14.95,
    "Business": 16.95
};

// Membership selection algorithm for "Get Started" buttons
document.querySelectorAll('.get-started-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior and NO redirect
        e.stopPropagation(); // Stop event bubbling

        // Remove "Selected" from all buttons and reset text
        document.querySelectorAll('.get-started-btn').forEach(function(b) {
            b.textContent = 'Get Started';
            b.classList.remove('selected-plan');
            b.style.pointerEvents = 'auto'; // Make all buttons clickable again
        });

        // Set this button as selected
        btn.textContent = 'Selected';
        btn.classList.add('selected-plan');
        selectedPlan = btn.getAttribute('data-plan');
        selectedPlanAmount = planPrices[selectedPlan];
        btn.style.pointerEvents = 'auto'; // Keep selected button clickable
        
        // Store the selected state
        btn.setAttribute('data-selected', 'true');
    });

    // Ensure "Selected" text persists on hover
    btn.addEventListener('mouseenter', function() {
        if (btn.classList.contains('selected-plan') || btn.getAttribute('data-selected') === 'true') {
            btn.textContent = 'Selected';
        } else {
            btn.textContent = 'Get Started';
        }
    });

    btn.addEventListener('mouseleave', function() {
        if (btn.classList.contains('selected-plan') || btn.getAttribute('data-selected') === 'true') {
            btn.textContent = 'Selected';
        } else {
            btn.textContent = 'Get Started';
        }
    });

    // Prevent any default link behavior
    btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
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
    
    // Show success message and enable proceed button
    showPaymentSuccess();
});

// PayPal Payment Button Logic
document.getElementById('paypalButton').addEventListener('click', function () {
    if (!selectedPlan || !selectedPlanAmount) {
        alert('Please select a plan before making payment.');
        return;
    }
    
    // Check if already logged in with PayPal
    const isLoggedInWithPayPal = sessionStorage.getItem('paypalLoggedIn') === 'true';
    
    if (!isLoggedInWithPayPal) {
        // First time login - simulate PayPal login process
        alert('PayPal login simulation: You would be redirected to PayPal to sign in, then return here to complete payment.');
        
        // Mark as logged in with PayPal
        sessionStorage.setItem('paypalLoggedIn', 'true');
        
        // Update button text to show logged in status
        this.textContent = 'Logged with PayPal';
        this.style.backgroundColor = '#22c55e'; // Green background to indicate logged in
        this.style.color = '#ffffff';
        
        // In a real implementation, you would redirect to PayPal like this:
        // window.location.href = "https://www.paypal.com/signin?returnUrl=" + encodeURIComponent(window.location.origin + "/Towerclub%20LLC/Towerclub%20web%20app/pages/PAY.HTML");
    } else {
        // Already logged in - just show payment button
        alert('Already logged in with PayPal. Ready to make payment.');
    }
    
    // Show the Make Payment button after PayPal login
    document.getElementById('makePaypalPayment').style.display = 'block';
    document.getElementById('makePaypalPayment').textContent = `Pay $${selectedPlanAmount.toFixed(2)} with PayPal`;
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
        btn.classList.add('payment-complete');
    });

    // Enable hero section buttons without payment check
    document.querySelectorAll('.hero-actions .btn').forEach(function(btn) {
        if (btn.classList.contains('btn-primary')) {
            btn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'register.html';
            };
        }
        btn.classList.add('payment-complete');
    });

    // Enable pricing card buttons
    document.querySelectorAll('.get-started-btn').forEach(function(btn) {
        btn.onclick = null;
        btn.classList.add('payment-complete');
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
    
    // Check PayPal login status and update button accordingly
    const paypalButton = document.getElementById('paypalButton');
    const isLoggedInWithPayPal = sessionStorage.getItem('paypalLoggedIn') === 'true';
    
    if (paypalButton && isLoggedInWithPayPal) {
        paypalButton.textContent = 'Logged with PayPal';
        paypalButton.style.backgroundColor = '#22c55e'; // Green background to indicate logged in
        paypalButton.style.color = '#ffffff';
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

// Referral Code Form Logic
document.getElementById('referralCodeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const codeInput = document.getElementById('referralCodeInput');
    const message = document.getElementById('referralCodeMessage');
    const code = codeInput.value.trim();

    if (code.length < 3) {
        message.style.display = 'block';
        message.style.color = '#F06A6A';
        message.textContent = 'Please enter a valid referral code.';
        return;
    }

    // Simulate referral code validation (replace with real API call if needed)
    message.style.display = 'block';
    message.style.color = '#22c55e';
    message.textContent = 'Referral code applied!';
    // Optionally: Save code to localStorage/session or send to backend
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