#!/bin/bash

# Verify Supabase Connection Script
# This script tests your Supabase configuration

echo "🔍 Verifying Supabase Configuration..."
echo "======================================="

# Check if .env.supabase exists
if [ ! -f ".env.supabase" ]; then
    echo "❌ Error: .env.supabase file not found!"
    echo "   Please copy .env.supabase.example and fill in your credentials."
    exit 1
fi

# Load environment variables
set -a
source .env.supabase
set +a

# Check if variables are set
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL is not set!"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_ANON_KEY is not set!"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""
echo "📋 Configuration:"
echo "   URL: $SUPABASE_URL"
echo "   Region: ${SUPABASE_REGION:-Not specified}"
echo "   Environment: ${ENVIRONMENT:-Not specified}"
echo ""

# Test API connection
echo "🌐 Testing API connection..."
response=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

if [ $? -eq 0 ]; then
    echo "✅ Successfully connected to Supabase API!"
    echo ""
    
    # Check if response contains swagger/openapi
    if echo "$response" | grep -q "swagger\|openapi"; then
        echo "✅ API specification received"
    else
        echo "⚠️  Warning: Unexpected API response"
    fi
else
    echo "❌ Failed to connect to Supabase API"
    echo "   Please check your configuration and try again."
    exit 1
fi

echo ""
echo "======================================="
echo "✨ Supabase configuration verified successfully!"
echo ""
echo "Next steps:"
echo "1. Continue with database schema setup (CS-P0-012)"
echo "2. Install Supabase client SDK"
echo "3. Configure authentication"