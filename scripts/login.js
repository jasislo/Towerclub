document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginWithPhoneBtn = document.getElementById('loginWithPhoneBtn');
    const signUpLink = document.querySelector('.auth-footer a[href="register.html"]');
    const loginMessage = document.getElementById('loginMessage');

    // Add password visibility toggle feature
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                this.textContent = "visibility";
            } else {
                passwordInput.type = "password";
                this.textContent = "visibility_off";
            }
        });
    }

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

    // Show general message
    const showMessage = (message, type = 'error') => {
        if (loginMessage) {
            loginMessage.textContent = message;
            loginMessage.className = `auth-message ${type}`;
            loginMessage.style.display = 'block';
            
            // Clear message after 5 seconds
            setTimeout(() => {
                loginMessage.style.display = 'none';
            }, 5000);
        }
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

    // Check if user is already logged in
    async function checkAuth() {
        try {
            const { getAuthData } = await import('./aut-utils.js');
            const { checkAuthStatus } = await import('./auth-api.js');
            
            const { token } = getAuthData();
            const authStatus = await checkAuthStatus(token);
            
            if (authStatus.authenticated) {
                window.location.href = '/pages/mainpage.html';  // Redirect to mainpage if already logged in
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

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
            // Import auth API functions
            const { loginUser } = await import('./auth-api.js');
            const { storeAuthData } = await import('./aut-utils.js');

            // Call login API
            const result = await loginUser(emailInput.value, passwordInput.value, rememberMeCheckbox.checked);

            if (result.success) {
                // Store authentication data
                storeAuthData(result.token, result.user, rememberMeCheckbox.checked);

                // Remember me logic
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('email', emailInput.value);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('email');
                }

                showMessage('Login successful! Redirecting to main page...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/mainpage.html';  // Redirect to mainpage.html
                }, 1500);
            } else {
                showMessage(result.error || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            showMessage(error.message || 'An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Check for remembered email on page load
    if (localStorage.getItem('rememberMe') === 'true') {
        const rememberedEmail = localStorage.getItem('email');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Save or remove email when checkbox is toggled
    rememberMeCheckbox.addEventListener('change', () => {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', emailInput.value);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
        }
    });

    // Redirect to registration page when "Sign Up" is clicked
    if (signUpLink) {
        signUpLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/pages/register.html';  // Redirect to register page
        });
    }

    // Handle phone login button
    if (loginWithPhoneBtn) {
        loginWithPhoneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/pages/auth_phone.html';
        });
    }

    // Check authentication status on page load
    checkAuth();
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