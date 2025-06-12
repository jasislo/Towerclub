// This script assumes you have a PayPal button rendered with the PayPal JS SDK

paypal.Buttons({
    createOrder: function(data, actions) {
        // Set up the transaction
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '11.95' // Set your amount here
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        // Capture the funds from the transaction
        return actions.order.capture().then(function(details) {
            // Payment successful, redirect back to pay.html
            window.location.href = "PAY.HTML";
        });
    },
    onCancel: function (data) {
        // Optional: handle cancel
        window.location.href = "PAY.HTML";
    }
}).render('#paypal-button-container'); // Make sure your button container has this ID