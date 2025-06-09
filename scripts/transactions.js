// Constants for category icons
const CATEGORY_ICONS = {
    'food-dining': 'restaurant',
    'transportation': 'directions_car',
    'shopping': 'shopping_bag',
    'bills-utilities': 'receipt',
    'entertainment': 'movie',
    'health-fitness': 'fitness_center',
    'travel': 'flight',
    'education': 'school',
    'gifts-donations': 'card_giftcard',
    'salary': 'work',
    'business': 'business_center',
    'investments': 'trending_up',
    'rental': 'home',
    'sale': 'store',
    'gifts': 'redeem',
    'other': 'more_horiz'
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize date filters with current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];

    // Initialize filters
    initializeFilters();
    
    // Load initial transactions
    loadTransactions();

    // Add event listeners for filters
    document.getElementById('typeFilter').addEventListener('change', loadTransactions);
    document.getElementById('categoryFilter').addEventListener('change', loadTransactions);
    document.getElementById('startDate').addEventListener('change', loadTransactions);
    document.getElementById('endDate').addEventListener('change', loadTransactions);
});

async function initializeFilters() {
    try {
        const response = await fetch('/api/transactions/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const categories = await response.json();
        const categoryFilter = document.getElementById('categoryFilter');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

async function loadTransactions() {
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            type: typeFilter,
            category: categoryFilter,
            startDate,
            endDate
        });

        const response = await fetch(`/api/transactions?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        
        const data = await response.json();
        
        updateTransactionsList(data.transactions);
        updateSummary(data.summary);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load transactions');
    } finally {
        hideLoading();
    }
}

function updateTransactionsList(transactions) {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">receipt_long</span>
                <p>No transactions found</p>
            </div>
        `;
        return;
    }

    transactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transactionList.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const icon = CATEGORY_ICONS[transaction.category] || 'receipt';
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(transaction.amount);
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon">
                <span class="material-icons">${icon}</span>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.description || 'Untitled'}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
        </div>
        <div class="transaction-amount ${transaction.type}">
            ${transaction.type === 'expense' ? '-' : '+'}${formattedAmount}
        </div>
    `;

    div.addEventListener('click', () => {
        window.location.href = `/pages/transactions/details.html?id=${transaction.id}`;
    });

    return div;
}

function updateSummary(summary) {
    document.getElementById('totalBalance').textContent = formatCurrency(summary.balance);
    document.getElementById('totalIncome').textContent = formatCurrency(summary.income);
    document.getElementById('totalExpenses').textContent = formatCurrency(summary.expenses);
    
    document.getElementById('balanceTrend').textContent = formatPercentage(summary.balanceTrend);
    document.getElementById('incomeTrend').textContent = formatPercentage(summary.incomeTrend);
    document.getElementById('expenseTrend').textContent = formatPercentage(summary.expenseTrend);
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function showLoading() {
    // Add loading state to the transaction list
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = `
        <div class="loading-state">
            <span class="material-icons loading">sync</span>
            <p>Loading transactions...</p>
        </div>
    `;
}

function hideLoading() {
    // Loading state will be replaced when transactions are updated
}

function showError(message) {
    // Implement your error notification system here
    alert(message);
}

document.getElementById('makeTransferBtn').addEventListener('click', async () => {
    // Get form values
    const amount = document.getElementById('amount').value;
    const transactionType = document.querySelector('.type-btn[data-type="expense"].active') ? 'expense' : 'income';
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    // Validate form inputs
    if (!amount || !category || !date || !description) {
        alert('Please fill in all required fields.');
        return;
    }

    // Prepare API payload
    const payload = {
        amount: parseFloat(amount),
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
            const result = await response.json();
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

// Add active class to selected transaction type
document.querySelectorAll('.type-btn').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

function handleTransfer() {
    // Redirect to edittransaction.html
    window.location.href = 'edittransaction.html';
}