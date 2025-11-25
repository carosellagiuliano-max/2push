-- ============================================
-- Migration: 00006_create_booking
-- Description: Create booking-related tables (appointments, hours, rules)
-- ============================================

-- ============================================
-- OPENING_HOURS TABLE
-- ============================================
-- Salon opening hours per day of week

CREATE TABLE opening_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,

  -- Time as minutes from midnight
  open_minutes INTEGER NOT NULL CHECK (open_minutes >= 0 AND open_minutes < 1440),
  close_minutes INTEGER NOT NULL CHECK (close_minutes > 0 AND close_minutes <= 1440),

  -- Closed on this day?
  is_closed BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, day_of_week),
  CHECK (is_closed = true OR close_minutes > open_minutes)
);

-- Indexes
CREATE INDEX idx_opening_hours_salon ON opening_hours(salon_id);

-- Trigger for updated_at
CREATE TRIGGER update_opening_hours_updated_at
  BEFORE UPDATE ON opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE opening_hours IS 'Salon opening hours per day of week';
COMMENT ON COLUMN opening_hours.open_minutes IS 'Opening time as minutes from midnight';
COMMENT ON COLUMN opening_hours.close_minutes IS 'Closing time as minutes from midnight';

-- ============================================
-- BOOKING_RULES TABLE
-- ============================================
-- Booking configuration per salon

CREATE TABLE booking_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL UNIQUE REFERENCES salons(id) ON DELETE CASCADE,

  -- Time constraints
  min_lead_time_minutes INTEGER NOT NULL DEFAULT 60,      -- Minimum advance booking time
  max_horizon_days INTEGER NOT NULL DEFAULT 60,           -- Maximum days in advance
  cancellation_cutoff_hours INTEGER NOT NULL DEFAULT 24,  -- Hours before appointment

  -- Slot settings
  slot_granularity_minutes INTEGER NOT NULL DEFAULT 15,   -- Slot intervals (15, 30, etc.)
  default_buffer_minutes INTEGER NOT NULL DEFAULT 0,      -- Default buffer between appointments

  -- Deposit and no-show
  deposit_required_percent INTEGER DEFAULT 0,             -- 0-100
  no_show_policy TEXT DEFAULT 'none',                     -- 'none', 'charge_deposit', 'charge_full'
  no_show_fee_percent INTEGER DEFAULT 0,

  -- Reservation settings
  reservation_timeout_minutes INTEGER NOT NULL DEFAULT 15, -- How long a slot is held
  max_reservations_per_customer INTEGER NOT NULL DEFAULT 2, -- Max concurrent reservations

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER update_booking_rules_updated_at
  BEFORE UPDATE ON booking_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE booking_rules IS 'Booking configuration per salon';
COMMENT ON COLUMN booking_rules.slot_granularity_minutes IS 'Time slots are offered in these intervals';
COMMENT ON COLUMN booking_rules.reservation_timeout_minutes IS 'How long a reserved slot is held before expiring';

-- ============================================
-- BLOCKED_TIMES TABLE
-- ============================================
-- Blocked periods for salon or specific staff

CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,  -- NULL = entire salon blocked

  -- Time period
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Type and reason
  block_type blocked_time_type NOT NULL DEFAULT 'other',
  reason TEXT,
  is_public BOOLEAN DEFAULT false,  -- Show reason publicly?

  -- Who created
  created_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (ends_at > starts_at)
);

-- Indexes
CREATE INDEX idx_blocked_times_salon ON blocked_times(salon_id);
CREATE INDEX idx_blocked_times_staff ON blocked_times(staff_id);
CREATE INDEX idx_blocked_times_period ON blocked_times(salon_id, starts_at, ends_at);

-- Trigger for updated_at
CREATE TRIGGER update_blocked_times_updated_at
  BEFORE UPDATE ON blocked_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE blocked_times IS 'Blocked time periods for salon or specific staff';
COMMENT ON COLUMN blocked_times.staff_id IS 'NULL means entire salon is blocked';

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
-- Core appointment records

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,

  -- Time
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Status
  status appointment_status NOT NULL DEFAULT 'reserved',
  reserved_until TIMESTAMPTZ,  -- For temporary holds

  -- Deposit
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,

  -- Pricing (snapshot at booking time)
  total_price DECIMAL(10, 2),
  total_tax DECIMAL(10, 2),

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,

  -- No-show
  marked_no_show_at TIMESTAMPTZ,
  marked_no_show_by UUID REFERENCES profiles(id),
  no_show_fee_charged DECIMAL(10, 2),

  -- Notes
  customer_notes TEXT,  -- Notes from customer
  internal_notes TEXT,  -- Notes from staff (not visible to customer)

  -- Source
  booked_online BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (ends_at > starts_at)
);

-- Indexes
CREATE INDEX idx_appointments_salon ON appointments(salon_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_time ON appointments(salon_id, starts_at, ends_at);
CREATE INDEX idx_appointments_status ON appointments(salon_id, status);
CREATE INDEX idx_appointments_staff_time ON appointments(staff_id, starts_at, ends_at);

-- Unique constraint to prevent double bookings
-- Only applies to active statuses (reserved, requested, confirmed)
CREATE UNIQUE INDEX idx_appointments_no_double_booking
  ON appointments(staff_id, starts_at)
  WHERE status IN ('reserved', 'requested', 'confirmed');

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE appointments IS 'Appointment bookings';
COMMENT ON COLUMN appointments.reserved_until IS 'Expiry time for reserved status';
COMMENT ON COLUMN appointments.customer_notes IS 'Notes visible to customer';
COMMENT ON COLUMN appointments.internal_notes IS 'Staff-only notes';

-- ============================================
-- APPOINTMENT_SERVICES TABLE
-- ============================================
-- Services included in an appointment

CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,

  -- Snapshot at booking time
  service_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  snapshot_price DECIMAL(10, 2) NOT NULL,
  snapshot_tax_rate_percent DECIMAL(5, 3) NOT NULL,

  -- Order of services
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service ON appointment_services(service_id);

-- Comments
COMMENT ON TABLE appointment_services IS 'Services included in an appointment';
COMMENT ON COLUMN appointment_services.snapshot_price IS 'Price at time of booking';

-- ============================================
-- WAITLIST_ENTRIES TABLE
-- ============================================
-- Waitlist for preferred times

CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Preferences
  preferred_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  preferred_date_start DATE NOT NULL,
  preferred_date_end DATE NOT NULL,
  preferred_time_start INTEGER,  -- Minutes from midnight
  preferred_time_end INTEGER,    -- Minutes from midnight

  -- Requested services
  service_ids UUID[] NOT NULL,

  -- Status
  status waitlist_status NOT NULL DEFAULT 'active',
  notified_at TIMESTAMPTZ,
  converted_appointment_id UUID REFERENCES appointments(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (preferred_date_end >= preferred_date_start)
);

-- Indexes
CREATE INDEX idx_waitlist_salon ON waitlist_entries(salon_id);
CREATE INDEX idx_waitlist_customer ON waitlist_entries(customer_id);
CREATE INDEX idx_waitlist_active ON waitlist_entries(salon_id, status) WHERE status = 'active';
CREATE INDEX idx_waitlist_dates ON waitlist_entries(salon_id, preferred_date_start, preferred_date_end);

-- Trigger for updated_at
CREATE TRIGGER update_waitlist_entries_updated_at
  BEFORE UPDATE ON waitlist_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE waitlist_entries IS 'Waitlist for preferred booking times';

-- ============================================
-- HELPER FUNCTION: Check for overlapping appointments
-- ============================================

CREATE OR REPLACE FUNCTION check_appointment_overlap(
  p_staff_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM appointments
    WHERE staff_id = p_staff_id
      AND status IN ('reserved', 'requested', 'confirmed')
      AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
      AND starts_at < p_ends_at
      AND ends_at > p_starts_at
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_appointment_overlap IS 'Check if a time slot overlaps with existing appointments';
