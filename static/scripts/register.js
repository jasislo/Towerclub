document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabName}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Password strength indicator
    const passwordInput = document.getElementById('registerPassword');
    const strengthBar = document.createElement('div');
    strengthBar.className = 'password-strength';
    const strengthBarInner = document.createElement('div');
    strengthBarInner.className = 'password-strength-bar';
    strengthBar.appendChild(strengthBarInner);
    passwordInput.parentNode.appendChild(strengthBar);

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        
        strengthBarInner.className = 'password-strength-bar';
        if (strength === 1) strengthBarInner.classList.add('weak');
        else if (strength === 2) strengthBarInner.classList.add('medium');
        else if (strength === 3) strengthBarInner.classList.add('strong');
    });

    // Registration form handling
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showMessage(registerMessage, 'Passwords do not match', 'error');
            return;
        }
        
        const formData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: password
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(registerMessage, 'Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';  // Redirect to home page
                }, 1500);
            } else {
                showMessage(registerMessage, data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage(registerMessage, 'An error occurred. Please try again.', 'error');
            console.error('Registration error:', error);
        }
    });

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';  // Redirect to home page
                }, 1500);
            } else {
                showMessage(loginMessage, data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage(loginMessage, 'An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        }
    });

    // Helper function to show messages
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'auth-message ' + type;
        element.style.display = 'block';
        
        // Clear message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // Check if user is already logged in
    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            if (data.authenticated) {
                window.location.href = '/';  // Redirect to home if already logged in
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    checkAuth();
}); 