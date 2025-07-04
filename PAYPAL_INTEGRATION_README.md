# PayPal Integration for TowerClub Crypto Trading

This document outlines the setup and functionality of the PayPal integration for the TowerClub crypto trading feature.

## Overview

The PayPal integration ensures that users must log in with PayPal before they can access the crypto trading features. This provides an additional layer of security and verification for crypto transactions.

## Implementation

The implementation includes:
1. PayPal OAuth login flow
2. Server-side session management
3. Client-side verification before accessing trading features

## How It Works

1. **Login Flow**:
   - User clicks "Log in with PayPal" button on the crypto dashboard
   - User is redirected to PayPal's OAuth login page
   - After successful authentication, PayPal redirects back to our callback URL
   - Server verifies the authentication and sets session variables
   - User is redirected back to the crypto dashboard

2. **Verification**:
   - Before allowing trades, the system checks if the user is logged in with PayPal
   - This check happens both client-side and server-side for security
   - If not logged in, user is prompted to log in with PayPal

3. **UI Updates**:
   - The PayPal button changes to "Logged in with PayPal" when user is authenticated
   - Button color changes to green to indicate logged-in state
   - Clicking the button in logged-in state allows the user to log out

## Setup Instructions

1. Install the required dependencies:
   ```
   npm install
   ```

2. Update the PayPal credentials in `server/paypal-auth.js`:
   - Replace `YOUR_PAYPAL_SECRET` with your actual PayPal secret
   - Update the `PAYPAL_REDIRECT_URI` to match your deployment environment

3. Start the server:
   ```
   npm run server
   ```

4. Test the integration:
   - Visit the crypto dashboard page
   - Click "Log in with PayPal"
   - After successful login, try clicking the trade buttons

## Troubleshooting

If the PayPal integration is not working:

1. Check the browser console for any JavaScript errors
2. Verify server logs for any backend errors
3. Ensure the PayPal credentials are correct
4. Make sure the redirect URI is registered in your PayPal Developer Dashboard

## Security Considerations

- The server uses sessions to track login state
- Always verify PayPal login server-side before allowing trades
- Never expose your PayPal Secret in client-side code
