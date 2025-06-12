// This script assumes you have a PayPal button rendered with the PayPal JS SDK

// Example: Set the amount dynamically based on the selected plan

// Assume you have plan buttons or selectors with data-amount attribute
let selectedPlanAmount = '11.95'; // Default

// Listen for plan selection and update the amount
document.querySelectorAll('.plan-select-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        selectedPlanAmount = this.getAttribute('data-amount');
    });
});

// PayPal Button integration
paypal.Buttons({
    createOrder: function(data, actions) {
        // Set up the transaction
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: selectedPlanAmount // Use the dynamically selected amount
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        // Capture the funds from the transaction
        return actions.order.capture().then(function(details) {
            // Payment successful, redirect to register.html
            window.location.href = "register.html";
        });
    },
    onCancel: function (data) {
        // Optional: handle cancel
        window.location.href = "PAY.HTML";
    },
    onError: function(err) {
        alert('PayPal payment failed. Please try again.');
        window.location.href = "PAY.HTML";
    }
}).render('#paypal-button-container'); // Make sure your button container has this ID

// "Get Started Now" button integration
document.addEventListener('DOMContentLoaded', function() {
    var getStartedBtn = document.querySelector('.btn-primary[data-i18n="nav-get-started"], .btn-primary[data-i18n="hero-start-trial"]');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = "register.html";
        });
    }
});