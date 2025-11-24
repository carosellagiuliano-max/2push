-- ============================================
-- Migration: 00007_create_rls_policies
-- Description: Enable RLS and create security policies
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_service_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Staff can read profiles in their salon
CREATE POLICY "Staff can read profiles in salon"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN customers c ON c.profile_id = profiles.id
      WHERE ur.profile_id = auth.uid()
        AND ur.salon_id = c.salon_id
        AND ur.role_name IN ('admin', 'manager', 'mitarbeiter')
    )
  );

-- ============================================
-- SALONS POLICIES
-- ============================================

-- Public can read active salons (for public pages)
CREATE POLICY "Public can read active salons"
  ON salons FOR SELECT
  USING (is_active = true);

-- Admins can update their salon
CREATE POLICY "Admins can update salon"
  ON salons FOR UPDATE
  USING (is_salon_admin_or_manager(id))
  WITH CHECK (is_salon_admin_or_manager(id));

-- ============================================
-- USER_ROLES POLICIES
-- ============================================

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  USING (profile_id = auth.uid());

-- Admins can manage roles in their salon
CREATE POLICY "Admins can manage salon roles"
  ON user_roles FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- ROLES POLICIES
-- ============================================

-- Everyone can read role definitions
CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  USING (true);

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================

-- Customers can read their own record
CREATE POLICY "Customers can read own record"
  ON customers FOR SELECT
  USING (profile_id = auth.uid());

-- Customers can update their own record
CREATE POLICY "Customers can update own record"
  ON customers FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Staff can read customers in their salon
CREATE POLICY "Staff can read salon customers"
  ON customers FOR SELECT
  USING (is_salon_staff(salon_id));

-- Staff can manage customers in their salon
CREATE POLICY "Staff can manage salon customers"
  ON customers FOR ALL
  USING (is_salon_staff(salon_id))
  WITH CHECK (is_salon_staff(salon_id));

-- ============================================
-- CUSTOMER_ADDRESSES POLICIES
-- ============================================

-- Customers can manage their own addresses
CREATE POLICY "Customers can manage own addresses"
  ON customer_addresses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_addresses.customer_id
        AND c.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_addresses.customer_id
        AND c.profile_id = auth.uid()
    )
  );

-- Staff can read addresses in their salon
CREATE POLICY "Staff can read salon customer addresses"
  ON customer_addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_addresses.customer_id
        AND is_salon_staff(c.salon_id)
    )
  );

-- ============================================
-- STAFF POLICIES
-- ============================================

-- Public can read active bookable staff (for booking)
CREATE POLICY "Public can read bookable staff"
  ON staff FOR SELECT
  USING (is_active = true AND is_bookable = true);

-- Staff can read all staff in their salon
CREATE POLICY "Staff can read salon staff"
  ON staff FOR SELECT
  USING (is_salon_staff(salon_id));

-- Admins can manage staff
CREATE POLICY "Admins can manage staff"
  ON staff FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- STAFF_WORKING_HOURS POLICIES
-- ============================================

-- Public can read working hours (for slot calculation)
CREATE POLICY "Public can read working hours"
  ON staff_working_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_working_hours.staff_id
        AND s.is_active = true
    )
  );

-- Admins can manage working hours
CREATE POLICY "Admins can manage working hours"
  ON staff_working_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_working_hours.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_working_hours.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  );

-- ============================================
-- STAFF_ABSENCES POLICIES
-- ============================================

-- Staff can read absences in their salon
CREATE POLICY "Staff can read salon absences"
  ON staff_absences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_absences.staff_id
        AND is_salon_staff(s.salon_id)
    )
  );

-- Admins can manage absences
CREATE POLICY "Admins can manage absences"
  ON staff_absences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_absences.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_absences.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  );

-- ============================================
-- SERVICES POLICIES
-- ============================================

-- Public can read active services (for booking/shop)
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Staff can read all services in their salon
CREATE POLICY "Staff can read salon services"
  ON services FOR SELECT
  USING (is_salon_staff(salon_id));

-- Admins can manage services
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- SERVICE_CATEGORIES POLICIES
-- ============================================

-- Public can read visible categories
CREATE POLICY "Public can read visible categories"
  ON service_categories FOR SELECT
  USING (is_visible = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON service_categories FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- SERVICE_PRICES POLICIES
-- ============================================

-- Public can read current prices
CREATE POLICY "Public can read prices"
  ON service_prices FOR SELECT
  USING (
    valid_from <= CURRENT_DATE
    AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
  );

-- Admins can manage prices
CREATE POLICY "Admins can manage prices"
  ON service_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_prices.service_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_prices.service_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  );

-- ============================================
-- TAX_RATES POLICIES
-- ============================================

-- Public can read current tax rates
CREATE POLICY "Public can read tax rates"
  ON tax_rates FOR SELECT
  USING (
    valid_from <= CURRENT_DATE
    AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
  );

-- Admins can manage tax rates
CREATE POLICY "Admins can manage tax rates"
  ON tax_rates FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- STAFF_SERVICE_SKILLS POLICIES
-- ============================================

-- Public can read skills (for booking)
CREATE POLICY "Public can read skills"
  ON staff_service_skills FOR SELECT
  USING (true);

-- Admins can manage skills
CREATE POLICY "Admins can manage skills"
  ON staff_service_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_service_skills.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_service_skills.staff_id
        AND is_salon_admin_or_manager(s.salon_id)
    )
  );

-- ============================================
-- OPENING_HOURS POLICIES
-- ============================================

-- Public can read opening hours
CREATE POLICY "Public can read opening hours"
  ON opening_hours FOR SELECT
  USING (true);

-- Admins can manage opening hours
CREATE POLICY "Admins can manage opening hours"
  ON opening_hours FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- BOOKING_RULES POLICIES
-- ============================================

-- Public can read booking rules (for slot calculation)
CREATE POLICY "Public can read booking rules"
  ON booking_rules FOR SELECT
  USING (true);

-- Admins can manage booking rules
CREATE POLICY "Admins can manage booking rules"
  ON booking_rules FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- BLOCKED_TIMES POLICIES
-- ============================================

-- Public can read blocked times (for slot calculation)
CREATE POLICY "Public can read blocked times"
  ON blocked_times FOR SELECT
  USING (true);

-- Admins can manage blocked times
CREATE POLICY "Admins can manage blocked times"
  ON blocked_times FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================

-- Customers can read their own appointments
CREATE POLICY "Customers can read own appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = appointments.customer_id
        AND c.profile_id = auth.uid()
    )
  );

-- Customers can insert appointments (booking)
CREATE POLICY "Customers can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = appointments.customer_id
        AND c.profile_id = auth.uid()
    )
  );

-- Customers can update their own appointments (cancel/reschedule)
CREATE POLICY "Customers can update own appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = appointments.customer_id
        AND c.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = appointments.customer_id
        AND c.profile_id = auth.uid()
    )
  );

-- Staff can read all appointments in their salon
CREATE POLICY "Staff can read salon appointments"
  ON appointments FOR SELECT
  USING (is_salon_staff(salon_id));

-- Staff can manage appointments in their salon
CREATE POLICY "Staff can manage salon appointments"
  ON appointments FOR ALL
  USING (is_salon_staff(salon_id))
  WITH CHECK (is_salon_staff(salon_id));

-- ============================================
-- APPOINTMENT_SERVICES POLICIES
-- ============================================

-- Same as appointments
CREATE POLICY "Read appointment services via appointment"
  ON appointment_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
        AND (
          is_salon_staff(a.salon_id)
          OR EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = a.customer_id AND c.profile_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Manage appointment services via appointment"
  ON appointment_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
        AND is_salon_staff(a.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
        AND is_salon_staff(a.salon_id)
    )
  );

-- ============================================
-- WAITLIST_ENTRIES POLICIES
-- ============================================

-- Customers can manage their own waitlist entries
CREATE POLICY "Customers can manage own waitlist"
  ON waitlist_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = waitlist_entries.customer_id
        AND c.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = waitlist_entries.customer_id
        AND c.profile_id = auth.uid()
    )
  );

-- Staff can read waitlist in their salon
CREATE POLICY "Staff can read salon waitlist"
  ON waitlist_entries FOR SELECT
  USING (is_salon_staff(salon_id));

-- Admins can manage waitlist
CREATE POLICY "Admins can manage waitlist"
  ON waitlist_entries FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));

-- ============================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION has_role TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_has_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_salon_ids TO authenticated;
GRANT EXECUTE ON FUNCTION is_salon_admin_or_manager TO authenticated;
GRANT EXECUTE ON FUNCTION is_salon_staff TO authenticated;
GRANT EXECUTE ON FUNCTION is_hq_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_service_price TO authenticated;
GRANT EXECUTE ON FUNCTION check_appointment_overlap TO authenticated;
