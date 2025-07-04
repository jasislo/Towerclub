document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Handle password visibility toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('.material-icons');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    // Handle form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Handle phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('input[name="remember"]').checked;

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        // This would typically be an API call
        const response = await mockLoginAPI(email, password);
        
        if (response.success) {
            // Store auth token if remember is checked
            if (remember) {
                localStorage.setItem('authToken', response.token);
            } else {
                sessionStorage.setItem('authToken', response.token);
            }

            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            showError(form, response.message);
        }
    } catch (error) {
        showError(form, 'An error occurred. Please try again.');
    } finally {
        // Remove loading state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const fullName = form.querySelector('#fullName').value;
    const email = form.querySelector('#email').value;
    const phone = form.querySelector('#phone').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const terms = form.querySelector('input[name="terms"]').checked;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError(form, 'Passwords do not match');
        return;
    }

    // Validate terms acceptance
    if (!terms) {
        showError(form, 'Please accept the Terms & Conditions');
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        // This would typically be an API call
        const response = await mockRegisterAPI({
            fullName,
            email,
            phone,
            password
        });
        
        if (response.success) {
            // Store auth token
            sessionStorage.setItem('authToken', response.token);
            
            // Redirect to phone verification
            window.location.href = `auth-verify-phone.html?phone=${encodeURIComponent(phone)}`;
        } else {
            showError(form, response.message);
        }
    } catch (error) {
        showError(form, 'An error occurred. Please try again.');
    } finally {
        // Remove loading state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

function showError(form, message) {
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);

    // Add error class to input groups
    const inputGroups = form.querySelectorAll('.input-group');
    inputGroups.forEach(group => {
        group.classList.add('error');
    });

    // Remove error state after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
        inputGroups.forEach(group => {
            group.classList.remove('error');
        });
    }, 3000);
}

// Format phone number as user types
function formatPhoneNumber(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    
    input.value = value;
}

// Mock API calls (replace with actual API calls)
function mockLoginAPI(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API response
            if (email === 'test@example.com' && password === 'password123') {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        email: email,
                        name: 'John Doe'
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }, 1000);
    });
}

function mockRegisterAPI(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API response
            if (userData.email && userData.password) {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        ...userData
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Registration failed. Please try again.'
                });
            }
        }, 1000);
    });
}

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        // Redirect to dashboard if already authenticated
        window.location.href = 'index.html';
    }
}

// Call checkAuth on auth pages
if (window.location.pathname.includes('login.html') || 
    window.location.pathname.includes('register.html')) {
    checkAuth();
}

function redirectToPayPal() {
    const returnUrl = encodeURIComponent(window.location.origin + '/pages/payment methods.html');
    window.location.href = `https://www.paypal.com/signin?returnUrl=${returnUrl}`;
}

function enableEdit(card) {
    const editableElements = card.querySelectorAll('[contenteditable]');
    const isEditable = editableElements[0]?.getAttribute('contenteditable') === 'true';

    editableElements.forEach((element) => {
        element.setAttribute('contenteditable', !isEditable);
        if (!isEditable) {
            element.focus(); // Focus on the first editable element
        }
    });

    // Add a visual indicator for edit mode
    if (!isEditable) {
        card.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)'; // Highlight the card in edit mode
    } else {
        card.style.boxShadow = ''; // Remove the highlight when exiting edit mode
    }
}