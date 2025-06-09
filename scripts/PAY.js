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
        e.preventDefault(); // Prevent default link behavior

        // Remove "Selected" from all buttons and reset text
        document.querySelectorAll('.get-started-btn').forEach(function(b) {
            b.textContent = 'Get Started';
            b.classList.remove('selected-plan');
        });

        // Set this button as selected
        btn.textContent = 'Selected';
        btn.classList.add('selected-plan');
        selectedPlan = btn.getAttribute('data-plan');
        selectedPlanAmount = planPrices[selectedPlan];

        // Redirect to pay.html if not already there
        if (!window.location.pathname.toLowerCase().includes('pay.html')) {
            window.location.href = 'PAY.HTML';
        } else {
            // Optionally, scroll to payment section if already on pay.html
            document.querySelector('.payment-section').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Payment logic for card
document.getElementById('cardPaymentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!selectedPlan || !selectedPlanAmount) {
        alert(translationManager.getTranslation('payment-select-plan'));
        return;
    }
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVC = document.getElementById('cardCVC').value;
    const cardHolder = document.getElementById('cardHolder').value;

    // Simulate payment processing for the selected plan
    alert(translationManager.getTranslation('payment-processing-payment', { amount: selectedPlanAmount.toFixed(2), plan: selectedPlan, cardHolder: cardHolder, cardEnding: cardNumber.slice(-4) }));
    window.paymentSecured = true;
    
    // Show success message and enable proceed button
    showPaymentSuccess();
});

// PayPal Payment Button Logic
document.getElementById('paypalButton').addEventListener('click', function () {
    // Redirect to PayPal login, then back to pay.html after login
    window.location.href = "https://www.paypal.com/signin?returnUrl=" + encodeURIComponent(window.location.origin + "/Towerclub%20LLC/Towerclub%20web%20app/pages/PAY.HTML");
});

// Make Payment with PayPal button handler
document.getElementById('makePaypalPayment').addEventListener('click', function() {
    if (!selectedPlan || !selectedPlanAmount) {
        alert(translationManager.getTranslation('payment-select-plan'));
        return;
    }
    // Process the payment with the selected plan
    alert(translationManager.getTranslation('payment-processing-paypal-payment', { amount: selectedPlanAmount.toFixed(2), plan: selectedPlan }));
    window.paymentSecured = true;
    
    // Show success message and enable proceed button
    showPaymentSuccess();
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

    // Hero section Get Started button - proceed to register after payment
    const heroGetStarted = document.querySelector('.hero-actions .btn-primary');
    if (heroGetStarted) {
        heroGetStarted.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.paymentSecured) {
                window.location.href = 'register.html';
            } else {
                document.querySelector('.pricing-section').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                alert(translationManager.getTranslation('payment-reminder'));
            }
        });
    }

    // Watch Demo button - scroll to demo section
    const watchDemoBtn = document.querySelector('.hero-actions .btn-outline');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const demoSection = document.getElementById('demo');
            if (demoSection) {
                demoSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
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

    // Enable hero section buttons with payment check
    document.querySelectorAll('.hero-actions .btn').forEach(function(btn) {
        if (btn.classList.contains('btn-primary')) {
            btn.onclick = function(e) {
                e.preventDefault();
                if (window.paymentSecured) {
                    window.location.href = 'register.html';
                } else {
                    document.querySelector('.pricing-section').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    alert(translationManager.getTranslation('payment-reminder'));
                }
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
        <p style="margin-bottom: 15px; font-size: 1.1rem;" data-i18n="payment-success-message">Payment successful! Choose your next step:</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="register.html" class="btn btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 24px; min-width: 180px;" data-i18n="payment-create-account">
                Create Account
            </a>
            <a href="register.html" class="btn btn-outline" style="display: inline-block; text-decoration: none; padding: 12px 24px; min-width: 180px; background: white; color: #22c55e; border: 2px solid white;" data-i18n="payment-proceed-registration">
                Proceed to Registration
            </a>
        </div>
    `;
    document.querySelector('.payment-form').appendChild(successMessage);
    // Apply translations to the new elements
    translationManager.updatePageContent(translationManager.translations);
}