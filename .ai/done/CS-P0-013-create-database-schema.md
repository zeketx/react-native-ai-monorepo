# Task: Create Complete Database Schema

**ID:** CS-P0-013  
**Phase:** Foundation  
**Dependencies:** CS-P0-012

## Objective
Create all database tables required for the ClientSync platform including clients, trips, preferences, allowlist, and audit logs with proper relationships and constraints.

## Acceptance Criteria
- [x] All tables are created successfully
- [x] Foreign key relationships are established
- [x] Indexes are created for performance
- [x] Enum types are defined
- [x] Updated_at triggers are functional
- [x] No SQL errors during execution

## Implementation Notes
1. Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE client_tier AS ENUM ('standard', 'premium', 'elite');
CREATE TYPE trip_status AS ENUM ('planning', 'confirmed', 'in-progress', 'completed');
CREATE TYPE user_role AS ENUM ('client', 'organizer', 'admin');

-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles table
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client preferences table
CREATE TABLE public.client_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  hotel_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  activity_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  dining_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  tier client_tier NOT NULL DEFAULT 'standard',
  profile_id UUID REFERENCES public.client_profiles(id),
  preferences_id UUID REFERENCES public.client_preferences(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status trip_status NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allowlist table
CREATE TABLE public.allowlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  tier client_tier NOT NULL DEFAULT 'standard',
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_tier ON public.clients(tier);
CREATE INDEX idx_trips_client_id ON public.trips(client_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_allowlist_email ON public.allowlist(email);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
```

2. Create updated_at trigger function:
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

3. Create the user creation trigger:
```sql
-- Create trigger for new user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Testing
- Verify all tables exist: 
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
  ```
- Check enum types:
  ```sql
  SELECT typname FROM pg_type WHERE typtype = 'e';
  ```

## Estimated Effort
2 hours