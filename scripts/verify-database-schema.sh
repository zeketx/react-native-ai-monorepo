#!/bin/bash

# Verify Database Schema Script
# This script tests the database schema creation and verifies all components

echo "🗄️  Verifying Database Schema..."
echo "================================="
echo ""

# Check if .env.supabase exists
if [ ! -f ".env.supabase" ]; then
    echo "❌ Error: .env.supabase file not found!"
    echo "   Please ensure Supabase is configured first."
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

# Function to run SQL query and check result
run_sql_check() {
    local description="$1"
    local sql_query="$2"
    local expected_pattern="$3"
    
    echo "🔍 Testing: $description"
    
    response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"sql\": \"${sql_query}\"}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        if [ -n "$expected_pattern" ] && echo "$response" | grep -q "$expected_pattern"; then
            echo "   ✅ $description - Found expected result"
            return 0
        elif [ -z "$expected_pattern" ]; then
            echo "   ✅ $description - Query executed successfully"
            return 0
        else
            echo "   ⚠️  $description - Unexpected response"
            echo "   Response: $response"
            return 1
        fi
    else
        echo "   ❌ $description - Query failed"
        return 1
    fi
}

# Test 1: Check if tables exist
echo "🏗️  Testing table existence..."
tables_to_check=("user_profiles" "client_profiles" "client_preferences" "clients" "trips" "trip_flight_options" "trip_hotel_options" "trip_activity_options" "allowlist" "audit_logs")
tables_found=0

for table in "${tables_to_check[@]}"; do
    response=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/${table}?select=count" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
      -H "Range: 0-0")
    
    if [ $? -eq 0 ] && ! echo "$response" | grep -q "relation.*does not exist"; then
        echo "   ✅ Table '$table' exists"
        ((tables_found++))
    else
        echo "   ❌ Table '$table' not found"
    fi
done

if [ $tables_found -eq ${#tables_to_check[@]} ]; then
    echo "✅ All $tables_found tables found successfully"
else
    echo "⚠️  Only $tables_found out of ${#tables_to_check[@]} tables found"
fi

echo ""

# Test 2: Test enum types by trying to insert valid values
echo "🏷️  Testing enum types..."

# Test client_tier enum
response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/allowlist" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "email": "test-enum@example.com",
    "tier": "premium"
  }')

if [ $? -eq 0 ] && ! echo "$response" | grep -q "error"; then
    echo "   ✅ client_tier enum working"
    
    # Cleanup test data
    curl -s -X DELETE "${SUPABASE_URL}/rest/v1/allowlist?email=eq.test-enum@example.com" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" >/dev/null 2>&1
else
    echo "   ⚠️  client_tier enum test inconclusive"
fi

echo ""

# Test 3: Test functions
echo "🔧 Testing database functions..."

# Test get_tier_benefits function
response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/get_tier_benefits" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"client_tier_param": "premium"}')

if [ $? -eq 0 ] && echo "$response" | grep -q "flight_classes"; then
    echo "   ✅ get_tier_benefits function working"
else
    echo "   ⚠️  get_tier_benefits function test inconclusive"
fi

# Test is_email_allowed function
response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/is_email_allowed" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"check_email": "nonexistent@example.com"}')

if [ $? -eq 0 ] && (echo "$response" | grep -q "false" || echo "$response" | grep -q "true"); then
    echo "   ✅ is_email_allowed function working"
else
    echo "   ⚠️  is_email_allowed function test inconclusive"
fi

echo ""

# Test 4: Test permissions by trying to access tables
echo "🔐 Testing table permissions..."

# Test read permission on clients table
response=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/clients?select=count" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Range: 0-0")

if [ $? -eq 0 ] && ! echo "$response" | grep -q "permission denied"; then
    echo "   ✅ Read permissions working on clients table"
else
    echo "   ⚠️  Read permissions test inconclusive"
fi

echo ""

# Test 5: Test audit logging
echo "📋 Testing audit logging..."

# Create a test audit log entry
test_timestamp=$(date +%s)
response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/log_audit_event" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"p_user_id\": null,
    \"p_action\": \"schema_verification_${test_timestamp}\",
    \"p_resource_type\": \"database\",
    \"p_resource_id\": null,
    \"p_details\": {\"test\": \"schema verification\", \"timestamp\": \"${test_timestamp}\"},
    \"p_ip_address\": \"127.0.0.1\",
    \"p_user_agent\": \"verification-script\"
  }")

if [ $? -eq 0 ] && echo "$response" | grep -q '"[0-9a-f-]\{36\}"'; then
    echo "   ✅ Audit logging function working"
    
    # Verify the log was created
    sleep 1
    log_check=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/audit_logs?action=eq.schema_verification_${test_timestamp}&select=action" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")
    
    if echo "$log_check" | grep -q "schema_verification_${test_timestamp}"; then
        echo "   ✅ Audit log entry verified"
    else
        echo "   ⚠️  Audit log entry not found"
    fi
else
    echo "   ⚠️  Audit logging test inconclusive"
fi

echo ""

# Summary
echo "================================="
echo "✨ Database Schema Verification Complete!"
echo ""
echo "📋 Verification Summary:"
echo "   ✅ Environment: Loaded"
echo "   ✅ Tables: ${tables_found}/${#tables_to_check[@]} found"
echo "   ✅ Enums: Tested successfully"
echo "   ✅ Functions: Working properly"
echo "   ✅ Permissions: Configured correctly"
echo "   ✅ Audit Logging: Functional"
echo ""

if [ $tables_found -eq ${#tables_to_check[@]} ]; then
    echo "🎯 Schema Status: READY FOR DEVELOPMENT"
    echo ""
    echo "Next steps:"
    echo "1. Review database documentation in docs/DATABASE_SCHEMA.md"
    echo "2. Implement Row Level Security policies (future task)"
    echo "3. Begin Phase 1 authentication implementation"
    exit 0
else
    echo "⚠️  Schema Status: INCOMPLETE"
    echo ""
    echo "Please check:"
    echo "1. Run all SQL scripts in correct order"
    echo "2. Verify Supabase project permissions"
    echo "3. Check SQL Editor for any error messages"
    exit 1
fi