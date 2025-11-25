-- Migration: Add Payment and Order Tables
-- Created: 2024-11-25
-- Description: Adds tables for Stripe payment integration, orders, inventory management

-- ============================================
-- STRIPE EVENT LOG (Idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_event_log_event_id ON stripe_event_log(stripe_event_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CHF',
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  failure_code TEXT,
  failure_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_salon ON payments(salon_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- PAYMENT EVENTS (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  amount_delta DECIMAL(10,2) DEFAULT 0,
  external_reference TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  voucher_code VARCHAR(50),
  shipping_method_id VARCHAR(50),
  shipping_method_name VARCHAR(100),
  shipping_address_name VARCHAR(200),
  shipping_address_street VARCHAR(255),
  shipping_address_city VARCHAR(100),
  shipping_address_postal_code VARCHAR(20),
  shipping_address_country VARCHAR(100),
  billing_address_name VARCHAR(200),
  billing_address_street VARCHAR(255),
  billing_address_city VARCHAR(100),
  billing_address_postal_code VARCHAR(20),
  billing_address_country VARCHAR(100),
  stripe_payment_intent_id TEXT,
  payment_failure_reason TEXT,
  tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(100),
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  status_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_salon ON orders(salon_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate_percent DECIMAL(5,2) DEFAULT 8.1,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- INVENTORY ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 5,
  maximum_stock INTEGER,
  reorder_point INTEGER,
  last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_salon ON inventory_items(salon_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(current_stock) WHERE current_stock <= minimum_stock;

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer')),
  quantity_delta INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

-- ============================================
-- SHIPPING METHODS
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  estimated_days VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_methods_salon ON shipping_methods(salon_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON shipping_methods(is_active) WHERE is_active = TRUE;

-- ============================================
-- INVOICE COUNTERS (Sequential Order Numbers)
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, year)
);

CREATE INDEX IF NOT EXISTS idx_invoice_counters_salon_year ON invoice_counters(salon_id, year);

-- ============================================
-- VOUCHERS (For shop discounts)
-- ============================================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  remaining_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, code)
);

CREATE INDEX IF NOT EXISTS idx_vouchers_salon_code ON vouchers(salon_id, code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active) WHERE is_active = TRUE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE stripe_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Stripe event log: Service role only (for webhook handler)
CREATE POLICY "stripe_events_service_only" ON stripe_event_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payments: Salon staff can view, service role can modify
CREATE POLICY "payments_salon_view" ON payments
  FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
    )
  );

CREATE POLICY "payments_service_modify" ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Orders: Salon staff can view and modify
CREATE POLICY "orders_salon_access" ON orders
  FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
    )
  );

-- Order items: Follow order access
CREATE POLICY "order_items_via_order" ON order_items
  FOR ALL
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      WHERE o.salon_id IN (
        SELECT ur.salon_id FROM user_roles ur
        WHERE ur.profile_id = auth.uid()
      )
    )
  );

-- Inventory: Salon staff access
CREATE POLICY "inventory_salon_access" ON inventory_items
  FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
    )
  );

-- Stock movements: Follow inventory access
CREATE POLICY "stock_movements_via_inventory" ON stock_movements
  FOR ALL
  TO authenticated
  USING (
    inventory_item_id IN (
      SELECT i.id FROM inventory_items i
      WHERE i.salon_id IN (
        SELECT ur.salon_id FROM user_roles ur
        WHERE ur.profile_id = auth.uid()
      )
    )
  );

-- Shipping methods: Public read, salon staff modify
CREATE POLICY "shipping_methods_public_read" ON shipping_methods
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "shipping_methods_salon_modify" ON shipping_methods
  FOR ALL
  TO authenticated
  USING (
    salon_id IS NULL OR salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
    )
  );

-- Invoice counters: Service role and salon admin
CREATE POLICY "invoice_counters_access" ON invoice_counters
  FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role_name IN ('admin', 'manager', 'hq')
    )
  );

-- Vouchers: Salon staff access
CREATE POLICY "vouchers_salon_access" ON vouchers
  FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT ur.salon_id FROM user_roles ur
      WHERE ur.profile_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER invoice_counters_updated_at
  BEFORE UPDATE ON invoice_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DEFAULT SHIPPING METHODS
-- ============================================

INSERT INTO shipping_methods (id, salon_id, name, description, price, estimated_days, is_active, sort_order)
VALUES
  (gen_random_uuid(), NULL, 'Standardversand', 'Lieferung in 3-5 Werktagen', 8.90, '3-5', TRUE, 1),
  (gen_random_uuid(), NULL, 'Expressversand', 'Lieferung in 1-2 Werktagen', 14.90, '1-2', TRUE, 2),
  (gen_random_uuid(), NULL, 'Abholung im Salon', 'Kostenlos abholen im Salon', 0, '1', TRUE, 3)
ON CONFLICT DO NOTHING;
