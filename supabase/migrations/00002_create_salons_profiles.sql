-- ============================================
-- Migration: 00002_create_salons_profiles
-- Description: Create salons and profiles tables
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SALONS TABLE
-- ============================================
-- Central entity for multi-tenant architecture
-- All business data is scoped by salon_id

CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'CH',

  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Settings
  timezone TEXT NOT NULL DEFAULT 'Europe/Zurich',
  currency TEXT NOT NULL DEFAULT 'CHF',
  default_language TEXT NOT NULL DEFAULT 'de',

  -- Branding (can be extended for theming)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#b87444',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_is_active ON salons(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE salons IS 'Salon entities - all business data is scoped by salon_id';
COMMENT ON COLUMN salons.slug IS 'URL-friendly identifier, must be unique';
COMMENT ON COLUMN salons.timezone IS 'IANA timezone for all time calculations';

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with application-specific data
-- Links to Supabase Auth

CREATE TABLE profiles (
  -- ID matches auth.users.id
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,

  -- Profile image
  avatar_url TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to salons
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON salons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTH TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new user signs up';
