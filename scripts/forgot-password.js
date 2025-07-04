document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            showError('Email required!');
            return;
        }

        try {
            // Here you would typically call your authentication service
            // For example: await authManager.resetPassword(email);
            console.log('Reset password requested for:', email);
            
            // Simulate successful submission
            showSuccess('Password reset link sent to your email!');
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            console.error('Error resetting password:', error);
            showError('Error sending reset link. Please try again.');
        }
    });

    // Add input validation
    emailInput.addEventListener('input', () => {
        validateEmail(emailInput);
    });
});

function validateEmail(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        input.setCustomValidity('Email is required');
    } else if (!emailRegex.test(email)) {
        input.setCustomValidity('Please enter a valid email address');
    } else {
        input.setCustomValidity('');
    }
}

function showError(message) {
    // You can implement a more sophisticated error display system
    alert(message);
}

function showSuccess(message) {
    // You can implement a more sophisticated success display system
    alert(message);
} 