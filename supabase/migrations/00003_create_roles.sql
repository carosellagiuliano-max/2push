-- ============================================
-- Migration: 00003_create_roles
-- Description: Create roles and user_roles tables for RBAC
-- ============================================

-- ============================================
-- ROLES TABLE
-- ============================================
-- Define available roles (seeded, rarely changed)

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name role_name NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments
COMMENT ON TABLE roles IS 'Role definitions for RBAC';
COMMENT ON COLUMN roles.is_system IS 'System roles cannot be deleted';

-- ============================================
-- USER_ROLES TABLE
-- ============================================
-- Assigns roles to users, scoped by salon

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,  -- NULL for global roles like HQ
  role_name role_name NOT NULL,

  -- Who assigned this role
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: one role per user per salon
  UNIQUE(profile_id, salon_id, role_name)
);

-- Indexes
CREATE INDEX idx_user_roles_profile ON user_roles(profile_id);
CREATE INDEX idx_user_roles_salon ON user_roles(salon_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_name);
CREATE INDEX idx_user_roles_lookup ON user_roles(profile_id, salon_id);

-- Comments
COMMENT ON TABLE user_roles IS 'User-salon-role assignments for RBAC';
COMMENT ON COLUMN user_roles.salon_id IS 'NULL for global roles (e.g., HQ role)';

-- ============================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================

-- Check if user has a specific role in a salon
CREATE OR REPLACE FUNCTION has_role(
  p_profile_id UUID,
  p_salon_id UUID,
  p_role_names role_name[]
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE profile_id = p_profile_id
      AND (salon_id = p_salon_id OR salon_id IS NULL)
      AND role_name = ANY(p_role_names)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user has a specific role in a salon
CREATE OR REPLACE FUNCTION current_user_has_role(
  p_salon_id UUID,
  p_role_names role_name[]
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role(auth.uid(), p_salon_id, p_role_names);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all salon_ids the current user has access to
CREATE OR REPLACE FUNCTION get_user_salon_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT salon_id
  FROM user_roles
  WHERE profile_id = auth.uid()
    AND salon_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin or manager for a salon
CREATE OR REPLACE FUNCTION is_salon_admin_or_manager(p_salon_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_has_role(p_salon_id, ARRAY['admin', 'manager']::role_name[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is staff (admin, manager, or mitarbeiter) for a salon
CREATE OR REPLACE FUNCTION is_salon_staff(p_salon_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_has_role(p_salon_id, ARRAY['admin', 'manager', 'mitarbeiter']::role_name[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has HQ role (cross-salon access)
CREATE OR REPLACE FUNCTION is_hq_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE profile_id = auth.uid()
      AND role_name = 'hq'
      AND salon_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comments
COMMENT ON FUNCTION has_role IS 'Check if a user has any of the specified roles for a salon';
COMMENT ON FUNCTION current_user_has_role IS 'Check if current authenticated user has specified roles';
COMMENT ON FUNCTION get_user_salon_ids IS 'Get all salon IDs the current user has access to';
COMMENT ON FUNCTION is_salon_staff IS 'Check if current user is admin, manager, or mitarbeiter for salon';
COMMENT ON FUNCTION is_hq_user IS 'Check if current user has global HQ role';

-- ============================================
-- SEED DEFAULT ROLES
-- ============================================

INSERT INTO roles (role_name, display_name, description, is_system) VALUES
  ('admin', 'Administrator', 'Full access to salon management', true),
  ('manager', 'Manager', 'Can manage staff, bookings, and most settings', true),
  ('mitarbeiter', 'Mitarbeiter', 'Staff member with limited admin access', true),
  ('kunde', 'Kunde', 'Customer with access to customer portal', true),
  ('hq', 'Headquarters', 'Cross-salon access for multi-salon management', true);
