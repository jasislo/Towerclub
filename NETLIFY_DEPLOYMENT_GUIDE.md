# TowerClub Web App - Netlify Deployment Guide

This comprehensive guide will walk you through deploying your TowerClub web app to Netlify with integrated database functionality for user accounts and effective user interaction.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure Setup](#project-structure-setup)
3. [Database Setup](#database-setup)
4. [Netlify Configuration](#netlify-configuration)
5. [Serverless Functions](#serverless-functions)
6. [Frontend Optimization](#frontend-optimization)
7. [Environment Variables](#environment-variables)
8. [Deployment Process](#deployment-process)
9. [Testing & Verification](#testing--verification)
10. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Accounts
- [Netlify Account](https://netlify.com) (free tier available)
- [GitHub Account](https://github.com) (for version control)
- [Neon Account](https://neon.tech) (for PostgreSQL database)

### Required Tools
- Git (for version control)
- Node.js (for local development)
- A code editor (VS Code recommended)

## Project Structure Setup

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - TowerClub web app"
```

### 2. Create Essential Configuration Files

#### Create `package.json`
```json
{
  "name": "towerclub-web-app",
  "version": "1.0.0",
  "description": "TowerClub financial web application",
  "main": "index.html",
  "scripts": {
    "dev": "netlify dev",
    "build": "echo 'No build step required for static HTML'",
    "deploy": "netlify deploy --prod"
  },
  "dependencies": {
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "netlify-cli": "^17.0.0"
  },
  "keywords": ["finance", "web-app", "netlify"],
  "author": "TowerClub Team",
  "license": "MIT"
}
```

#### Create `netlify.toml`
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Update `.gitignore`
```
node_modules/
.env
.env.local
.netlify/
dist/
*.log
.DS_Store
```

## Database Setup

### Option 1: Netlify DB (Recommended for Integration)

1. **Create Netlify DB Instance**
   - Go to your Netlify dashboard
   - Navigate to "Database" section
   - Click "Create database"
   - Choose "PostgreSQL" (powered by Neon)
   - Select your preferred region
   - Note down the connection string

2. **Database Schema Setup**
   Create the following tables in your database:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Virtual cards table
CREATE TABLE virtual_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_id INTEGER REFERENCES virtual_cards(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    merchant_name VARCHAR(100),
    transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'transfer', 'refund'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    social_media JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option 2: External Database (Supabase, MongoDB Atlas, etc.)

If you prefer an external database:

1. **Supabase Setup**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Use the same schema as above
   - Copy the connection string

2. **MongoDB Atlas Setup**
   - Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create new cluster
   - Set up database and collections
   - Copy the connection string

## Netlify Configuration

### 1. Connect Repository to Netlify

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/towerclub-web-app.git
   git push -u origin main
   ```

2. **Connect in Netlify Dashboard**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build` (or leave empty for static sites)
     - Publish directory: `.` (root directory)

### 2. Configure Build Settings

In your Netlify dashboard:
- **Build command**: `npm run build` (or leave empty)
- **Publish directory**: `.`
- **Node version**: 18.x

## Serverless Functions

### 1. Authentication Functions

#### Create `netlify/functions/login.js`
```javascript
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { email, password } = JSON.parse(event.body);
        
        await client.connect();
        
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name
                }
            })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
};
```

#### Update `netlify/functions/register.js`
```javascript
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { username, email, password, first_name, last_name, phone } = JSON.parse(event.body);
        
        // Validate input
        if (!username || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        await client.connect();
        
        // Check if user already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await client.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name',
            [username, email, passwordHash, first_name, last_name, phone]
        );

        const newUser = result.rows[0];

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name
                }
            })
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to register user' })
        };
    } finally {
        await client.end();
    }
};
```

### 2. Virtual Card Functions

#### Create `netlify/functions/virtual-cards.js`
```javascript
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Verify JWT token
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await client.connect();

        switch (event.httpMethod) {
            case 'GET':
                // Get user's virtual cards
                const cards = await client.query(
                    'SELECT id, card_number, card_holder_name, expiry_month, expiry_year, is_active, created_at FROM virtual_cards WHERE user_id = $1',
                    [userId]
                );

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ cards: cards.rows })
                };

            case 'POST':
                // Create new virtual card
                const { card_holder_name } = JSON.parse(event.body);
                
                // Generate card number (simplified - in production, use proper card generation)
                const cardNumber = '4' + Math.random().toString().slice(2, 16);
                const expiryMonth = Math.floor(Math.random() * 12) + 1;
                const expiryYear = new Date().getFullYear() + 3;
                const cvvHash = Math.random().toString(36).substring(2, 8);

                const newCard = await client.query(
                    'INSERT INTO virtual_cards (user_id, card_number, card_holder_name, expiry_month, expiry_year, cvv_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, card_number, card_holder_name, expiry_month, expiry_year, is_active',
                    [userId, cardNumber, card_holder_name, expiryMonth, expiryYear, cvvHash]
                );

                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: JSON.stringify({ card: newCard.rows[0] })
                };

            default:
                return { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        console.error('Virtual card error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
};
```

### 3. Transaction Functions

#### Create `netlify/functions/transactions.js`
```javascript
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Verify JWT token
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await client.connect();

        switch (event.httpMethod) {
            case 'GET':
                // Get user's transactions
                const transactions = await client.query(
                    `SELECT t.*, vc.card_number 
                     FROM transactions t 
                     LEFT JOIN virtual_cards vc ON t.card_id = vc.id 
                     WHERE t.user_id = $1 
                     ORDER BY t.created_at DESC`,
                    [userId]
                );

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ transactions: transactions.rows })
                };

            case 'POST':
                // Create new transaction
                const { amount, currency, merchant_name, transaction_type, card_id } = JSON.parse(event.body);
                
                const newTransaction = await client.query(
                    'INSERT INTO transactions (user_id, card_id, amount, currency, merchant_name, transaction_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [userId, card_id, amount, currency || 'USD', merchant_name, transaction_type]
                );

                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: JSON.stringify({ transaction: newTransaction.rows[0] })
                };

            default:
                return { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        console.error('Transaction error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
};
```

## Frontend Optimization

### 1. Update HTML Files for API Integration

#### Update `pages/login.html` - Add JavaScript for API calls
```javascript
// Add this script section to your login.html
<script>
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/.netlify/functions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = '/pages/dashboard.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Add event listener to your login form
document.getElementById('loginForm').addEventListener('submit', handleLogin);
</script>
```

#### Update `pages/register.html` - Add JavaScript for API calls
```javascript
// Add this script section to your register.html
<script>
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone')
    };
    
    try {
        const response = await fetch('/.netlify/functions/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/pages/login.html';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Add event listener to your register form
document.getElementById('registerForm').addEventListener('submit', handleRegister);
</script>
```

### 2. Create API Utility Functions

#### Create `static/js/api.js`
```javascript
// API utility functions
class API {
    static baseURL = '/.netlify/functions';
    
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        return response.json();
    }
    
    // Authentication
    static async login(email, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
    
    static async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    // Virtual Cards
    static async getVirtualCards() {
        return this.request('/virtual-cards');
    }
    
    static async createVirtualCard(cardData) {
        return this.request('/virtual-cards', {
            method: 'POST',
            body: JSON.stringify(cardData)
        });
    }
    
    // Transactions
    static async getTransactions() {
        return this.request('/transactions');
    }
    
    static async createTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }
}

// Auth utilities
class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
    
    static getUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
    
    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/pages/login.html';
    }
    
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
        }
    }
}

// Export for use in other files
window.API = API;
window.Auth = Auth;
</script>
```

## Environment Variables

### 1. Local Development (.env file)
Create a `.env` file in your project root:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 2. Netlify Environment Variables

In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add the following variables:
   - `DATABASE_URL`: Your database connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: `production`

## Deployment Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Locally
```bash
npm run dev
```

### 3. Deploy to Netlify
```bash
# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### 4. Automatic Deployment Setup

1. **Enable automatic deployments** in Netlify dashboard
2. **Set up branch deployments**:
   - Main branch → Production
   - Feature branches → Preview deployments

## Testing & Verification

### 1. Function Testing
Test your serverless functions locally:
```bash
netlify dev
```

### 2. Database Connection Test
Create a test function to verify database connectivity:
```javascript
// netlify/functions/test-db.js
const { Client } = require('pg');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const result = await client.query('SELECT NOW()');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database connection successful',
                timestamp: result.rows[0].now
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Database connection failed',
                details: error.message
            })
        };
    } finally {
        await client.end();
    }
};
```

### 3. User Flow Testing
1. **Registration flow**: Create new user account
2. **Login flow**: Authenticate existing user
3. **Virtual card creation**: Generate new virtual card
4. **Transaction processing**: Create and view transactions
5. **Profile management**: Update user profile

## Monitoring & Maintenance

### 1. Netlify Analytics
- Enable analytics in Netlify dashboard
- Monitor function execution times
- Track user engagement

### 2. Database Monitoring
- Set up database connection pooling
- Monitor query performance
- Set up automated backups

### 3. Error Tracking
- Implement proper error logging
- Set up alerts for function failures
- Monitor API response times

### 4. Security Considerations
- Use HTTPS for all communications
- Implement rate limiting
- Validate all user inputs
- Use secure password hashing
- Implement proper CORS policies

## Troubleshooting Common Issues

### 1. Function Timeout
- Optimize database queries
- Implement connection pooling
- Use async/await properly

### 2. CORS Issues
- Configure proper CORS headers
- Check function response headers
- Test with different origins

### 3. Database Connection Issues
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is accessible from Netlify

### 4. JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format

## Next Steps

1. **Implement additional features**:
   - Password reset functionality
   - Email verification
   - Two-factor authentication
   - Real-time notifications

2. **Performance optimization**:
   - Implement caching strategies
   - Optimize database queries
   - Use CDN for static assets

3. **Security enhancements**:
   - Implement rate limiting
   - Add input validation
   - Set up security headers

4. **Monitoring and analytics**:
   - Set up error tracking
   - Implement user analytics
   - Monitor performance metrics

This guide provides a complete foundation for deploying your TowerClub web app to Netlify with full database integration and user interaction capabilities. Follow each step carefully, and your app will be ready for production use! 