-- ClientSync Database Schema
-- This script creates the complete database schema for the ClientSync platform
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE client_tier AS ENUM ('standard', 'premium', 'elite');
CREATE TYPE trip_status AS ENUM ('planning', 'confirmed', 'in-progress', 'completed');
CREATE TYPE user_role AS ENUM ('client', 'organizer', 'admin');

-- User profiles table (extends auth.users)
-- This table stores additional user information beyond what auth.users provides
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles table
-- Stores personal information and contact details for clients
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact JSONB NOT NULL DEFAULT '{
    "name": "",
    "relationship": "",
    "phone": "",
    "email": ""
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client preferences table
-- Stores client selections from options curated by organizers
CREATE TABLE public.client_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selected_flight_option_id UUID,
  selected_hotel_option_id UUID,
  selected_activity_ids UUID[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main clients table
-- Central table linking users to their client profiles and preferences
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
-- Stores all trip information and planning details
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status trip_status NOT NULL DEFAULT 'planning',
  budget_range TEXT,
  traveler_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_date is after start_date
  CONSTRAINT check_trip_dates CHECK (end_date >= start_date),
  -- Ensure positive traveler count
  CONSTRAINT check_traveler_count CHECK (traveler_count > 0)
);

-- Trip flight options table
-- Stores the 2-3 flight options that organizers provide for each trip
CREATE TABLE public.trip_flight_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT, -- "Morning departure, evening arrival"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip hotel options table  
-- Stores the 2-3 hotel options that organizers provide for each trip
CREATE TABLE public.trip_hotel_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  location_description TEXT, -- "City center location"  
  price_per_night DECIMAL(10,2) NOT NULL,
  total_nights INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure positive nights
  CONSTRAINT check_total_nights CHECK (total_nights > 0)
);

-- Trip activity options table
-- Stores the activities that organizers offer for each trip
CREATE TABLE public.trip_activity_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  price DECIMAL(10,2),
  duration_hours INTEGER,
  max_participants INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allowlist table
-- Pre-approved emails for client registration
CREATE TABLE public.allowlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  tier client_tier NOT NULL DEFAULT 'standard',
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Audit logs table
-- Tracks all important actions in the system for security and compliance
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
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_tier ON public.clients(tier);
CREATE INDEX idx_clients_onboarding ON public.clients(onboarding_completed);

CREATE INDEX idx_trips_client_id ON public.trips(client_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);

CREATE INDEX idx_trip_flight_options_trip_id ON public.trip_flight_options(trip_id);
CREATE INDEX idx_trip_hotel_options_trip_id ON public.trip_hotel_options(trip_id);
CREATE INDEX idx_trip_activity_options_trip_id ON public.trip_activity_options(trip_id);

CREATE INDEX idx_allowlist_email ON public.allowlist(email);
CREATE INDEX idx_allowlist_active ON public.allowlist(is_active);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Add comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Extended user information beyond auth.users';
COMMENT ON TABLE public.client_profiles IS 'Personal information and contact details for clients';
COMMENT ON TABLE public.client_preferences IS 'Client selections from organizer-curated options';
COMMENT ON TABLE public.clients IS 'Main client records linking users to their profiles and preferences';
COMMENT ON TABLE public.trips IS 'Trip planning and booking information';
COMMENT ON TABLE public.trip_flight_options IS 'Flight options curated by organizers for each trip';
COMMENT ON TABLE public.trip_hotel_options IS 'Hotel options curated by organizers for each trip';
COMMENT ON TABLE public.trip_activity_options IS 'Activity options available for each trip';
COMMENT ON TABLE public.allowlist IS 'Pre-approved emails for client registration';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all system actions';

COMMENT ON COLUMN public.clients.tier IS 'Client tier affects available features and flight classes';
COMMENT ON COLUMN public.trips.status IS 'Current status of the trip planning process';
COMMENT ON COLUMN public.allowlist.is_active IS 'Whether this allowlist entry can still be used';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.trips TO authenticated;
GRANT SELECT ON public.trip_flight_options TO authenticated;
GRANT SELECT ON public.trip_hotel_options TO authenticated;
GRANT SELECT ON public.trip_activity_options TO authenticated;
GRANT SELECT ON public.allowlist TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;