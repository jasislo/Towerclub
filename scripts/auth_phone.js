document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneNumber');
    const continueButton = document.querySelector('.continue-button');
    const backButton = document.querySelector('.back-button');
    const authContainer = document.querySelector('.auth-container');
    const errorMessage = document.getElementById('errorMessage');

    // Add fade-in animation
    authContainer.classList.add('fade-in');

    // Phone number formatting
    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (phoneNumber.length < 4) return phoneNumber;
        if (phoneNumber.length < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    // Handle phone input
    phoneInput.addEventListener('input', (e) => {
        const formattedNumber = formatPhoneNumber(e.target.value);
        e.target.value = formattedNumber;
    });

    // Handle continue button click
    continueButton.addEventListener('click', () => {
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
        continueButton.innerHTML = `<div class="spinner"></div>`;

        setTimeout(() => {
            console.log('Phone number submitted:', phoneNumber);
            window.location.href = '/auth3-verify-phone.html';
        }, 1000); // simulate delay
    });

    // Handle back button click
    backButton.addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    // Remove error styling on input
    phoneInput.addEventListener('focus', () => {
        phoneInput.style.borderColor = 'var(--primary-color)';
        errorMessage.style.display = 'none';
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.replace(/[^\d]/g, '').length === 10) {
            phoneInput.style.borderColor = 'var(--secondary-background)';
        }
    });
}); 