document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.transaction-form');
    const amountInput = document.querySelector('#amount');
    const typeButtons = document.querySelectorAll('.type-btn');
    const categorySelect = document.querySelector('#category');
    const dateInput = document.querySelector('#date');
    const descriptionInput = document.querySelector('#description');
    const fileInput = document.querySelector('#attachment');
    const fileNameDisplay = document.querySelector('.file-name');

    // Set default date to today
    dateInput.value = new Date().toISOString().split('T')[0];

    // Transaction type selection
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateCategoryOptions(button.dataset.type);
        });
    });

    // File upload display
    fileInput.addEventListener('change', (e) => {
        fileNameDisplay.textContent = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    });

    // Amount input formatting
    amountInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) value = value.replace(/\.+$/, '');
        const parts = value.split('.');
        if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
            value = parts.join('.');
        }
        e.target.value = value;
    });

    // Form submission
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
        if (fileInput.files[0]) formData.append('attachment', fileInput.files[0]);

        try {
            showLoading();
            const response = await fetch('/api/transactions', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to add transaction');
            showSuccess('Transaction added successfully');
            setTimeout(() => {
                window.location.href = '/transactions';
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to add transaction. Please try again.');
        } finally {
            hideLoading();
        }
    });

    // Initial data load
    loadTransactionSummary();
    loadTransactionHistory();
});

// Helper: Update category options
function updateCategoryOptions(transactionType) {
    const categorySelect = document.querySelector('#category');
    categorySelect.innerHTML = '';
    const categories = transactionType === 'expense'
        ? [
            'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
            'Entertainment', 'Health & Fitness', 'Travel', 'Education',
            'Gifts & Donations', 'Other'
        ]
        : [
            'Salary', 'Business', 'Investments', 'Rental',
            'Sale', 'Gifts', 'Other'
        ];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase().replace(/\s+/g, '-');
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Helper: Show loading state
function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons loading">sync</span> Adding...';
}

// Helper: Hide loading state
function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Add Transaction';
}

// Helper: Show error
function showError(message) {
    alert(message); // Replace with custom UI as needed
}

// Helper: Show success
function showSuccess(message) {
    alert(message); // Replace with custom UI as needed
}

// Load transaction summary from API
async function loadTransactionSummary() {
    try {
        const response = await fetch('/api/transactions/summary');
        if (!response.ok) throw new Error('Failed to load summary');
        const summary = await response.json();
        document.getElementById('moneyIn').textContent = formatCurrency(summary.moneyIn);
        document.getElementById('moneyOut').textContent = formatCurrency(summary.moneyOut);
        document.getElementById('totalBalance').textContent = formatCurrency(summary.totalBalance);
    } catch (error) {
        console.error('Error loading transaction summary:', error);
    }
}

// Load transaction history from API
async function loadTransactionHistory() {
    try {
        const response = await fetch('/api/transactions/history');
        if (!response.ok) throw new Error('Failed to load history');
        const transactions = await response.json();
        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h3 class="transaction-title">${transaction.title || transaction.category}</h3>
                    <p class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading transaction history:', error);
    }
}

// Format currency helper
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}