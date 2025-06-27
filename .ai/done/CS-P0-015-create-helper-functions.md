# Task: Create Database Helper Functions

**ID:** CS-P0-015  
**Phase:** Foundation  
**Dependencies:** CS-P0-014

## Objective
Create PostgreSQL helper functions for common database operations including email allowlist checking, audit logging, and data management utilities.

## Acceptance Criteria
- [x] Email allowlist check function is created
- [x] Audit log creation function is implemented
- [x] All functions have proper security definer
- [x] Functions handle edge cases gracefully
- [x] Return types are properly defined

## Implementation Notes
1. Create email allowlist check function:
```sql
-- Function to check if email is in allowlist
CREATE OR REPLACE FUNCTION public.check_email_allowlist(email_to_check TEXT)
RETURNS TABLE (
  allowed BOOLEAN,
  tier client_tier
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END as allowed,
    MAX(a.tier) as tier
  FROM public.allowlist a
  WHERE LOWER(a.email) = LOWER(email_to_check);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_email_allowlist TO anon, authenticated;
```

2. Create audit log function:
```sql
-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(), 
    p_action, 
    p_resource_type, 
    p_resource_id, 
    p_details,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;
```

3. Create client initialization function:
```sql
-- Function to initialize client profile and preferences
CREATE OR REPLACE FUNCTION public.initialize_client_data(
  p_user_id UUID,
  p_email TEXT,
  p_tier client_tier
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile_id UUID;
  v_preferences_id UUID;
BEGIN
  -- Create empty profile
  INSERT INTO public.client_profiles (
    first_name, last_name, phone, emergency_contact
  ) VALUES (
    '', '', '', '{}'::jsonb
  ) RETURNING id INTO v_profile_id;
  
  -- Create empty preferences
  INSERT INTO public.client_preferences (
    flight_preferences, hotel_preferences, 
    activity_preferences, dining_preferences
  ) VALUES (
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  ) RETURNING id INTO v_preferences_id;
  
  -- Create client record
  INSERT INTO public.clients (
    id, email, tier, profile_id, preferences_id
  ) VALUES (
    p_user_id, p_email, p_tier, v_profile_id, v_preferences_id
  );
  
  -- Log the action
  PERFORM public.create_audit_log(
    'client_initialized', 
    'clients', 
    p_user_id, 
    jsonb_build_object('tier', p_tier)
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Create trip summary function:
```sql
-- Function to get trip summary for a client
CREATE OR REPLACE FUNCTION public.get_client_trip_summary(p_client_id UUID)
RETURNS TABLE (
  total_trips INTEGER,
  upcoming_trips INTEGER,
  completed_trips INTEGER,
  next_trip_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_trips,
    COUNT(*) FILTER (WHERE status IN ('planning', 'confirmed') 
      AND start_date > CURRENT_DATE)::INTEGER as upcoming_trips,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_trips,
    MIN(start_date) FILTER (WHERE start_date > CURRENT_DATE) as next_trip_date
  FROM public.trips
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing
1. Test allowlist function:
   ```sql
   SELECT * FROM public.check_email_allowlist('test@example.com');
   ```

2. Test audit logging:
   ```sql
   SELECT public.create_audit_log('test_action', 'test_resource');
   ```

3. Verify security definer works for non-admin users

## Estimated Effort
1.5 hours