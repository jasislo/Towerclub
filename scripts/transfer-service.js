/**
 * Transfer Service - Handles money transfers between users and accounts
 */
class TransferService {
  constructor() {
    this.transactionKey = 'towerclub_transactions';
    this.balanceKey = 'accountBalance';
  }

  /**
   * Transfer money between accounts
   * @param {Object} transferData - Transfer details
   * @returns {Promise} Promise object that resolves with the transfer result
   */
  async transferMoney(transferData) {
    try {
      // Validate transfer data
      this._validateTransferData(transferData);
      
      // Get sender's current balance
      const senderBalance = this._getUserBalance();
      
      // Check if sender has sufficient balance
      if (senderBalance < transferData.amount) {
        throw new Error('Insufficient funds for this transfer');
      }
      
      // Process the transfer
      const result = await this._processTransfer(transferData, senderBalance);
      
      // Return success response
      return {
        success: true,
        message: 'Transfer completed successfully',
        transferId: result.transferId,
        date: result.date,
        remainingBalance: result.newBalance
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      return {
        success: false,
        message: error.message || 'Transfer failed'
      };
    }
  }

  /**
   * Process the actual transfer
   * @private
   */
  async _processTransfer(transferData, currentBalance) {
    // In a real app, this would be an API call to a backend
    // For now, we'll simulate the transfer with localStorage
    
    // Generate a unique transfer ID
    const transferId = 'TRX' + Date.now();
    const transferDate = new Date();
    
    // Update sender's balance
    const newBalance = currentBalance - transferData.amount;
    localStorage.setItem(this.balanceKey, newBalance);
    
    // Record the transaction
    this._saveTransaction({
      id: transferId,
      type: 'expense',
      amount: transferData.amount,
      date: transferDate.toISOString(),
      description: `Transfer to ${transferData.recipientEmail}`,
      category: 'transfer',
      paymentMethod: transferData.paymentMethod || 'virtual_card',
      recipientInfo: {
        email: transferData.recipientEmail,
        type: transferData.recipientType
      },
      notes: transferData.notes
    });
    
    // Return the result
    return {
      transferId,
      date: transferDate,
      newBalance
    };
  }

  /**
   * Get user's current balance
   * @private
   */
  _getUserBalance() {
    return parseFloat(localStorage.getItem(this.balanceKey) || '1000');
  }

  /**
   * Save transaction to history
   * @private
   */
  _saveTransaction(transaction) {
    // Get existing transactions
    const transactions = JSON.parse(localStorage.getItem(this.transactionKey) || '[]');
    
    // Add new transaction
    transactions.push(transaction);
    
    // Save back to localStorage
    localStorage.setItem(this.transactionKey, JSON.stringify(transactions));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('transaction-added', { 
      detail: { transaction } 
    }));
  }

  /**
   * Validate transfer data
   * @private
   */
  _validateTransferData(data) {
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    if (!data.recipientEmail) {
      throw new Error('Recipient email is required');
    }
    
    if (!data.recipientType) {
      throw new Error('Recipient type is required');
    }
    
    // Additional validation for bank transfers
    if (data.recipientType === 'bank') {
      if (!data.bankName) throw new Error('Bank name is required');
      if (!data.accountNumber) throw new Error('Account number is required');
      if (!data.routingNumber) throw new Error('Routing number is required');
    }
  }

  /**
   * Get all transactions for current user
   */
  getTransactions() {
    return JSON.parse(localStorage.getItem(this.transactionKey) || '[]');
  }
}

// Create and export a singleton instance
const transferService = new TransferService();
export default transferService;