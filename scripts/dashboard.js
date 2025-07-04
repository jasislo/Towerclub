// Import necessary modules
import { loadNavigation } from './navigation.js';
import { formatCurrency } from './utils.js';

class Dashboard {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
    }

    initializeElements() {
        // Stats elements
        this.totalBalance = document.getElementById('totalBalance');
        this.moneyIn = document.getElementById('moneyIn');
        this.moneyOut = document.getElementById('moneyOut');
        this.savingsRate = document.getElementById('savingsRate');
        this.portfolioValue = document.getElementById('portfolioValue');

        // Lists
        this.recentTransactions = document.getElementById('recentTransactions');
        this.recentChats = document.querySelector('.chat-list'); // Updated for Recent Chats
        this.recentActivities = document.querySelector('.recent-activities-list'); // Updated for Recent Activities
    }

    async loadDashboardData() {
        try {
            // Load financial stats
            const statsResponse = await fetch('/api/dashboard/stats');
            const statsData = await statsResponse.json();
            this.updateStats(statsData);

            // Load portfolio data
            const portfolioResponse = await fetch('/api/portfolio');
            const portfolioData = await portfolioResponse.json();
            this.updatePortfolio(portfolioData);

            // Load recent transactions
            const transactionsResponse = await fetch('/api/transactions/recent');
            const transactionsData = await transactionsResponse.json();
            this.renderRecentTransactions(transactionsData);

            // Load recent chats
            const chatsResponse = await fetch('/api/chats/recent');
            const chatsData = await chatsResponse.json();
            this.renderRecentChats(chatsData);

            // Load recent activities
            const activitiesResponse = await fetch('/api/activities/recent');
            const activitiesData = await activitiesResponse.json();
            this.renderRecentActivities(activitiesData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Failed to load dashboard data', 'error');
        }
    }

    updateStats(stats) {
        this.totalBalance.textContent = this.formatCurrency(stats.totalBalance);
        this.moneyIn.textContent = this.formatCurrency(stats.moneyIn);
        this.moneyOut.textContent = this.formatCurrency(stats.moneyOut);
        this.savingsRate.textContent = `${stats.savingsRate}%`;
    }

    updatePortfolio(portfolio) {
        this.portfolioValue.textContent = this.formatCurrency(portfolio.totalValue);
    }

    renderRecentTransactions(transactions) {
        const recentTransactions = transactions.slice(0, 2);
        this.recentTransactions.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon">
                    <span class="material-icons">${this.getTransactionIcon(transaction.type)}</span>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.title}</div>
                    <div class="transaction-meta">${this.formatDate(transaction.timestamp)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }

    renderRecentChats(chats) {
        const recentChats = chats.slice(0, 3); // Show the 3 most recent chats
        this.recentChats.innerHTML = recentChats.map(chat => `
            <div class="chat-item">
                <div class="chat-avatar">
                    <img src="${chat.avatar}" alt="${chat.name}">
                </div>
                <div class="chat-info">
                    <p class="chat-name">${chat.name}</p>
                    <p class="chat-message">${chat.lastMessage}</p>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivities(activities) {
        const recentActivities = activities.slice(0, 5); // Show the 5 most recent activities
        this.recentActivities.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-date">${this.formatDate(activity.timestamp)}</div>
                <div class="activity-amount ${activity.type === 'income' ? 'positive' : 'negative'}">
                    ${activity.type === 'income' ? '+' : '-'}${this.formatCurrency(activity.amount)}
                </div>
            </div>
        `).join('');
    }

    getTransactionIcon(type) {
        const icons = {
            'expense': 'trending_down',
            'income': 'trending_up',
            'transfer': 'swap_horiz'
        };
        return icons[type] || 'receipt';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});