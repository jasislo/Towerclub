document.addEventListener('DOMContentLoaded', () => {
    const pinInputs = document.querySelectorAll('.pin-input');
    const verifyButton = document.querySelector('.verify-button');
    const backButton = document.querySelector('.back-button');
    const changeNumberLink = document.querySelector('.change-number');
    const authContainer = document.querySelector('.auth-container');
    const phoneNumberDisplay = document.getElementById('phoneNumberDisplay');

    // Add fade-in animation
    if (authContainer) {
        authContainer.classList.add('fade-in');
    }

    // Get phone number from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let phoneNumber = urlParams.get('phone');
    if (!phoneNumber) {
        phoneNumber = localStorage.getItem('phone');
    } else {
        localStorage.setItem('phone', phoneNumber);
    }
    
    if (phoneNumber && phoneNumberDisplay) {
        phoneNumberDisplay.textContent = phoneNumber;
    }

    // Handle PIN input
    pinInputs.forEach((input, index) => {
        // Handle input
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                // Move to next input
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            }
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value) {
                // Move to previous input
                if (index > 0) {
                    pinInputs[index - 1].focus();
                }
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 6);
            if (/^\d+$/.test(pastedData)) {
                pastedData.split('').forEach((digit, i) => {
                    if (pinInputs[i]) {
                        pinInputs[i].value = digit;
                    }
                });
                if (pinInputs[pastedData.length]) {
                    pinInputs[pastedData.length].focus();
                }
            }
        });
    });

    // Handle verify button click
    verifyButton.addEventListener('click', async () => {
        const code = Array.from(pinInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            pinInputs.forEach(input => {
                input.style.borderColor = 'var(--error-color)';
            });
            return;
        }

        // Show loading state
        const originalContent = verifyButton.innerHTML;
        verifyButton.innerHTML = `<div class="spinner"></div>`;
        verifyButton.disabled = true;

        try {
            // Import auth API functions
            const { verifyPhone } = await import('./auth-api.js');
            const { getAuthData } = await import('./aut-utils.js');

            const { token } = getAuthData();
            
            if (!token) {
                // If no token, this is a phone-only login
                // For demo purposes, use a static code
                if (code === '123456') {
                    // Create a temporary session for phone login
                    localStorage.setItem('phoneVerified', 'true');
                    localStorage.setItem('phoneLogin', 'true');
                    
                    // Redirect to main page
                    window.location.href = '/pages/mainpage.html';
                } else {
                    throw new Error('Invalid verification code');
                }
            } else {
                // Verify phone for existing user
                const result = await verifyPhone(token, phoneNumber, code);
                
                if (result.success) {
                    // Update user data
                    localStorage.setItem('userData', JSON.stringify(result.user));
                    
                    // Redirect to main page
                    window.location.href = '/pages/mainpage.html';
                } else {
                    throw new Error(result.error || 'Verification failed');
                }
            }
        } catch (error) {
            // Show error
            pinInputs.forEach(input => {
                input.style.borderColor = 'var(--error-color)';
            });
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message || 'Invalid verification code. Please try again.';
            errorMsg.style.color = 'var(--error-color)';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.marginTop = '10px';
            
            // Remove existing error message
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            verifyButton.parentNode.appendChild(errorMsg);
            
            // Remove error message after 3 seconds
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    errorMsg.remove();
                }
            }, 3000);
        } finally {
            // Reset button
            verifyButton.innerHTML = originalContent;
            verifyButton.disabled = false;
        }
    });

    // Handle back button click
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Handle change number link
    if (changeNumberLink) {
        changeNumberLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/pages/auth_phone.html';
        });
    }

    // Handle resend code
    const resendButton = document.querySelector('.resend-button');
    if (resendButton) {
        resendButton.addEventListener('click', async () => {
            resendButton.disabled = true;
            resendButton.textContent = 'Sending...';
            
            try {
                const { sendVerificationCode } = await import('./auth-api.js');
                const result = await sendVerificationCode(phoneNumber);
                
                if (result.success) {
                    resendButton.textContent = 'Code sent!';
                    setTimeout(() => {
                        resendButton.textContent = 'Resend Code';
                        resendButton.disabled = false;
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Failed to send code');
                }
            } catch (error) {
                resendButton.textContent = 'Failed to send';
                setTimeout(() => {
                    resendButton.textContent = 'Resend Code';
                    resendButton.disabled = false;
                }, 3000);
            }
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

    .fade-in {
        animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .error-message {
        color: var(--error-color);
        font-size: 0.85rem;
        text-align: center;
        margin-top: 10px;
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style); 