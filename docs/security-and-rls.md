# SCHNITTWERK Security & Row Level Security

## Security Model Overview

Security is enforced at three levels:

```
┌─────────────────────────────────────────────┐
│              1. UI Layer                    │
│  - Hide/disable based on role               │
│  - NEVER rely on UI alone for security      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       2. Server Actions / API               │
│  - Validate session (auth.uid())            │
│  - Check role permissions                   │
│  - Derive salon_id from user_roles          │
│  - NEVER trust salon_id from client         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       3. Row Level Security (RLS)           │
│  - Database-enforced tenant isolation       │
│  - Role-based access per table              │
│  - Final line of defense                    │
└─────────────────────────────────────────────┘
```

## Role Definitions

| Role | Description | Typical Access |
|------|-------------|----------------|
| `admin` | Salon owner/administrator | Full access to their salon |
| `manager` | Salon manager | Most admin functions except settings |
| `mitarbeiter` | Staff member | Calendar, customer lookup, POS |
| `kunde` | Customer | Own profile, appointments, orders |
| `hq` | Headquarters | Cross-salon access (future) |

## RLS Helper Functions

These functions simplify policy definitions:

```sql
-- Check if user has specific role(s) for a salon
current_user_has_role(p_salon_id UUID, p_role_names role_name[])

-- Check if user is admin or manager
is_salon_admin_or_manager(p_salon_id UUID)

-- Check if user is staff (admin, manager, or mitarbeiter)
is_salon_staff(p_salon_id UUID)

-- Check if user has HQ role (global access)
is_hq_user()

-- Get all salon IDs user has access to
get_user_salon_ids()
```

## RLS Policies by Table

### Public Access (Read Only)

These tables allow public read access for the booking flow:

| Table | Public Can Read |
|-------|-----------------|
| salons | Active salons only |
| services | Active services only |
| service_categories | Visible categories |
| service_prices | Current prices only |
| staff | Active, bookable staff |
| opening_hours | All |
| booking_rules | All |
| blocked_times | All |
| staff_working_hours | Active staff |
| staff_service_skills | All |

### Customer Access

Customers can:
- Read/update their own profile
- Read/update their own customer record
- Manage their own addresses
- View their appointments
- Create new appointments
- Cancel/reschedule within rules
- Manage their waitlist entries

### Staff Access

Staff (mitarbeiter) can:
- Read all customers in their salon
- Read all appointments in their salon
- Manage appointments (create, update, cancel)
- Read staff schedules and absences

### Admin/Manager Access

Admins and managers can:
- All staff permissions
- Update salon settings
- Manage staff records
- Manage services and prices
- Manage opening hours and booking rules
- Assign roles to users
- Export customer data

## Policy Examples

### Customer reads own appointments

```sql
CREATE POLICY "Customers can read own appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = appointments.customer_id
        AND c.profile_id = auth.uid()
    )
  );
```

### Staff reads salon appointments

```sql
CREATE POLICY "Staff can read salon appointments"
  ON appointments FOR SELECT
  USING (is_salon_staff(salon_id));
```

### Admin manages services

```sql
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (is_salon_admin_or_manager(salon_id))
  WITH CHECK (is_salon_admin_or_manager(salon_id));
```

## Critical Security Rules

### 1. Never Trust Client salon_id

```typescript
// ❌ WRONG - salon_id from client
async function getCustomers(salonId: string) {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', salonId)  // Client could send any ID!
}

// ✅ CORRECT - derive from user's roles
async function getCustomers() {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('profile_id', user.id)
    .in('role_name', ['admin', 'manager', 'mitarbeiter'])
    .single()

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', userRoles.salon_id)
}
```

### 2. Validate All Inputs

```typescript
// Server action with validation
export async function createAppointment(formData: FormData) {
  const session = await getSession()
  if (!session) throw new AuthError('AUTH_SESSION_EXPIRED', ...)

  // Validate input with Zod
  const validated = appointmentSchema.parse({
    staffId: formData.get('staffId'),
    serviceIds: formData.getAll('serviceIds'),
    startsAt: formData.get('startsAt'),
  })

  // Check user has customer record at this salon
  const customer = await getCustomerForUser(session.user.id, salonId)
  if (!customer) throw new AuthError('FORBIDDEN_WRONG_SALON', ...)

  // Proceed with booking...
}
```

### 3. Use Parameterized Queries

Supabase client uses parameterized queries by default.
Never concatenate user input into SQL strings.

### 4. Service Role Usage

The service role bypasses RLS. Use only in:
- Edge Functions (server-side)
- Webhooks (e.g., Stripe)
- Background jobs

Never expose service role key to client.

## Authentication Flow

```
1. User signs up/in via Supabase Auth
        │
        ▼
2. Trigger creates profile record
        │
        ▼
3. Admin assigns role via user_roles
        │
        ▼
4. User accesses app
        │
        ▼
5. RLS policies check user_roles
        │
        ▼
6. Data filtered automatically
```

## Audit Logging

Critical actions are logged to `audit_logs`:

- Customer profile views
- Data exports
- Role changes
- Impersonation
- Appointment cancellations
- Order refunds

```sql
INSERT INTO audit_logs (
  salon_id,
  actor_profile_id,
  action_type,
  target_type,
  target_id,
  metadata
) VALUES (
  $1,
  auth.uid(),
  'customer_view',
  'customer',
  $2,
  jsonb_build_object('reason', $3)
);
```

## Session Security

- JWT expiry: 1 hour (configurable)
- Refresh token rotation enabled
- Sessions invalidated on password change
- Rate limiting on auth endpoints

## GDPR Considerations

- Customer data export available
- Deletion/anonymization supported
- Consent tracking per category
- Data retention policies documented

See [deletion-and-retention.md](./deletion-and-retention.md) for details.
