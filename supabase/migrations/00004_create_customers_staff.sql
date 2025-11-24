-- ============================================
-- Migration: 00004_create_customers_staff
-- Description: Create customers, staff, and related tables
-- ============================================

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
-- Customer records, scoped by salon
-- A profile can be a customer at multiple salons

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthday DATE,

  -- Preferences
  preferred_staff_id UUID,  -- FK added after staff table
  notes TEXT,               -- Internal notes (not visible to customer)

  -- Marketing
  accepts_marketing BOOLEAN DEFAULT false,

  -- Analytics
  first_visit_at TIMESTAMPTZ,
  last_visit_at TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  total_spend DECIMAL(10, 2) DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, email)
);

-- Indexes
CREATE INDEX idx_customers_salon ON customers(salon_id);
CREATE INDEX idx_customers_profile ON customers(profile_id);
CREATE INDEX idx_customers_email ON customers(salon_id, email);
CREATE INDEX idx_customers_name ON customers(salon_id, last_name, first_name);
CREATE INDEX idx_customers_last_visit ON customers(salon_id, last_visit_at DESC);
CREATE INDEX idx_customers_active ON customers(salon_id, is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE customers IS 'Customer records per salon';
COMMENT ON COLUMN customers.profile_id IS 'Links to auth user if customer has an account';
COMMENT ON COLUMN customers.notes IS 'Internal notes visible only to staff';

-- ============================================
-- CUSTOMER_ADDRESSES TABLE
-- ============================================
-- Multiple addresses per customer

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Address type
  address_type address_type NOT NULL DEFAULT 'both',
  label TEXT,  -- e.g., "Home", "Work"

  -- Address fields
  street TEXT NOT NULL,
  street2 TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  canton TEXT,
  country TEXT NOT NULL DEFAULT 'CH',

  -- Flags
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_default ON customer_addresses(customer_id, is_default) WHERE is_default = true;

-- Trigger for updated_at
CREATE TRIGGER update_customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE customer_addresses IS 'Customer address book';

-- ============================================
-- STAFF TABLE
-- ============================================
-- Staff members per salon

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Display info
  display_name TEXT NOT NULL,
  title TEXT,              -- e.g., "Senior Stylist"
  bio TEXT,
  avatar_url TEXT,

  -- Contact (can differ from profile)
  email TEXT,
  phone TEXT,

  -- Calendar display
  color TEXT DEFAULT '#3b82f6',  -- Calendar color

  -- Booking settings
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  booking_buffer_minutes INTEGER DEFAULT 0,  -- Extra time between appointments

  -- Order for display
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, profile_id)
);

-- Indexes
CREATE INDEX idx_staff_salon ON staff(salon_id);
CREATE INDEX idx_staff_profile ON staff(profile_id);
CREATE INDEX idx_staff_bookable ON staff(salon_id, is_bookable, is_active) WHERE is_bookable = true AND is_active = true;
CREATE INDEX idx_staff_sort ON staff(salon_id, sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE staff IS 'Staff members per salon';
COMMENT ON COLUMN staff.color IS 'Color for calendar display (hex)';
COMMENT ON COLUMN staff.booking_buffer_minutes IS 'Extra buffer time between appointments';

-- ============================================
-- STAFF_WORKING_HOURS TABLE
-- ============================================
-- Weekly schedule per staff member

CREATE TABLE staff_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,

  -- Time as minutes from midnight (avoids DST issues)
  start_minutes INTEGER NOT NULL CHECK (start_minutes >= 0 AND start_minutes < 1440),
  end_minutes INTEGER NOT NULL CHECK (end_minutes > 0 AND end_minutes <= 1440),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(staff_id, day_of_week),
  CHECK (end_minutes > start_minutes)
);

-- Indexes
CREATE INDEX idx_staff_working_hours_staff ON staff_working_hours(staff_id);

-- Comments
COMMENT ON TABLE staff_working_hours IS 'Weekly working schedule per staff member';
COMMENT ON COLUMN staff_working_hours.start_minutes IS 'Start time as minutes from midnight (e.g., 540 = 9:00)';
COMMENT ON COLUMN staff_working_hours.end_minutes IS 'End time as minutes from midnight (e.g., 1080 = 18:00)';

-- ============================================
-- STAFF_ABSENCES TABLE
-- ============================================
-- Planned absences (vacation, sick, etc.)

CREATE TABLE staff_absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  -- Absence period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Type and reason
  absence_type blocked_time_type NOT NULL DEFAULT 'vacation',
  reason TEXT,

  -- Who created this entry
  created_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_staff_absences_staff ON staff_absences(staff_id);
CREATE INDEX idx_staff_absences_dates ON staff_absences(staff_id, start_date, end_date);

-- Trigger for updated_at
CREATE TRIGGER update_staff_absences_updated_at
  BEFORE UPDATE ON staff_absences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE staff_absences IS 'Staff absence records (vacation, sick leave, etc.)';

-- ============================================
-- ADD FK FOR CUSTOMERS.PREFERRED_STAFF_ID
-- ============================================

ALTER TABLE customers
  ADD CONSTRAINT fk_customers_preferred_staff
  FOREIGN KEY (preferred_staff_id) REFERENCES staff(id) ON DELETE SET NULL;
