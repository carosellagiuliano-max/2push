-- ============================================
-- Migration: 00005_create_services
-- Description: Create services, categories, and pricing tables
-- ============================================

-- ============================================
-- TAX_RATES TABLE
-- ============================================
-- VAT rates with validity periods

CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  -- Rate info
  code TEXT NOT NULL,           -- e.g., "standard", "reduced", "exempt"
  description TEXT,             -- e.g., "Normalsatz 8.1%"
  rate_percent DECIMAL(5, 3) NOT NULL,  -- e.g., 8.100 for 8.1%

  -- Validity period
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,

  -- Status
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, code, valid_from)
);

-- Indexes
CREATE INDEX idx_tax_rates_salon ON tax_rates(salon_id);
CREATE INDEX idx_tax_rates_current ON tax_rates(salon_id, valid_from, valid_to);

-- Trigger for updated_at
CREATE TRIGGER update_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE tax_rates IS 'VAT rates with validity periods for Swiss compliance';
COMMENT ON COLUMN tax_rates.rate_percent IS 'Rate as percentage, e.g., 8.100 for 8.1%';

-- ============================================
-- SERVICE_CATEGORIES TABLE
-- ============================================
-- Service groupings (e.g., "Schnitt", "Coloration", "Styling")

CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  -- Category info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Icon identifier for UI

  -- Display
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, slug)
);

-- Indexes
CREATE INDEX idx_service_categories_salon ON service_categories(salon_id);
CREATE INDEX idx_service_categories_sort ON service_categories(salon_id, sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE service_categories IS 'Service category groupings per salon';

-- ============================================
-- SERVICES TABLE
-- ============================================
-- Bookable services

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,

  -- Service info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,  -- For listings

  -- Duration
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,

  -- Booking settings
  is_online_bookable BOOLEAN NOT NULL DEFAULT true,
  requires_deposit BOOLEAN DEFAULT false,
  max_advance_days INTEGER,  -- Override salon default

  -- Display
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(salon_id, slug)
);

-- Indexes
CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_bookable ON services(salon_id, is_online_bookable, is_active)
  WHERE is_online_bookable = true AND is_active = true;
CREATE INDEX idx_services_sort ON services(salon_id, sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE services IS 'Bookable services per salon';
COMMENT ON COLUMN services.duration_minutes IS 'Base duration in minutes';
COMMENT ON COLUMN services.buffer_before_minutes IS 'Prep time before service';
COMMENT ON COLUMN services.buffer_after_minutes IS 'Cleanup time after service';

-- ============================================
-- SERVICE_PRICES TABLE
-- ============================================
-- Price history with validity periods
-- Allows price changes without affecting historical data

CREATE TABLE service_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id),

  -- Price
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),

  -- Validity period
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints: no overlapping validity periods per service
  UNIQUE(service_id, valid_from)
);

-- Indexes
CREATE INDEX idx_service_prices_service ON service_prices(service_id);
CREATE INDEX idx_service_prices_current ON service_prices(service_id, valid_from, valid_to);

-- Comments
COMMENT ON TABLE service_prices IS 'Service price history with validity periods';
COMMENT ON COLUMN service_prices.price IS 'Price in salon currency (CHF)';

-- ============================================
-- STAFF_SERVICE_SKILLS TABLE
-- ============================================
-- Which services each staff member can perform

CREATE TABLE staff_service_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Skill level (for future use, e.g., pricing tiers)
  skill_level INTEGER DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 5),

  -- Custom duration for this staff (override service default)
  custom_duration_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(staff_id, service_id)
);

-- Indexes
CREATE INDEX idx_staff_service_skills_staff ON staff_service_skills(staff_id);
CREATE INDEX idx_staff_service_skills_service ON staff_service_skills(service_id);

-- Comments
COMMENT ON TABLE staff_service_skills IS 'Staff-service capability mapping';
COMMENT ON COLUMN staff_service_skills.custom_duration_minutes IS 'Override duration if staff needs more/less time';

-- ============================================
-- HELPER FUNCTION: Get current price for service
-- ============================================

CREATE OR REPLACE FUNCTION get_current_service_price(p_service_id UUID)
RETURNS TABLE (
  price DECIMAL(10, 2),
  tax_rate_percent DECIMAL(5, 3),
  tax_rate_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.price,
    tr.rate_percent,
    sp.tax_rate_id
  FROM service_prices sp
  JOIN tax_rates tr ON sp.tax_rate_id = tr.id
  WHERE sp.service_id = p_service_id
    AND sp.valid_from <= CURRENT_DATE
    AND (sp.valid_to IS NULL OR sp.valid_to >= CURRENT_DATE)
  ORDER BY sp.valid_from DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_service_price IS 'Get the current valid price and tax rate for a service';
