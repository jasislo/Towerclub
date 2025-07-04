/**
 * Payment Methods Manager with Stripe Integration
 * This file handles the Stripe Elements integration for adding and managing payment methods
 */

// Initialize Stripe
let stripe = null;
let elements = null;
let card = null;
let paymentMethods = [];
let defaultPaymentMethodId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe with your publishable key
    stripe = Stripe('pk_live_51O6cvwHdkQbwbNbSyOfZmxkqUiYlDw0GWnUX1aFqEiRmPQHNPEUmMfPMYdpJHqsBYgqVmIJCYZwnKvlpXGWwUJdc00MRo0eSvg'); // Live Stripe publishable key
    elements = stripe.elements();
    
    // Create the Stripe card Element
    card = elements.create('card', {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Lexend", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    });
    
    // Set up the payment method form if it exists
    const form = document.getElementById('payment-method-form');
    if (form) {
        // Mount the card Element when the form is first shown
        window.showAddPaymentMethodForm = function() {
            document.getElementById('paymentMethodFormContainer').style.display = 'block';
            form.reset();
            
            // We need to mount the card element when the form is shown
            setTimeout(() => {
                try {
                    card.mount('#card-element');
                } catch (e) {
                    console.error("Error mounting card element:", e);
                }
                
                // Handle real-time validation errors
                card.addEventListener('change', function(event) {
                    const displayError = document.getElementById('card-errors');
                    if (displayError) {
                        if (event.error) {
                            displayError.textContent = event.error.message;
                        } else {
                            displayError.textContent = '';
                        }
                    }
                });
            }, 100);
        };

        // Hide the form
        window.hideAddPaymentMethodForm = function() {
            document.getElementById('paymentMethodFormContainer').style.display = 'none';
            try {
                card.unmount();
            } catch (e) {
                console.error("Error unmounting card:", e);
            }
        };
        
        // Handle form submission
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Disable the submit button to prevent multiple clicks
            const submitButton = document.getElementById('submit-payment-method');
            if (submitButton) {
                submitButton.disabled = true;
            }
            
            const cardholderName = document.getElementById('cardholder-name').value;
            const billingAddress = document.getElementById('billing-address').value;
            const makeDefault = document.getElementById('make-default').checked;
            
            // Create a payment method using the card Element
            stripe.createPaymentMethod({
                type: 'card',
                card: card,
                billing_details: {
                    name: cardholderName,
                    address: {
                        line1: billingAddress
                    }
                }
            }).then(function(result) {
                if (result.error) {
                    // Show error to your customer
                    const errorElement = document.getElementById('card-errors');
                    if (errorElement) {
                        errorElement.textContent = result.error.message;
                    }
                    
                    // Re-enable the submit button
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                } else {
                    // Send the payment method ID to your server
                    // In a real implementation, you would send this to your server to attach to a customer
                    // For this demo, we'll just simulate a successful addition
                    
                    // Simulate processing time
                    setTimeout(() => {
                        // Add the new payment method to our array
                        const newPaymentMethod = {
                            id: result.paymentMethod.id,
                            type: result.paymentMethod.card.brand,
                            last4: result.paymentMethod.card.last4,
                            expMonth: result.paymentMethod.card.exp_month,
                            expYear: result.paymentMethod.card.exp_year,
                            isDefault: makeDefault
                        };
                        
                        // If this is set as default, update all other methods
                        if (makeDefault) {
                            paymentMethods.forEach(method => {
                                method.isDefault = false;
                            });
                            defaultPaymentMethodId = newPaymentMethod.id;
                        }
                        
                        paymentMethods.push(newPaymentMethod);
                        
                        // Hide the form
                        hideAddPaymentMethodForm();
                        
                        // Clear form
                        form.reset();
                        card.clear();
                        
                        // Display success message
                        alert('Payment method added successfully!');
                        
                        // Update the payment methods list
                        renderPaymentMethods();
                        
                        // Re-enable the submit button
                        if (submitButton) {
                            submitButton.disabled = false;
                        }
                    }, 1000);
                }
            });
        });
    }
    
    // Load payment methods on page load
    loadPaymentMethods();
});

// Load Payment Methods function
function loadPaymentMethods() {
    const container = document.getElementById('payment-methods-container');
    if (!container) return;
    
    // Show loading indicator
    container.innerHTML = `
        <div class="loading-container" id="loading-payment-methods" style="text-align: center; padding: 20px;">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">Loading payment methods...</p>
        </div>
    `;
    
    // In a real implementation, fetch from the server or Stripe API
    // For now, we'll use the paymentMethods array or create sample data if empty
    setTimeout(() => {
        if (paymentMethods.length === 0) {
            // Sample data for demonstration
            const samplePaymentMethods = [
                {
                    id: 'pm_123456789',
                    type: 'visa',
                    last4: '4242',
                    expMonth: 12,
                    expYear: 2024,
                    isDefault: true
                },
                {
                    id: 'pm_987654321',
                    type: 'mastercard',
                    last4: '8210',
                    expMonth: 10,
                    expYear: 2025,
                    isDefault: false
                }
            ];
            
            paymentMethods = samplePaymentMethods;
            defaultPaymentMethodId = 'pm_123456789';
        }
        
        renderPaymentMethods();
    }, 1000);
}

// Render Payment Methods
function renderPaymentMethods() {
    const container = document.getElementById('payment-methods-container');
    if (!container) return;
    
    if (paymentMethods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>You don't have any payment methods yet.</p>
                <button onclick="showAddPaymentMethodForm()" style="margin-top: 10px; background: linear-gradient(90deg, #22c55e, #a855f7); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Add Payment Method
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    paymentMethods.forEach(method => {
        const cardType = method.type.charAt(0).toUpperCase() + method.type.slice(1);
        const isDefault = method.isDefault || method.id === defaultPaymentMethodId;
        
        html += `
            <div class="payment-method-item" id="payment-method-${method.id}">
                <div class="payment-method-info">
                    <div class="payment-method-icon">
                        <span class="material-icons">${getCardIcon(method.type)}</span>
                    </div>
                    <div class="payment-method-details">
                        <span class="payment-method-name">
                            ${cardType} ${isDefault ? '<span class="default-badge">Default</span>' : ''}
                        </span>
                        <span class="payment-method-number">**** **** **** ${method.last4}</span>
                        <span class="payment-method-expiry">Expires ${method.expMonth.toString().padStart(2, '0')}/${method.expYear.toString().slice(-2)}</span>
                    </div>
                </div>
                <div class="payment-method-actions">
                    ${!isDefault ? `<button class="payment-method-action-btn" onclick="setDefaultPaymentMethod('${method.id}')">
                        <span class="material-icons">star_border</span>
                    </button>` : ''}
                    <button class="payment-method-action-btn" onclick="deletePaymentMethod('${method.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Set Default Payment Method
function setDefaultPaymentMethod(id) {
    // In a real implementation, call your server to update the default payment method
    paymentMethods.forEach(method => {
        method.isDefault = method.id === id;
    });
    
    defaultPaymentMethodId = id;
    
    // Update UI
    renderPaymentMethods();
    
    // Display success message
    alert('Default payment method updated!');
}

// Delete Payment Method
function deletePaymentMethod(id) {
    if (confirm('Are you sure you want to remove this payment method?')) {
        // In a real implementation, call your server to delete the payment method
        paymentMethods = paymentMethods.filter(method => method.id !== id);
        
        // If we deleted the default, set a new default if available
        if (id === defaultPaymentMethodId && paymentMethods.length > 0) {
            defaultPaymentMethodId = paymentMethods[0].id;
            paymentMethods[0].isDefault = true;
        }
        
        // Update UI
        renderPaymentMethods();
        
        // Display success message
        alert('Payment method removed!');
    }
}

// Get Card Icon
function getCardIcon(type) {
    switch (type.toLowerCase()) {
        case 'visa':
            return 'credit_card';
        case 'mastercard':
            return 'credit_card';
        case 'amex':
            return 'credit_card';
        case 'discover':
            return 'credit_card';
        default:
            return 'credit_card';
    }
}

// Get Card Logo URL
function getCardLogoUrl(brand) {
    switch (brand.toLowerCase()) {
        case 'visa':
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';
        case 'mastercard':
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png';
        case 'amex':
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png';
        case 'discover':
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Discover_Card_logo.svg/1280px-Discover_Card_logo.svg.png';
        default:
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';
    }
}
