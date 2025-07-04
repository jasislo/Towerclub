// Toast types and their corresponding classes
const TOAST_TYPES = {
    success: 'success',
    error: 'error',
    loading: 'loading',
    info: 'info'
};

// Toast display duration in milliseconds
const TOAST_DURATION = 3000;

// Keep track of active toasts
let activeToasts = [];

/**
 * Creates and shows a toast notification
 * @param {string} type - The type of toast ('success', 'error', 'loading', 'info')
 * @param {string} message - The message to display
 * @param {number} [duration] - Optional custom duration in milliseconds
 * @returns {Object} - Toast control object with methods to manage the toast
 */
export function showToast(type, message, duration = TOAST_DURATION) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${TOAST_TYPES[type] || TOAST_TYPES.info}`;
    
    // Create icon element
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = getIconForType(type);
    
    // Create message element
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;
    
    // Assemble toast
    toast.appendChild(icon);
    toast.appendChild(messageElement);
    
    // Add to document
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Create toast control object
    const toastControl = {
        element: toast,
        timeoutId: null,
        
        // Update the toast message
        update(newMessage) {
            messageElement.textContent = newMessage;
        },
        
        // Hide the toast
        hide() {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            hideToast(toast);
        }
    };
    
    // Add to active toasts
    activeToasts.push(toastControl);
    
    // Auto-hide toast after duration (except for loading toasts)
    if (type !== 'loading') {
        toastControl.timeoutId = setTimeout(() => {
            hideToast(toast);
        }, duration);
    }
    
    return toastControl;
}

/**
 * Hide a specific toast element
 * @param {HTMLElement} toast - The toast element to hide
 */
function hideToast(toast) {
    // Remove from active toasts
    activeToasts = activeToasts.filter(t => t.element !== toast);
    
    // Animate out
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

/**
 * Hide all active toasts
 */
export function hideAllToasts() {
    activeToasts.forEach(toast => toast.hide());
}

/**
 * Get the appropriate material icon name for each toast type
 * @param {string} type - The type of toast
 * @returns {string} - Material icon name
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'check_circle';
        case 'error':
            return 'error';
        case 'loading':
            return 'hourglass_empty';
        case 'info':
        default:
            return 'info';
    }
}

// Add necessary styles to the document
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast.hide {
        transform: translateY(100%);
        opacity: 0;
    }
    
    .toast .material-icons {
        font-size: 20px;
    }
    
    .toast.success {
        background: #4caf50;
        color: white;
    }
    
    .toast.error {
        background: #f44336;
        color: white;
    }
    
    .toast.loading {
        background: #2196f3;
        color: white;
    }
    
    .toast.info {
        background: #2196f3;
        color: white;
    }
    
    .toast .toast-message {
        font-size: 14px;
        font-weight: 500;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .toast.loading .material-icons {
        animation: spin 1s linear infinite;
    }
`;

document.head.appendChild(style);

// Dark mode sync logic for all pages
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Apply dark mode from localStorage on page load
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle && (darkModeToggle.textContent = 'Light Mode');
} else {
    darkModeToggle && (darkModeToggle.textContent = 'Dark Mode');
}

// Toggle dark mode on button click and sync across app
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.textContent = 'Light Mode';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.textContent = 'Dark Mode';
        }
    });
}

// Add dark mode styles for toast notifications
const darkModeToastStyle = document.createElement('style');
darkModeToastStyle.textContent = `
    body.dark-mode .toast {
        background: #23272f !important;
        color: #fff !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    }
    body.dark-mode .toast.success {
        background: #357a38 !important;
    }
    body.dark-mode .toast.error {
        background: #b71c1c !important;
    }
    body.dark-mode .toast.loading,
    body.dark-mode .toast.info {
        background: #1565c0 !important;
    }
`;
document.head.appendChild(darkModeToastStyle);