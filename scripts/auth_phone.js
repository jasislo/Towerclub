document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneNumber');
    const continueButton = document.querySelector('.continue-button');
    const errorMessage = document.getElementById('errorMessage');
    const backButton = document.querySelector('.back-button');

    // Phone number formatting
    function formatPhoneNumber(value) {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return value;
    }

    // Handle phone input formatting
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });
    }

    // Handle continue button click
    continueButton.addEventListener('click', async () => {
        const phoneNumber = phoneInput.value.replace(/[^\d]/g, '');
        errorMessage.style.display = 'none';
        phoneInput.classList.remove('shake');

        if (phoneNumber.length !== 10) {
            phoneInput.style.borderColor = 'var(--error-color)';
            errorMessage.textContent = 'Please enter a valid 10-digit phone number.';
            errorMessage.style.display = 'block';

            // Add shake animation
            phoneInput.classList.add('shake');

            // Remove shake after animation
            setTimeout(() => {
                phoneInput.classList.remove('shake');
            }, 300);
            return;
        }

        // Show loading spinner on button
        const originalContent = continueButton.innerHTML;
        continueButton.innerHTML = `<div class="spinner"></div>`;
        continueButton.disabled = true;

        try {
            // Import auth API functions
            const { sendVerificationCode } = await import('./auth-api.js');

            // Send verification code
            const result = await sendVerificationCode(phoneNumber);

            if (result.success) {
                // Store phone number for verification
                localStorage.setItem('phone', phoneNumber);
                
                // Show success message
                errorMessage.style.color = 'var(--success-color)';
                errorMessage.textContent = 'Verification code sent!';
                errorMessage.style.display = 'block';

                // Redirect to verification page
                setTimeout(() => {
                    window.location.href = '/pages/auth_verify_phone.html?phone=' + encodeURIComponent(phoneNumber);
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to send verification code');
            }
        } catch (error) {
            errorMessage.style.color = 'var(--error-color)';
            errorMessage.textContent = error.message || 'Failed to send verification code. Please try again.';
            errorMessage.style.display = 'block';
            
            // Reset button
            continueButton.innerHTML = originalContent;
            continueButton.disabled = false;
        }
    });

    // Handle back button click
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/pages/login.html';
        });
    }

    // Remove error styling on input
    phoneInput.addEventListener('focus', () => {
        phoneInput.style.borderColor = 'var(--primary-color)';
        errorMessage.style.display = 'none';
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.replace(/[^\d]/g, '').length === 10) {
            phoneInput.style.borderColor = 'var(--input-border)';
        }
    });

    // Handle "Sign Up" link in footer
    const signUpLink = document.querySelector('.auth-footer a[href="register.html"]');
    if (signUpLink) {
        signUpLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/pages/register.html';
        });
    }
});

// Add loading animation styles
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .shake {
        animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style); 