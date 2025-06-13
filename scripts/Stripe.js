// Initialize Stripe
const stripe = Stripe('pk_live_51Q1c9WKxFfFtkJUstOvyWc7Wvvuma7hmZtslUdXcGj4Ri5cVDXET75L0M0Bpvq8BIvDPQdK9pa74i9jWuTHz2Ujw00eADQnvsR');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#cardElement');

document.getElementById('cardPaymentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!selectedPlan || !selectedPlanAmount) {
        alert('Please select a plan before making payment.');
        return;
    }
    const response = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(selectedPlanAmount * 100) })
    });
    const { clientSecret } = await response.json();

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
        return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
        window.paymentSecured = true;
        showPaymentSuccessAndRedirect();
        sessionStorage.setItem('paymentComplete', 'true');
        sessionStorage.setItem('selectedPlan', selectedPlan);
        sessionStorage.setItem('selectedPlanAmount', selectedPlanAmount);
    }
});