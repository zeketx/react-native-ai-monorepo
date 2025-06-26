-- Test Database Schema
-- This script tests the database schema and verifies everything is working correctly
-- Run this AFTER running 01-database-schema.sql and 02-triggers-functions.sql

-- Test 1: Verify all tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 
    'client_profiles', 
    'client_preferences', 
    'clients', 
    'trips',
    'trip_flight_options',
    'trip_hotel_options', 
    'trip_activity_options',
    'allowlist', 
    'audit_logs'
  )
ORDER BY table_name;

-- Test 2: Check enum types exist
SELECT 
  typname as enum_name,
  array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('client_tier', 'trip_status', 'user_role')
GROUP BY typname
ORDER BY typname;

-- Test 3: Verify foreign key relationships
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'user_profiles', 
    'client_profiles', 
    'client_preferences', 
    'clients', 
    'trips', 
    'allowlist', 
    'audit_logs'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- Test 4: Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 
    'client_profiles', 
    'client_preferences', 
    'clients', 
    'trips', 
    'allowlist', 
    'audit_logs'
  )
ORDER BY tablename, indexname;

-- Test 5: Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'user_profiles', 
    'client_profiles', 
    'client_preferences', 
    'clients', 
    'trips'
  )
ORDER BY event_object_table, trigger_name;

-- Test 6: Test tier benefits function
SELECT 
  tier,
  public.get_tier_benefits(tier::client_tier) as benefits
FROM (
  VALUES 
    ('standard'::client_tier),
    ('premium'::client_tier),
    ('elite'::client_tier)
) AS t(tier);

-- Test 7: Add sample allowlist entry and test email check
INSERT INTO public.allowlist (email, tier, is_active) 
VALUES ('test@clientsync.dev', 'premium', TRUE)
ON CONFLICT (email) DO NOTHING;

SELECT 
  email,
  public.is_email_allowed(email) as is_allowed
FROM (
  VALUES 
    ('test@clientsync.dev'),
    ('notallowed@example.com')
) AS t(email);

-- Test 8: Test audit logging function
SELECT public.log_audit_event(
  NULL::UUID,
  'schema_test',
  'database',
  NULL::UUID,
  '{"test": "schema verification"}'::jsonb,
  '127.0.0.1'::inet,
  'test-script'
) as audit_log_id;

-- Test 9: Verify audit log was created
SELECT 
  action,
  resource_type,
  details,
  timestamp
FROM public.audit_logs
WHERE action = 'schema_test'
ORDER BY timestamp DESC
LIMIT 1;

-- Test 10: Check table permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 
    'client_profiles', 
    'client_preferences', 
    'clients', 
    'trips', 
    'allowlist', 
    'audit_logs'
  )
  AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;