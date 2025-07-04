// PayPal subscription and plan management
// This file contains the mapping of plan names to PayPal plan IDs
// and functions to handle PayPal subscription creation

/**
 * Maps TowerClub plan names to PayPal plan IDs
 * @param {string} planName - The name of the selected plan (Basic, VIP Member, Business)
 * @returns {string} - The corresponding PayPal plan ID
 */
function getPayPalPlanId(planName) {
    // Private mapping of plan names to PayPal plan IDs
    const planMapping = {
        "Basic": "P-17H9335690871034HNBGKHXQ",
        "VIP Member": "P-17H9335690871034HNBGKHXQ", // Replace with actual VIP plan ID
        "Business": "P-17H9335690871034HNBGKHXQ"    // Replace with actual Business plan ID
    };
    
    // Return the matching plan ID or default to Basic plan
    return planMapping[planName] || "P-17H9335690871034HNBGKHXQ";
}

/**
 * Creates a PayPal subscription with the selected plan
 * @param {Object} actions - PayPal actions object
 * @param {string} planName - The name of the selected plan
 * @returns {Promise} - PayPal subscription creation promise
 */
function createPayPalSubscription(actions, planName) {
    // Get the appropriate plan ID
    const planId = getPayPalPlanId(planName);
    
    // Create subscription with the plan ID
    return actions.subscription.create({
        plan_id: planId
    });
}

/**
 * Handles successful PayPal subscription approval
 * @param {Object} data - PayPal transaction data
 * @param {string} planName - Selected plan name
 * @param {number} amount - Plan amount
 * @param {string} referrerUsername - Username of referrer (if any)
 */
function handlePayPalApproval(data, planName, amount, referrerUsername) {
    // Store payment information in session
    sessionStorage.setItem('paymentComplete', 'true');
    sessionStorage.setItem('paymentMethod', 'paypal-subscription');
    sessionStorage.setItem('selectedPlan', planName);
    sessionStorage.setItem('selectedPlanAmount', amount);
    
    // Log referral information if available
    if (referrerUsername) {
        console.log(`User was referred by: ${referrerUsername}`);
    }
    
    // Show success message and redirect
    alert('Subscription successful! Redirecting to registration...');
    window.location.href = 'register.html';
}

/**
 * Handles PayPal errors
 * @param {Object} err - Error object
 */
function handlePayPalError(err) {
    console.error('PayPal Error:', err);
    
    // Clear any previous payment attempt flags
    sessionStorage.removeItem('paymentAttempted');
    
    // Show error message
    alert('There was an error processing your payment. Please try again or choose another payment method.');
    
    // Log detailed error for debugging (would be sent to server in production)
    console.log('Payment error details:', JSON.stringify(err));
}

// Export functions for use in other files
window.paypalPlanManager = {
    getPayPalPlanId,
    createPayPalSubscription,
    handlePayPalApproval,
    handlePayPalError
};
