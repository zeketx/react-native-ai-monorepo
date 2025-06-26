-- Database Triggers and Functions
-- This script creates all triggers and functions for the ClientSync database
-- Run this AFTER running 01-database-schema.sql

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_client_preferences_updated_at
  BEFORE UPDATE ON public.client_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enhanced user profile creation function
-- This function is called when a new user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles table when a new user signs up
  INSERT INTO public.user_profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,           -- Use the auth.users.id as primary key
    NEW.email,        -- Copy email from auth.users
    'client'::user_role,  -- Default role for new users
    NOW(),            -- Set creation timestamp
    NOW()             -- Set update timestamp
  );
  
  -- Check if email is in allowlist and create client record if found
  INSERT INTO public.clients (
    id,
    email,
    tier,
    onboarding_completed,
    created_at,
    updated_at
  )
  SELECT 
    NEW.id,
    NEW.email,
    COALESCE(al.tier, 'standard'::client_tier),
    FALSE,
    NOW(),
    NOW()
  FROM public.allowlist al
  WHERE al.email = NEW.email AND al.is_active = TRUE
  ON CONFLICT (id) DO NOTHING;  -- Avoid duplicate client records
  
  -- Mark allowlist entry as used
  UPDATE public.allowlist 
  SET used_at = NOW(), is_active = FALSE 
  WHERE email = NEW.email AND is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    timestamp
  )
  VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent,
    NOW()
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client tier benefits
CREATE OR REPLACE FUNCTION public.get_tier_benefits(client_tier_param client_tier)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE client_tier_param
    WHEN 'standard' THEN '{
      "flight_classes": ["economy"],
      "organizer_support": false,
      "priority_booking": false,
      "concierge_service": false
    }'::jsonb
    WHEN 'premium' THEN '{
      "flight_classes": ["economy", "premium_economy", "business"],
      "organizer_support": true,
      "priority_booking": true,
      "concierge_service": false
    }'::jsonb
    WHEN 'elite' THEN '{
      "flight_classes": ["business", "first"],
      "organizer_support": true,
      "priority_booking": true,
      "concierge_service": true
    }'::jsonb
    ELSE '{}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if email is allowed to register
CREATE OR REPLACE FUNCTION public.is_email_allowed(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.allowlist 
    WHERE email = check_email AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for functions
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, UUID, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tier_benefits(client_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_email_allowed(TEXT) TO authenticated;