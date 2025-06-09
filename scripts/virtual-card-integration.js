/**
 * Virtual Card Integration for my_virtualcard.html
 * This file integrates the virtual card generator with the HTML page
 */

import { 
    generateVirtualCard, 
    validateCardNumber, 
    formatCardNumber, 
    maskCardNumber,
    initializeVirtualCardSystem,
    formatCurrency,
    formatDate
} from './virtualcard.js';

class VirtualCardUI {
    constructor() {
        this.cardManager = initializeVirtualCardSystem();
        this.currentCard = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingCards();
        this.updateCardDisplay();
    }

    setupEventListeners() {
        // Generate new card button
        const generateBtn = document.getElementById('generateCardBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateNewCard());
        }

        // Card type selector
        const cardTypeSelect = document.getElementById('cardTypeSelect');
        if (cardTypeSelect) {
            cardTypeSelect.addEventListener('change', (e) => this.onCardTypeChange(e.target.value));
        }

        // Provider selector
        const providerSelect = document.getElementById('providerSelect');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => this.onProviderChange(e.target.value));
        }

        // Show/hide card details
        const toggleCardBtn = document.getElementById('toggleCardBtn');
        if (toggleCardBtn) {
            toggleCardBtn.addEventListener('click', () => this.toggleCardVisibility());
        }

        // Copy card number
        const copyCardBtn = document.getElementById('copyCardBtn');
        if (copyCardBtn) {
            copyCardBtn.addEventListener('click', () => this.copyCardNumber());
        }

        // Freeze/unfreeze card
        const freezeCardBtn = document.getElementById('freezeCardBtn');
        if (freezeCardBtn) {
            freezeCardBtn.addEventListener('click', () => this.toggleCardFreeze());
        }
    }

    async generateNewCard() {
        try {
            const cardType = document.getElementById('cardTypeSelect')?.value || 'VISA';
            const provider = document.getElementById('providerSelect')?.value || 'LOCAL';
            const cardholderName = document.getElementById('cardholderName')?.value || 'VIRTUAL CARD';
            const creditLimit = parseFloat(document.getElementById('creditLimit')?.value) || 1000;

            const options = {
                cardType: cardType,
                cardCategory: 'VIRTUAL',
                cardholderName: cardholderName,
                creditLimit: creditLimit,
                currency: 'USD'
            };

            this.currentCard = await this.cardManager.createCard(provider, options);
            this.updateCardDisplay();
            this.saveCardToStorage();
            this.showNotification('Virtual card generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating card:', error);
            this.showNotification('Failed to generate virtual card. Please try again.', 'error');
        }
    }

    updateCardDisplay() {
        if (!this.currentCard) {
            this.showNoCardMessage();
            return;
        }

        // Update card visual display
        this.updateCardVisual();
        
        // Update card details
        this.updateCardDetails();
        
        // Update transaction history
        this.updateTransactionHistory();
    }

    updateCardVisual() {
        const cardContainer = document.querySelector('.card-container');
        if (!cardContainer) return;

        const cardNumber = document.querySelector('.card-number');
        const cardholderName = document.querySelector('.cardholder-name');
        const expiryDate = document.querySelector('.expiry-date');
        const cvv = document.querySelector('.cvv');

        if (cardNumber) {
            cardNumber.textContent = this.currentCard.maskedNumber;
        }

        if (cardholderName) {
            cardholderName.textContent = this.currentCard.cardholderName;
        }

        if (expiryDate) {
            expiryDate.textContent = this.currentCard.expiryDate;
        }

        if (cvv) {
            cvv.textContent = this.currentCard.cvv;
        }

        // Update card type indicator
        const cardTypeIndicator = document.querySelector('.card-type');
        if (cardTypeIndicator) {
            cardTypeIndicator.textContent = this.currentCard.cardType;
        }
    }

    updateCardDetails() {
        const detailsContainer = document.getElementById('cardDetails');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="detail-item">
                <span class="label">Card ID:</span>
                <span class="value">${this.currentCard.id}</span>
            </div>
            <div class="detail-item">
                <span class="label">Card Type:</span>
                <span class="value">${this.currentCard.cardType} ${this.currentCard.cardCategory}</span>
            </div>
            <div class="detail-item">
                <span class="label">Credit Limit:</span>
                <span class="value">${formatCurrency(this.currentCard.creditLimit, this.currentCard.currency)}</span>
            </div>
            <div class="detail-item">
                <span class="label">Current Balance:</span>
                <span class="value">${formatCurrency(this.currentCard.balance, this.currentCard.currency)}</span>
            </div>
            <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value ${this.currentCard.isActive ? 'active' : 'inactive'}">
                    ${this.currentCard.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="detail-item">
                <span class="label">Created:</span>
                <span class="value">${formatDate(this.currentCard.createdAt)}</span>
            </div>
            ${this.currentCard.lastUsed ? `
            <div class="detail-item">
                <span class="label">Last Used:</span>
                <span class="value">${formatDate(this.currentCard.lastUsed)}</span>
            </div>
            ` : ''}
        `;
    }

    updateTransactionHistory() {
        const transactionsContainer = document.querySelector('.transactions');
        if (!transactionsContainer) return;

        if (!this.currentCard.transactions || this.currentCard.transactions.length === 0) {
            transactionsContainer.innerHTML = '<p class="no-transactions">No transactions yet</p>';
            return;
        }

        transactionsContainer.innerHTML = '';
        this.currentCard.transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.classList.add('transaction-item');
            transactionItem.innerHTML = `
                <div class="details">
                    <span>${transaction.description || 'Transaction'}</span>
                    <span>${formatDate(transaction.timestamp)}</span>
                </div>
                <div class="amount ${transaction.amount < 0 ? 'negative' : 'positive'}">
                    ${transaction.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(transaction.amount), this.currentCard.currency)}
                </div>
            `;
            transactionsContainer.appendChild(transactionItem);
        });
    }

    showNoCardMessage() {
        const cardContainer = document.querySelector('.card-container');
        if (cardContainer) {
            cardContainer.innerHTML = `
                <div class="no-card-message">
                    <h3>No Virtual Card</h3>
                    <p>Generate a new virtual card to get started</p>
                    <button id="generateFirstCardBtn" class="btn btn-primary">Generate Card</button>
                </div>
            `;

            document.getElementById('generateFirstCardBtn')?.addEventListener('click', () => this.generateNewCard());
        }
    }

    toggleCardVisibility() {
        const cardNumber = document.querySelector('.card-number');
        const toggleBtn = document.getElementById('toggleCardBtn');
        
        if (!cardNumber || !toggleBtn) return;

        if (cardNumber.textContent === this.currentCard.maskedNumber) {
            cardNumber.textContent = this.currentCard.cardNumber;
            toggleBtn.textContent = 'Hide Number';
        } else {
            cardNumber.textContent = this.currentCard.maskedNumber;
            toggleBtn.textContent = 'Show Number';
        }
    }

    copyCardNumber() {
        if (!this.currentCard) return;

        navigator.clipboard.writeText(this.currentCard.cardNumber).then(() => {
            this.showNotification('Card number copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy card number', 'error');
        });
    }

    toggleCardFreeze() {
        if (!this.currentCard) return;

        this.currentCard.isActive = !this.currentCard.isActive;
        this.cardManager.updateCard(this.currentCard.id, { isActive: this.currentCard.isActive });
        this.updateCardDisplay();
        this.saveCardToStorage();

        const freezeBtn = document.getElementById('freezeCardBtn');
        if (freezeBtn) {
            freezeBtn.textContent = this.currentCard.isActive ? 'Freeze Card' : 'Unfreeze Card';
        }

        this.showNotification(
            `Card ${this.currentCard.isActive ? 'unfrozen' : 'frozen'} successfully!`, 
            'success'
        );
    }

    onCardTypeChange(cardType) {
        // Update UI based on card type selection
        const providerSelect = document.getElementById('providerSelect');
        if (providerSelect) {
            if (cardType === 'PAYPAL') {
                providerSelect.value = 'PAYPAL';
            } else if (cardType === 'VISA') {
                providerSelect.value = 'VISA';
            }
        }
    }

    onProviderChange(provider) {
        // Update UI based on provider selection
        console.log('Provider changed to:', provider);
    }

    saveCardToStorage() {
        if (this.currentCard) {
            localStorage.setItem('towerclub_virtual_card', JSON.stringify(this.currentCard));
        }
    }

    loadExistingCards() {
        const savedCard = localStorage.getItem('towerclub_virtual_card');
        if (savedCard) {
            try {
                this.currentCard = JSON.parse(savedCard);
                this.cardManager.cards.set(this.currentCard.id, this.currentCard);
            } catch (error) {
                console.error('Error loading saved card:', error);
                localStorage.removeItem('towerclub_virtual_card');
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;

        // Set background color based on type
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
        `;
        closeBtn.addEventListener('click', () => notification.remove());

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Add CSS animations
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the virtual card UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const virtualCardUI = new VirtualCardUI();
    virtualCardUI.addNotificationStyles();
    
    // Make it globally available for debugging
    window.virtualCardUI = virtualCardUI;
});

// Export for use in other modules
export { VirtualCardUI }; 