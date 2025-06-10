<!-- Add this script before the closing </body> tag to handle password recovery via email -->
<script>
// Password recovery functionality for forgot password form

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Remove previous feedback message
        let msg = document.getElementById('forgot-msg');
        if (msg) msg.remove();

        const email = emailInput.value.trim();
        const submitBtn = forgotPasswordForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Basic email validation
        if (!email) {
            showFeedback('Email is required!', false, forgotPasswordForm);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
            return;
        }

        try {
            // Replace with your real API endpoint
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                showFeedback('If this email is registered, a reset link has been sent.', true, forgotPasswordForm);
            } else {
                showFeedback('There was a problem sending the reset link. Please try again.', false, forgotPasswordForm);
            }
        } catch (error) {
            showFeedback('Network error. Please try again.', false, forgotPasswordForm);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
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

function showFeedback(message, success, form) {
    let msg = document.createElement('p');
    msg.id = 'forgot-msg';
    msg.style.marginTop = '20px';
    msg.style.color = success ? '#22c55e' : '#e11d48';
    msg.textContent = message;
    form.appendChild(msg);
}
</script>