class TransactionForm {
    constructor() {
        this.form = document.getElementById('transactionForm');
        this.amountInput = document.getElementById('amount');
        this.spentAtInput = document.getElementById('spentAt');
        this.budgetSelect = document.getElementById('budget');
        this.reasonInput = document.getElementById('reason');

        this.initializeForm();
        this.loadBudgets();
        this.attachEventListeners();
    }

    initializeForm() {
        // Add animation classes to form groups
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.animationDelay = `${index * 0.1}s`;
        });
    }

    async loadBudgets() {
        try {
            const response = await fetch('/api/budgets');
            const budgets = await response.json();
            
            // Clear existing options except the first one
            while (this.budgetSelect.options.length > 1) {
                this.budgetSelect.remove(1);
            }
            
            // Add budget options
            budgets.forEach(budget => {
                const option = document.createElement('option');
                option.value = budget.id;
                option.textContent = budget.name;
                this.budgetSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading budgets:', error);
            this.showToast('Failed to load budgets', 'error');
        }
    }

    attachEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Amount input formatting
        this.amountInput.addEventListener('input', (e) => {
            let value = e.target.value;
            if (value) {
                value = parseFloat(value).toFixed(2);
                e.target.value = value;
            }
        });

        // Spent at input autocomplete
        this.spentAtInput.addEventListener('input', this.handleSpentAtInput.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            amount: parseFloat(this.amountInput.value),
            spentAt: this.spentAtInput.value,
            budgetId: this.budgetSelect.value,
            reason: this.reasonInput.value,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }

            this.showToast('Transaction added successfully');
            setTimeout(() => {
                window.location.href = '/pages/transactions';
            }, 1500);
        } catch (error) {
            console.error('Error adding transaction:', error);
            this.showToast('Failed to add transaction', 'error');
        }
    }

    async handleSpentAtInput(e) {
        const value = e.target.value;
        if (value.length < 2) return;

        try {
            const response = await fetch(`/api/locations/autocomplete?query=${value}`);
            const suggestions = await response.json();
            
            // Create or update datalist
            let datalist = document.getElementById('spentAtSuggestions');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'spentAtSuggestions';
                this.spentAtInput.setAttribute('list', 'spentAtSuggestions');
                document.body.appendChild(datalist);
            }

            // Update suggestions
            datalist.innerHTML = suggestions
                .map(suggestion => `<option value="${suggestion}">`)
                .join('');
        } catch (error) {
            console.error('Error loading location suggestions:', error);
        }
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

// Initialize transaction form
document.addEventListener('DOMContentLoaded', () => {
    new TransactionForm();
}); 