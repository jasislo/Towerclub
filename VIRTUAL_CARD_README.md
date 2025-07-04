# Virtual Card Generation System

This system provides virtual card number generation for TowerClub, supporting PayPal and VISA APIs along with local card generation.

## Features

- **Multiple Card Types**: VISA, Mastercard, and PayPal virtual cards
- **API Integration**: PayPal and VISA API support for real virtual cards
- **Local Generation**: Offline card generation with Luhn algorithm validation
- **Security**: Card number masking, CVV generation, and expiry date validation
- **User Interface**: Modern, responsive UI for card management
- **Transaction Tracking**: Built-in transaction history and balance tracking

## Setup Instructions

### 1. Basic Setup (Local Generation Only)

The system works out of the box with local card generation. No API credentials are required.

### 2. PayPal API Integration

To enable PayPal virtual cards:

1. Get PayPal API credentials from [PayPal Developer Portal](https://developer.paypal.com/)
2. Update `scripts/virtual-card-config.js`:
   ```javascript
   paypal: {
       clientId: 'your_actual_paypal_client_id',
       clientSecret: 'your_actual_paypal_client_secret',
       environment: 'sandbox', // or 'production'
       enabled: true
   }
   ```

### 3. VISA API Integration

To enable VISA virtual cards:

1. Get VISA API credentials from [VISA Developer Portal](https://developer.visa.com/)
2. Update `scripts/virtual-card-config.js`:
   ```javascript
   visa: {
       apiKey: 'your_actual_visa_api_key',
       environment: 'sandbox', // or 'production'
       enabled: true
   }
   ```

## Usage

### Generating a Virtual Card

1. Open `pages/my_virtualcard.html`
2. Select card type (VISA, Mastercard, PayPal)
3. Choose provider (Local, VISA API, PayPal API)
4. Enter cardholder name and credit limit
5. Click "Generate Virtual Card"

### Card Management

- **Show/Hide Number**: Toggle between masked and full card number
- **Copy Number**: Copy card number to clipboard
- **Freeze/Unfreeze**: Temporarily disable card usage
- **View Details**: See complete card information and transaction history

## File Structure

```
scripts/
├── virtualcard.js              # Core virtual card functions
├── virtual-card-integration.js # UI integration layer
├── virtual-card-config.js      # Configuration and API settings
└── ...

pages/
└── my_virtualcard.html         # Main virtual card page
```

## API Reference

### Core Functions

#### `generateVirtualCard(options)`
Generates a complete virtual card object.

**Parameters:**
- `options.cardType` (string): Card type ('VISA', 'MASTERCARD', 'PAYPAL')
- `options.cardCategory` (string): Card category ('DEBIT', 'CREDIT', 'VIRTUAL')
- `options.cardholderName` (string): Name on the card
- `options.creditLimit` (number): Credit limit amount
- `options.currency` (string): Currency code (default: 'USD')

**Returns:** Virtual card object with all details

#### `validateCardNumber(cardNumber)`
Validates a card number using the Luhn algorithm.

**Parameters:**
- `cardNumber` (string): Card number to validate

**Returns:** Boolean indicating validity

#### `generateCardNumber(cardType, cardCategory)`
Generates a valid card number for the specified type.

**Parameters:**
- `cardType` (string): Card type
- `cardCategory` (string): Card category

**Returns:** Valid card number string

### Classes

#### `VirtualCardManager`
Main interface for card operations.

**Methods:**
- `createCard(provider, options)` - Create a new virtual card
- `getCard(cardId)` - Get card details
- `getAllCards()` - Get all cards
- `updateCard(cardId, updates)` - Update card details
- `deactivateCard(cardId)` - Deactivate a card
- `addTransaction(cardId, transaction)` - Add transaction to card

#### `PayPalVirtualCardAPI`
PayPal API integration class.

#### `VISAVirtualCardAPI`
VISA API integration class.

## Security Features

- **Luhn Algorithm**: All generated card numbers pass Luhn validation
- **Card Masking**: Default display shows only last 4 digits
- **Secure Storage**: Card data stored in browser localStorage
- **Session Management**: Configurable session timeouts
- **Input Validation**: Comprehensive validation for all inputs

## Configuration Options

### Security Settings
```javascript
security: {
    maskCardNumbers: true,        // Hide full card numbers by default
    requireAuthentication: true,  // Require user authentication
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxCardsPerUser: 5,           // Maximum cards per user
    maxTransactionsPerCard: 1000  // Maximum transactions per card
}
```

### UI Settings
```javascript
ui: {
    showCardNumber: false,        // Default to masked display
    autoRefreshInterval: 30000,   // Auto-refresh interval (ms)
    enableNotifications: true,    // Enable success/error notifications
    theme: 'light'                // UI theme
}
```

## Error Handling

The system includes comprehensive error handling:

- **API Errors**: Graceful fallback to local generation
- **Validation Errors**: Clear error messages for invalid inputs
- **Network Errors**: Retry logic for API calls
- **Storage Errors**: Fallback mechanisms for data persistence

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Adding New Card Types

1. Update `CARD_BINS` in `virtualcard.js`
2. Add new card type to the UI selectors
3. Update validation logic if needed

### Adding New Providers

1. Create new API class extending the base pattern
2. Add provider configuration to `virtual-card-config.js`
3. Update `VirtualCardManager.createCard()` method
4. Add provider to UI selectors

## Troubleshooting

### Common Issues

1. **Cards not generating**: Check browser console for errors
2. **API calls failing**: Verify API credentials and network connectivity
3. **UI not updating**: Ensure all required DOM elements exist
4. **Validation errors**: Check input format and validation rules

### Debug Mode

Enable debug mode by setting:
```javascript
window.virtualCardUI.debug = true;
```

This will log detailed information to the console.

## License

This virtual card system is part of the TowerClub application and is proprietary software.

## Support

For technical support or questions about the virtual card system, please contact the TowerClub development team. 