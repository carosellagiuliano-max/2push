-- ============================================
-- Migration: 20241125_create_loyalty_tables
-- Description: Create loyalty program tables for points tracking
-- ============================================

-- Loyalty tiers configuration table
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id TEXT PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  points_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
  benefits TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(salon_id, name)
);

-- Loyalty accounts for customers
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier_id TEXT NOT NULL DEFAULT 'bronze',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(salon_id, customer_id),
  CONSTRAINT positive_points CHECK (current_points >= 0),
  CONSTRAINT positive_lifetime CHECK (lifetime_points >= 0)
);

-- Loyalty transactions for audit trail
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_type loyalty_source_type NOT NULL,
  source_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_salon ON loyalty_accounts(salon_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account ON loyalty_transactions(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_source ON loyalty_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created ON loyalty_transactions(created_at DESC);

-- Updated at trigger for loyalty_accounts
CREATE OR REPLACE FUNCTION update_loyalty_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loyalty_accounts_updated_at
  BEFORE UPDATE ON loyalty_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_account_timestamp();

-- Updated at trigger for loyalty_tiers
CREATE TRIGGER loyalty_tiers_updated_at
  BEFORE UPDATE ON loyalty_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_account_timestamp();

-- Insert default tiers for a salon
CREATE OR REPLACE FUNCTION create_default_loyalty_tiers(p_salon_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO loyalty_tiers (id, salon_id, name, min_points, points_multiplier, benefits, sort_order)
  VALUES
    ('bronze', p_salon_id, 'Bronze', 0, 1.00, ARRAY['Punkte sammeln'], 0),
    ('silver', p_salon_id, 'Silber', 500, 1.25, ARRAY['25% Bonuspunkte', 'Prioritäts-Buchung'], 1),
    ('gold', p_salon_id, 'Gold', 1500, 1.50, ARRAY['50% Bonuspunkte', 'Prioritäts-Buchung', 'Exklusive Angebote'], 2),
    ('platinum', p_salon_id, 'Platin', 5000, 2.00, ARRAY['100% Bonuspunkte', 'VIP-Service', 'Kostenlose Upgrades'], 3)
  ON CONFLICT (salon_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE loyalty_tiers IS 'Loyalty tier definitions per salon';
COMMENT ON TABLE loyalty_accounts IS 'Customer loyalty accounts tracking points';
COMMENT ON TABLE loyalty_transactions IS 'Audit trail of all points changes';
COMMENT ON COLUMN loyalty_accounts.current_points IS 'Currently available points for redemption';
COMMENT ON COLUMN loyalty_accounts.lifetime_points IS 'Total points ever earned (used for tier calculation)';
COMMENT ON COLUMN loyalty_transactions.points_delta IS 'Positive for earning, negative for redemption';
COMMENT ON COLUMN loyalty_transactions.balance_after IS 'Account balance after this transaction';
