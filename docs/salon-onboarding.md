# Salon Onboarding Guide

This document describes the process to onboard a new salon to the SCHNITTWERK network without code changes.

## Prerequisites

- Database access (Supabase admin or HQ role)
- HQ user account to access salon management

## Step 1: Create Salon Record

### Via Dashboard (Recommended)

1. Log in to the dashboard as an HQ user
2. Navigate to **HQ > Salons**
3. Click **Neuer Salon**
4. Fill in the required information:
   - Salon name (e.g., "SCHNITTWERK Bern")
   - URL slug (e.g., "bern" → schnittwerk.ch/bern)
   - Address and contact details
   - Primary branding color
5. Click **Salon erstellen**

### Via Database (Direct)

```sql
INSERT INTO salons (
  name,
  slug,
  email,
  phone,
  street,
  postal_code,
  city,
  country,
  timezone,
  currency,
  default_language,
  primary_color,
  is_active
) VALUES (
  'SCHNITTWERK Bern',
  'bern',
  'bern@schnittwerk.ch',
  '+41 31 123 45 67',
  'Bundesplatz 1',
  '3011',
  'Bern',
  'CH',
  'Europe/Zurich',
  'CHF',
  'de',
  '#b87444',
  true
);
```

## Step 2: Configure Opening Hours

```sql
-- Example: Monday-Friday 9:00-18:00, Saturday 9:00-16:00
INSERT INTO opening_hours (salon_id, day_of_week, open_minutes, close_minutes, is_closed)
SELECT
  id,
  day,
  CASE WHEN day::integer <= 5 THEN 540 ELSE 540 END, -- 9:00
  CASE WHEN day::integer <= 5 THEN 1080 ELSE 960 END, -- 18:00 / 16:00
  day::integer = 7 -- Closed on Sunday
FROM salons, generate_series(1, 7) AS day
WHERE slug = 'bern';
```

Or via Dashboard: **Einstellungen > Öffnungszeiten**

## Step 3: Configure Booking Rules

Default booking rules are created automatically. To customize:

```sql
UPDATE booking_rules
SET
  min_lead_time_minutes = 120,      -- 2 hours minimum notice
  max_horizon_days = 30,            -- Book up to 30 days ahead
  cancellation_cutoff_hours = 24,   -- Cancel up to 24h before
  slot_granularity_minutes = 15,    -- 15-minute slots
  deposit_required_percent = 0,     -- No deposit required
  reservation_timeout_minutes = 15  -- Hold reservation for 15 min
WHERE salon_id = (SELECT id FROM salons WHERE slug = 'bern');
```

Or via Dashboard: **Einstellungen > Buchung**

## Step 4: Add Tax Rate

Swiss standard VAT rate:

```sql
INSERT INTO tax_rates (
  salon_id,
  code,
  description,
  rate_percent,
  valid_from,
  is_default
)
SELECT
  id,
  'normal',
  'MwSt. Normalsatz',
  8.1,
  CURRENT_DATE,
  true
FROM salons WHERE slug = 'bern';
```

## Step 5: Create Service Categories

```sql
-- Example categories
INSERT INTO service_categories (salon_id, name, slug, sort_order, is_visible)
SELECT id, 'Schneiden', 'schneiden', 1, true FROM salons WHERE slug = 'bern'
UNION ALL
SELECT id, 'Färben', 'faerben', 2, true FROM salons WHERE slug = 'bern'
UNION ALL
SELECT id, 'Styling', 'styling', 3, true FROM salons WHERE slug = 'bern';
```

Or via Dashboard: **Dienstleistungen > Kategorien**

## Step 6: Add Services

```sql
-- Example service
INSERT INTO services (
  salon_id,
  category_id,
  name,
  slug,
  description,
  duration_minutes,
  is_online_bookable,
  is_active
)
SELECT
  s.id,
  c.id,
  'Damenhaarschnitt',
  'damenhaarschnitt',
  'Waschen, Schneiden, Föhnen',
  60,
  true,
  true
FROM salons s
JOIN service_categories c ON c.salon_id = s.id AND c.slug = 'schneiden'
WHERE s.slug = 'bern';

-- Add price
INSERT INTO service_prices (service_id, tax_rate_id, price, valid_from)
SELECT
  sv.id,
  t.id,
  75.00,
  CURRENT_DATE
FROM services sv
JOIN salons s ON s.id = sv.salon_id
JOIN tax_rates t ON t.salon_id = s.id AND t.is_default = true
WHERE s.slug = 'bern' AND sv.slug = 'damenhaarschnitt';
```

Or via Dashboard: **Dienstleistungen > Neue Dienstleistung**

## Step 7: Add Staff Members

```sql
-- Create staff profile
INSERT INTO staff (
  salon_id,
  display_name,
  email,
  color,
  is_bookable,
  is_active,
  sort_order
)
SELECT
  id,
  'Maria Schmidt',
  'maria@schnittwerk.ch',
  '#b87444',
  true,
  true,
  1
FROM salons WHERE slug = 'bern';

-- Add working hours for the staff member
INSERT INTO staff_working_hours (staff_id, day_of_week, start_minutes, end_minutes)
SELECT
  st.id,
  day::text,
  CASE WHEN day::integer <= 5 THEN 540 ELSE 540 END,
  CASE WHEN day::integer <= 5 THEN 1020 ELSE 900 END
FROM staff st
JOIN salons s ON s.id = st.salon_id
CROSS JOIN generate_series(1, 6) AS day
WHERE s.slug = 'bern' AND st.display_name = 'Maria Schmidt';

-- Add service skills
INSERT INTO staff_service_skills (staff_id, service_id, proficiency_level)
SELECT
  st.id,
  sv.id,
  5 -- Expert level
FROM staff st
JOIN salons s ON s.id = st.salon_id
JOIN services sv ON sv.salon_id = s.id
WHERE s.slug = 'bern' AND st.display_name = 'Maria Schmidt';
```

Or via Dashboard: **Team > Neuer Mitarbeiter**

## Step 8: Assign Admin User

Create a user role assignment for the salon admin:

```sql
INSERT INTO user_roles (profile_id, salon_id, role_name)
SELECT
  (SELECT id FROM profiles WHERE email = 'admin@schnittwerk.ch'),
  id,
  'admin'
FROM salons WHERE slug = 'bern';
```

## Step 9: Configure Branding

Update the salon's branding via Dashboard:

1. Navigate to **HQ > Salons > [Salon] > Branding**
2. Upload logo (512x512px PNG recommended)
3. Select or customize primary color
4. Save changes

The theme will automatically apply to the salon's public booking page.

## Step 10: Verify Setup

### Checklist

- [ ] Salon record created and active
- [ ] Opening hours configured
- [ ] Booking rules set
- [ ] Tax rate added
- [ ] At least one service category exists
- [ ] At least one bookable service exists
- [ ] At least one staff member is active and bookable
- [ ] Staff has working hours defined
- [ ] Staff has service skills assigned
- [ ] Admin user has access
- [ ] Branding is configured

### Test Booking Flow

1. Visit `https://schnittwerk.ch/bern` (or local dev URL)
2. Select a service
3. Choose a staff member (or "Any")
4. Select a date and time slot
5. Complete the booking (test mode)

## Troubleshooting

### No time slots showing

- Verify staff working hours are set
- Check staff has skills for the selected service
- Ensure booking rules allow the date/time
- Verify salon opening hours

### Salon not visible

- Check `is_active = true` on the salon record
- Verify the slug is URL-safe (lowercase, no spaces)

### Staff not appearing

- Check `is_bookable = true` and `is_active = true`
- Verify working hours exist for the selected day
- Ensure staff has at least one service skill

## Multi-Salon Considerations

### Data Isolation

All data is automatically scoped by `salon_id` through RLS policies. Each salon's data is completely isolated from other salons.

### Cross-Salon Users

Users with the `hq` role can access all salons. To grant HQ access:

```sql
INSERT INTO user_roles (profile_id, salon_id, role_name)
VALUES ((SELECT id FROM profiles WHERE email = 'hq@schnittwerk.ch'), NULL, 'hq');
```

Note: `salon_id = NULL` for the HQ role indicates global access.

### Shared Configuration

Some configuration may be shared across salons (e.g., email templates). These can be managed in the HQ dashboard under **Globale Einstellungen**.
