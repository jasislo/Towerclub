function verifyUserFlow() {
    const flowComplete = {
        payment: sessionStorage.getItem('paymentComplete') === 'true',
        registration: sessionStorage.getItem('registrationComplete') === 'true',
        onboarding: sessionStorage.getItem('onboardingComplete') === 'true'
    };
    
    // Check for proper flow completion
    if (!flowComplete.payment) {
        window.location.href = 'PAY.HTML';
        return false;
    }
    
    if (!flowComplete.registration) {
        window.location.href = 'register.html';
        return false;
    }
    
    if (!flowComplete.onboarding) {
        window.location.href = 'onboarding.html';
        return false;
    }
    
    return true;
}