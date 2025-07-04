#!/bin/bash

# TowerClub Web App - Netlify Deployment Script
echo "🚀 Starting TowerClub Web App deployment to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test database connection
echo "🔍 Testing database connection..."
curl -X GET https://your-site-name.netlify.app/.netlify/functions/test-db

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod

echo "✅ Deployment complete!"
echo "🌍 Your app is now live at: https://your-site-name.netlify.app"
echo "📊 Check your Netlify dashboard for analytics and monitoring." 