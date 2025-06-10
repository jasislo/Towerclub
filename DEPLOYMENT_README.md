# TowerClub Web App - Quick Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites
- [Netlify Account](https://netlify.com)
- [GitHub Account](https://github.com)
- [Neon Account](https://neon.tech) (for PostgreSQL)

### 2. Database Setup
1. Create a Neon PostgreSQL database
2. Run the SQL schema from `NETLIFY_DEPLOYMENT_GUIDE.md`
3. Copy your database connection string

### 3. Deploy to Netlify

#### Option A: Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: `production`

#### Option B: Manual Deployment
```bash
# Install dependencies
npm install

# Deploy to Netlify
netlify deploy --prod
```

### 4. Test Your Deployment
1. Visit your Netlify URL
2. Test the database connection: `/.netlify/functions/test-db`
3. Try registering a new user
4. Test login functionality

## 📁 Project Structure
```
towerclub-web-app/
├── netlify/
│   └── functions/
│       ├── register.js      # User registration
│       ├── login.js         # User authentication
│       ├── virtual-cards.js # Virtual card management
│       ├── transactions.js  # Transaction handling
│       └── test-db.js       # Database connectivity test
├── pages/                   # HTML pages
├── static/
│   └── js/
│       └── api.js          # Frontend API utilities
├── package.json            # Dependencies
├── netlify.toml           # Netlify configuration
└── NETLIFY_DEPLOYMENT_GUIDE.md # Complete guide
```

## 🔧 Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

## 🧪 Testing
- **Database**: `/.netlify/functions/test-db`
- **Registration**: `/.netlify/functions/register`
- **Login**: `/.netlify/functions/login`
- **Virtual Cards**: `/.netlify/functions/virtual-cards`
- **Transactions**: `/.netlify/functions/transactions`

## 📞 Support
For detailed instructions, see `NETLIFY_DEPLOYMENT_GUIDE.md`

## 🚨 Common Issues
1. **CORS errors**: Check function response headers
2. **Database connection**: Verify DATABASE_URL format
3. **JWT errors**: Ensure JWT_SECRET is set
4. **Function timeouts**: Optimize database queries

## 🔒 Security Notes
- Use HTTPS for all communications
- Implement rate limiting in production
- Validate all user inputs
- Use secure password hashing
- Set up proper CORS policies 