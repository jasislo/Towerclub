document.addEventListener('DOMContentLoaded', () => {
    const pinInputs = document.querySelectorAll('.pin-input');
    const verifyButton = document.querySelector('.verify-button');
    const backButton = document.querySelector('.back-button');
    const changeNumberLink = document.querySelector('.change-number');
    const authContainer = document.querySelector('.auth-container');
    const phoneNumberDisplay = document.getElementById('phoneNumberDisplay');

    // Add fade-in animation
    authContainer.classList.add('fade-in');

    // Get phone number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const phoneNumber = urlParams.get('phone');
    
    if (phoneNumber) {
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
    verifyButton.addEventListener('click', () => {
        const code = Array.from(pinInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            pinInputs.forEach(input => {
                input.style.borderColor = 'var(--error-color)';
            });
            return;
        }

        // Here you would typically make an API call to verify the code
        console.log('Verification code submitted:', code);
        // Redirect to profile page
        window.location.href = '/profile.html';
    });

    // Handle back button click
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    // Handle change number link click
    changeNumberLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/auth_phone.html';
    });

    // Remove error styling on input
    pinInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary-color)';
        });

        input.addEventListener('blur', () => {
            if (input.value) {
                input.style.borderColor = 'var(--secondary-background)';
            }
        });
    });
}); 