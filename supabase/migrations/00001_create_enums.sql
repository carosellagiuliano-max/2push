-- ============================================
-- Migration: 00001_create_enums
-- Description: Create all enum types for the application
-- ============================================

-- Role names for RBAC
CREATE TYPE role_name AS ENUM (
  'admin',
  'manager',
  'mitarbeiter',
  'kunde',
  'hq'
);

-- Appointment status lifecycle
CREATE TYPE appointment_status AS ENUM (
  'reserved',      -- Temporarily held, awaiting payment/confirmation
  'requested',     -- Requested but not yet confirmed
  'confirmed',     -- Confirmed and scheduled
  'completed',     -- Service delivered
  'cancelled',     -- Cancelled by customer or salon
  'no_show'        -- Customer did not appear
);

-- Order status lifecycle
CREATE TYPE order_status AS ENUM (
  'pending',       -- Order created, awaiting payment
  'paid',          -- Payment received
  'processing',    -- Being prepared
  'shipped',       -- Sent to customer
  'delivered',     -- Delivered to customer
  'completed',     -- Finalized
  'cancelled',     -- Cancelled
  'refunded'       -- Fully refunded
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'authorized',
  'captured',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'stripe_card',
  'stripe_twint',
  'cash',
  'terminal',
  'voucher',
  'manual_adjustment'
);

-- Payment event types for audit trail
CREATE TYPE payment_event_type AS ENUM (
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
  'chargeback',
  'dispute_opened',
  'dispute_won',
  'dispute_lost'
);

-- Notification channels
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push'
);

-- Consent categories for GDPR compliance
CREATE TYPE consent_category AS ENUM (
  'marketing_email',
  'marketing_sms',
  'loyalty_program',
  'analytics',
  'partner_sharing'
);

-- Consent status
CREATE TYPE consent_status AS ENUM (
  'given',
  'withdrawn'
);

-- Waitlist entry status
CREATE TYPE waitlist_status AS ENUM (
  'active',
  'notified',
  'converted',
  'cancelled',
  'expired'
);

-- Blocked time types
CREATE TYPE blocked_time_type AS ENUM (
  'holiday',         -- Salon closed
  'vacation',        -- Staff vacation
  'sick',            -- Staff sick leave
  'training',        -- Training/education
  'maintenance',     -- Salon maintenance
  'other'
);

-- Stock movement types
CREATE TYPE stock_movement_type AS ENUM (
  'purchase',        -- Stock added from supplier
  'sale',            -- Stock reduced from sale
  'return',          -- Stock returned by customer
  'adjustment',      -- Manual inventory adjustment
  'damaged',         -- Stock marked as damaged
  'expired'          -- Stock expired
);

-- Loyalty transaction sources
CREATE TYPE loyalty_source_type AS ENUM (
  'order',
  'appointment',
  'referral',
  'promotion',
  'adjustment',
  'expiry'
);

-- Legal document types
CREATE TYPE legal_document_type AS ENUM (
  'agb',                  -- General terms and conditions
  'datenschutz',          -- Privacy policy
  'widerrufsbelehrung',   -- Cancellation policy
  'impressum'             -- Legal notice
);

-- Audit log action types
CREATE TYPE audit_action_type AS ENUM (
  'appointment_created',
  'appointment_updated',
  'appointment_cancelled',
  'appointment_completed',
  'appointment_no_show',
  'order_created',
  'order_updated',
  'order_cancelled',
  'order_refunded',
  'customer_created',
  'customer_updated',
  'customer_deleted',
  'customer_view',
  'customer_export',
  'orders_export',
  'appointments_export',
  'staff_created',
  'staff_updated',
  'role_assigned',
  'role_removed',
  'impersonation_start',
  'impersonation_end',
  'settings_updated',
  'consent_changed'
);

-- Address types
CREATE TYPE address_type AS ENUM (
  'billing',
  'shipping',
  'both'
);

-- Shipping method types
CREATE TYPE shipping_type AS ENUM (
  'shipping',
  'pickup'
);

-- Day of week (ISO: Monday = 1)
CREATE TYPE day_of_week AS ENUM (
  '1',  -- Monday
  '2',  -- Tuesday
  '3',  -- Wednesday
  '4',  -- Thursday
  '5',  -- Friday
  '6',  -- Saturday
  '7'   -- Sunday
);

COMMENT ON TYPE role_name IS 'User roles for RBAC: admin, manager, mitarbeiter (staff), kunde (customer), hq (headquarters)';
COMMENT ON TYPE appointment_status IS 'Lifecycle states for appointments';
COMMENT ON TYPE payment_method IS 'Supported payment methods including Stripe, cash, and terminal';
COMMENT ON TYPE consent_category IS 'GDPR consent categories that must be tracked per customer';
