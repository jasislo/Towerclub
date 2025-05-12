document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const rememberMeCheckbox = document.querySelector('input[name="remember"]');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('.material-icons').textContent = 
            type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Form validation
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // Show error message
    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message') || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF5963';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(errorDiv);
        }
        
        input.style.borderColor = '#FF5963';
    };

    // Clear error message
    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
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

        // Validate all fields
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
        const submitButton = loginForm.querySelector('.auth-button');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = `
            <span class="material-icons" style="animation: spin 1s linear infinite;">sync</span>
            <span>Signing in...</span>
        `;
        submitButton.disabled = true;

        try {
            // Here you would typically make an API call to your backend
            // For now, we'll simulate a successful login
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Store remember me preference
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('email', emailInput.value);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('email');
            }

            // Redirect to dashboard or home page
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Login failed:', error);
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.color = '#FF5963';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.marginTop = '16px';
            loginForm.appendChild(errorDiv);
        } finally {
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Check for remembered email
    if (localStorage.getItem('rememberMe') === 'true') {
        const rememberedEmail = localStorage.getItem('email');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
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