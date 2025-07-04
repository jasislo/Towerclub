import { CATEGORY_ICONS } from './transactions.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get transaction ID from URL
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('id');

    if (!transactionId) {
        showError('Transaction ID not found');
        setTimeout(() => {
            window.location.href = '/pages/transactions/';
        }, 2000);
        return;
    }

    // Initialize form elements
    const form = document.getElementById('editTransactionForm');
    const amountInput = document.getElementById('amount');
    const typeButtons = document.querySelectorAll('.type-btn');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const descriptionInput = document.getElementById('description');
    const fileInput = document.getElementById('attachment');
    const fileNameDisplay = document.querySelector('.file-name');
    const currentAttachment = document.getElementById('currentAttachment');
    const attachmentPreview = document.getElementById('attachmentPreview');
    const removeAttachmentBtn = document.getElementById('removeAttachment');

    let originalAttachment = null;
    let shouldRemoveAttachment = false;

    // Load transaction details
    loadTransactionDetails(transactionId);

    // Handle transaction type selection
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update category options based on transaction type
            updateCategoryOptions(button.dataset.type);
        });
    });

    // Handle file upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            currentAttachment.style.display = 'none';
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            if (originalAttachment && !shouldRemoveAttachment) {
                currentAttachment.style.display = 'block';
            }
        }
    });

    // Handle remove attachment
    removeAttachmentBtn.addEventListener('click', () => {
        shouldRemoveAttachment = true;
        currentAttachment.style.display = 'none';
        fileInput.value = '';
        fileNameDisplay.textContent = 'No file chosen';
    });

    // Format amount input
    amountInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.replace(/\.+$/, '');
        }
        
        // Limit to 2 decimal places
        const parts = value.split('.');
        if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
            value = parts.join('.');
        }
        
        e.target.value = value;
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const activeTypeBtn = document.querySelector('.type-btn.active');
        if (!activeTypeBtn) {
            showError('Please select a transaction type');
            return;
        }

        const formData = new FormData();
        formData.append('amount', amountInput.value);
        formData.append('type', activeTypeBtn.dataset.type);
        formData.append('category', categorySelect.value);
        formData.append('date', dateInput.value);
        formData.append('description', descriptionInput.value);
        
        if (fileInput.files[0]) {
            formData.append('attachment', fileInput.files[0]);
        }
        
        if (shouldRemoveAttachment) {
            formData.append('removeAttachment', 'true');
        }

        try {
            showLoading();
            
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }

            showSuccess('Transaction updated successfully');
            setTimeout(() => {
                window.location.href = `/pages/transactions/details.html?id=${transactionId}`;
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            showError('Failed to update transaction. Please try again.');
        } finally {
            hideLoading();
        }
    });

    document.getElementById('editTransactionForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const amount = document.getElementById('amount').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const transactionType = document.querySelector('.type-btn.active')?.dataset.type || '';
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        // Validate form inputs
        if (!amount || !paymentMethod || !transactionType || !category || !date || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        // Prepare data to save
        const transactionData = {
            amount: parseFloat(amount),
            paymentMethod,
            transactionType,
            category,
            date,
            description,
        };

        try {
            // Simulate saving data to an API or database
            const response = await fetch('https://api.example.com/transactions', {
                method: 'PUT', // Use PUT for updating an existing transaction
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                alert('Changes saved successfully!');
                window.location.href = 'transfer.html'; // Redirect to the transfer page
            } else {
                const error = await response.json();
                alert(`Failed to save changes: ${error.message}`);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('An error occurred while saving the changes.');
        }
    });

    // Add active class to selected transaction type
    document.querySelectorAll('.type-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    document.getElementById('makeTransferBtn').addEventListener('click', async () => {
        // Get form values
        const amount = document.getElementById('amount').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const transactionType = document.querySelector('.type-btn[data-type="expense"].active') ? 'expense' : 'income';
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        // Validate form inputs
        if (!amount || !paymentMethod || !category || !date || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        // Prepare API payload
        const payload = {
            amount: parseFloat(amount),
            paymentMethod,
            transactionType,
            category,
            date,
            description,
        };

        try {
            // Call the API
            const response = await fetch('https://api.example.com/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Transfer successful!');
                window.location.href = 'transfer.html'; // Redirect to transfer page
            } else {
                const error = await response.json();
                alert(`Transfer failed: ${error.message}`);
            }
        } catch (error) {
            console.error('Error during transfer:', error);
            alert('An error occurred while processing the transfer.');
        }
    });
});

async function loadTransactionDetails(transactionId) {
    try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) throw new Error('Failed to fetch transaction details');
        
        const transaction = await response.json();
        populateForm(transaction);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load transaction details');
    }
}

function populateForm(transaction) {
    // Set amount
    document.getElementById('amount').value = transaction.amount;
    
    // Set transaction type
    const typeBtn = document.querySelector(`.type-btn[data-type="${transaction.type}"]`);
    if (typeBtn) {
        typeBtn.classList.add('active');
        updateCategoryOptions(transaction.type);
    }
    
    // Set category
    document.getElementById('category').value = transaction.category;
    
    // Set date
    document.getElementById('date').value = transaction.date.split('T')[0];
    
    // Set description
    document.getElementById('description').value = transaction.description || '';
    
    // Handle attachment
    if (transaction.attachment) {
        originalAttachment = transaction.attachment;
        document.getElementById('currentAttachment').style.display = 'block';
        document.getElementById('attachmentPreview').src = transaction.attachment;
    }
}

function updateCategoryOptions(transactionType) {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';

    const categories = transactionType === 'expense' 
        ? [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Bills & Utilities',
            'Entertainment',
            'Health & Fitness',
            'Travel',
            'Education',
            'Gifts & Donations',
            'Other'
        ]
        : [
            'Salary',
            'Business',
            'Investments',
            'Rental',
            'Sale',
            'Gifts',
            'Other'
        ];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase().replace(/\s+/g, '-');
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons loading">sync</span> Saving...';
}

function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Save Changes';
}

function showError(message) {
    // Implement your error notification system here
    alert(message);
}

function showSuccess(message) {
    // Implement your success notification system here
    alert(message);
}