document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginWithPhoneBtn = document.getElementById('loginWithPhoneBtn');
    const signUpLink = document.querySelector('.auth-footer a[href="register.html"]');

    // Form validation
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    // Show error message
    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF5963';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        input.style.borderColor = '#FF5963';
    };

    // Clear error message
    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.style.borderColor = '';
    };

    // Input validation on blur
    emailInput.addEventListener('blur', () => {
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
        } else {
            clearError(emailInput);
        }
    });

    passwordInput.addEventListener('blur', () => {
        if (!validatePassword(passwordInput.value)) {
            showError(passwordInput, 'Password must be at least 6 characters');
        } else {
            clearError(passwordInput);
        }
    });

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        if (!validatePassword(passwordInput.value)) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }
        if (!isValid) return;

        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = `
            <span class="material-icons" style="animation: spin 1s linear infinite;">sync</span>
            <span>Signing in...</span>
        `;
        submitButton.disabled = true;

        try {
            // Simulate login
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Remember me logic
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('email', emailInput.value);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('email');
            }
            window.location.href = '../index.html';
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.color = '#FF5963';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.marginTop = '16px';
            loginForm.appendChild(errorDiv);
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Check for remembered email/username on page load
    if (localStorage.getItem('rememberMe') === 'true') {
        const rememberedEmail = localStorage.getItem('email');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Save or remove email/username when checkbox is toggled
    rememberMeCheckbox.addEventListener('change', () => {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', emailInput.value);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
        }
    });

    // Redirect to pay.html when "Sign Up" is clicked
    if (signUpLink) {
        signUpLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'pay.html';
        });
    }

    // Redirect to auth_phone.html when "Log in with phone number" is clicked
    if (loginWithPhoneBtn) {
        loginWithPhoneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'auth_phone.html';
        });
    }
});

// Add loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);