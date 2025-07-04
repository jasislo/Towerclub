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

    // Load transaction details
    loadTransactionDetails(transactionId);

    // Add event listeners
    document.getElementById('editBtn').addEventListener('click', () => {
        window.location.href = `/pages/transactions/edit.html?id=${transactionId}`;
    });

    document.getElementById('deleteBtn').addEventListener('click', showDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', () => deleteTransaction(transactionId));
});

async function loadTransactionDetails(transactionId) {
    try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) throw new Error('Failed to fetch transaction details');
        
        const transaction = await response.json();
        updateTransactionDetails(transaction);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load transaction details');
    }
}

function updateTransactionDetails(transaction) {
    // Update icon and title
    const icon = CATEGORY_ICONS[transaction.category] || 'receipt';
    document.getElementById('typeIcon').innerHTML = `<span class="material-icons">${icon}</span>`;
    document.getElementById('transactionTitle').textContent = transaction.description || 'Untitled Transaction';
    
    // Update date
    document.getElementById('transactionDate').textContent = formatDate(transaction.date);
    
    // Update amount
    const formattedAmount = formatCurrency(transaction.amount);
    const amountElement = document.getElementById('transactionAmount');
    amountElement.textContent = `${transaction.type === 'expense' ? '-' : '+'}${formattedAmount}`;
    amountElement.className = `transaction-amount large ${transaction.type}`;
    
    // Update details
    document.getElementById('category').textContent = formatCategory(transaction.category);
    document.getElementById('type').textContent = capitalizeFirst(transaction.type);
    document.getElementById('description').textContent = transaction.description || 'No description';
    document.getElementById('createdAt').textContent = formatDate(transaction.createdAt);
    
    // Handle attachment if exists
    if (transaction.attachment) {
        document.getElementById('attachmentSection').style.display = 'block';
        document.getElementById('attachmentImage').src = transaction.attachment;
        document.getElementById('downloadBtn').href = transaction.attachment;
    }
}

async function deleteTransaction(transactionId) {
    try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete transaction');
        
        showSuccess('Transaction deleted successfully');
        setTimeout(() => {
            window.location.href = '/pages/transactions/';
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete transaction');
        hideDeleteModal();
    }
}

// Modal functions
function showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Utility functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatCategory(category) {
    return category
        .split('-')
        .map(word => capitalizeFirst(word))
        .join(' ');
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
    // Implement your error notification system here
    alert(message);
}

function showSuccess(message) {
    // Implement your success notification system here
    alert(message);
} 