// This script assumes you have a PayPal button rendered with the PayPal JS SDK

// Example: Set the amount dynamically based on the selected plan

// Use a global or shared variable for selectedPlanAmount
let selectedPlanAmount = ; // Default

// Replace with your actual plan IDs from the /api/paypal/create-all-plans response
const planIdMap = {
    "Basic": "P-XXXXXXXXXX",      // Replace with your actual PayPal Plan IDs
    "VIP Member": "P-YYYYYYYYYY",
    "Business": "P-ZZZZZZZZZZ"
};

let selectedPlan = "Basic"; // Default

// Listen for plan selection
document.querySelectorAll('.plan-select-btn, .get-started-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.getAttribute('data-plan')) {
            selectedPlan = this.getAttribute('data-plan');
        }
        renderPayPalButton();
    });
});

function renderPayPalButton() {
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';
    paypal.Buttons({
        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
        },
        createSubscription: function(data, actions) {
            return actions.subscription.create({
                plan_id: planIdMap[selectedPlan]
            });
        },
        onApprove: function(data, actions) {
            fetch('/api/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionID: data.subscriptionID, plan: selectedPlan })
            });
            window.location.href = "register.html";
        },
        onCancel: function (data) {
            window.location.href = "PAY.HTML";
        },
        onError: function(err) {
            alert('PayPal payment failed. Please try again.');
            window.location.href = "PAY.HTML";
        }
    }).render('#paypal-button-container');
}

// Initial render
document.addEventListener('DOMContentLoaded', function() {
    renderPayPalButton();
});

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

// Simulate PayPal payment process for the custom button
document.getElementById('makePaypalPayment').addEventListener('click', function (e) {
    // Simulate successful PayPal payment (replace with real logic as needed)
    // After payment, update button behavior
    const paypalBtn = e.target;
    paypalBtn.textContent = 'Get Started Now';
    paypalBtn.onmouseenter = function () {
        paypalBtn.textContent = 'Get Started Now';
    };
    paypalBtn.onmouseleave = function () {
        paypalBtn.textContent = 'Get Started Now';
    };
    paypalBtn.onclick = function (evt) {
        evt.preventDefault();
        window.location.href = 'register.html';
    };
});

<div class="payment-form" id="paypalPaymentFormContainer">
    <!-- PayPal SDK Integration -->
    <div id="paypal-button-container-P-17H9335690871034HNBGKHXQ"></div>
    <script src="https://www.paypal.com/sdk/js?client-id=ASYjr6BK6SQ2hpqkN3DYUHusu_X3hbbxsb82hzf_0ns2I_KWifq8RPMb4hM4iWMNmgszLWNOgp9L2hpa&vault=true&intent=subscription" data-sdk-integration-source="button-factory"></script>
    <script>
      paypal.Buttons({
          style: {
              shape: 'pill',
              color: 'gold',
              layout: 'vertical',
              label: 'paypal'
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              /* Creates the subscription */
              plan_id: 'P-17H9335690871034HNBGKHXQ'
            });
          },
          onApprove: function(data, actions) {
            alert(data.subscriptionID); // You can add optional success message for the subscriber here
          }
      }).render('#paypal-button-container-P-17H9335690871034HNBGKHXQ'); // Renders the PayPal button
    </script>
</div>

<!-- Center the Pay Now with PayPal button -->
<div style="display: flex; justify-content: center; margin: 24px 0;">
  <button class="btn-paypal" id="makePaypalPayment" type="button">Pay Now with PayPal</button>
</div>