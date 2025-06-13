// This script assumes you have a PayPal button rendered with the PayPal JS SDK

// Example: Set the amount dynamically based on the selected plan

// Use a global or shared variable for selectedPlanAmount
let selectedPlanAmount = '11.95'; // Default

// Listen for plan selection and update the amount
document.querySelectorAll('.plan-select-btn, .get-started-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Try to get amount from data-amount or from PAY.js planPrices
        if (this.getAttribute('data-amount')) {
            selectedPlanAmount = this.getAttribute('data-amount');
        } else if (this.getAttribute('data-plan')) {
            // If using PAY.js, get the amount from planPrices
            const plan = this.getAttribute('data-plan');
            if (window.planPrices && window.planPrices[plan]) {
                selectedPlanAmount = window.planPrices[plan].toFixed(2);
            }
        }
    });
});

// PayPal Button integration
paypal.Buttons({
    createOrder: function(data, actions) {
        // Always use the latest selectedPlanAmount
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: selectedPlanAmount
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            window.location.href = "register.html";
        });
    },
    onCancel: function (data) {
        window.location.href = "PAY.HTML";
    },
    onError: function(err) {
        alert('PayPal payment failed. Please try again.');
        window.location.href = "PAY.HTML";
    }
}).render('#paypal-button-container');

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