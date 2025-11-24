# SCHNITTWERK Data Model

## Overview

The database is designed for multi-tenant architecture with `salon_id` on all business tables.
All data access is controlled through Row Level Security (RLS) policies.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   salons    │       │  profiles   │       │    roles    │
│─────────────│       │─────────────│       │─────────────│
│ id          │       │ id (=auth)  │       │ role_name   │
│ name        │       │ email       │       │ display_name│
│ slug        │       │ first_name  │       └─────────────┘
│ timezone    │       │ last_name   │              │
└─────────────┘       └─────────────┘              │
      │                     │                      │
      │                     │    ┌─────────────────┘
      │                     │    │
      ▼                     ▼    ▼
┌─────────────────────────────────────┐
│            user_roles               │
│─────────────────────────────────────│
│ profile_id ──► profiles             │
│ salon_id ──► salons (nullable)      │
│ role_name ──► roles                 │
└─────────────────────────────────────┘
      │
      │ (determines access)
      ▼
┌─────────────┐       ┌─────────────┐
│  customers  │       │    staff    │
│─────────────│       │─────────────│
│ salon_id    │◄─────►│ salon_id    │
│ profile_id  │       │ profile_id  │
│ first_name  │       │ display_name│
│ last_name   │       │ is_bookable │
└─────────────┘       └─────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌─────────────┐       ┌─────────────────────┐
│appointments │       │ staff_working_hours │
│─────────────│       │─────────────────────│
│ customer_id │       │ staff_id            │
│ staff_id    │       │ day_of_week         │
│ starts_at   │       │ start_minutes       │
│ ends_at     │       │ end_minutes         │
│ status      │       └─────────────────────┘
└─────────────┘
      │
      ▼
┌─────────────────────┐
│appointment_services │
│─────────────────────│
│ appointment_id      │
│ service_id          │
│ snapshot_price      │
└─────────────────────┘
      │
      ▼
┌─────────────┐       ┌─────────────┐
│  services   │◄──────│service_prices│
│─────────────│       │─────────────│
│ category_id │       │ service_id  │
│ name        │       │ price       │
│ duration    │       │ tax_rate_id │
└─────────────┘       │ valid_from  │
      │               └─────────────┘
      ▼
┌─────────────────────┐
│ service_categories  │
│─────────────────────│
│ salon_id            │
│ name                │
│ slug                │
└─────────────────────┘
```

## Core Tables

### salons

Central tenant table. All business data references `salon_id`.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Salon display name |
| slug | TEXT | URL-friendly identifier |
| email | TEXT | Contact email |
| phone | TEXT | Contact phone |
| street, postal_code, city | TEXT | Address |
| timezone | TEXT | IANA timezone (default: Europe/Zurich) |
| currency | TEXT | Currency code (default: CHF) |
| is_active | BOOLEAN | Active status |

### profiles

Extends Supabase `auth.users` with application data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | = auth.users.id |
| email | TEXT | Email address |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| phone | TEXT | Phone number |
| is_active | BOOLEAN | Account active |

### user_roles

Links profiles to salons with specific roles.

| Column | Type | Description |
|--------|------|-------------|
| profile_id | UUID | FK to profiles |
| salon_id | UUID | FK to salons (NULL for HQ role) |
| role_name | role_name | admin, manager, mitarbeiter, kunde, hq |

## Customer & Staff Tables

### customers

Customer records per salon. A profile can be customer at multiple salons.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| salon_id | UUID | FK to salons |
| profile_id | UUID | FK to profiles (optional) |
| first_name, last_name | TEXT | Name |
| email, phone | TEXT | Contact |
| total_visits | INTEGER | Visit count |
| total_spend | DECIMAL | Total spending |

### staff

Staff members per salon.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| salon_id | UUID | FK to salons |
| profile_id | UUID | FK to profiles |
| display_name | TEXT | Display name |
| color | TEXT | Calendar color (hex) |
| is_bookable | BOOLEAN | Available for online booking |

## Service Tables

### service_categories

Groupings for services (e.g., "Schnitt", "Coloration").

### services

Bookable services with duration and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| salon_id | UUID | FK to salons |
| category_id | UUID | FK to categories |
| name | TEXT | Service name |
| duration_minutes | INTEGER | Base duration |
| buffer_before_minutes | INTEGER | Prep time |
| buffer_after_minutes | INTEGER | Cleanup time |
| is_online_bookable | BOOLEAN | Available online |

### service_prices

Price history with validity periods.

| Column | Type | Description |
|--------|------|-------------|
| service_id | UUID | FK to services |
| tax_rate_id | UUID | FK to tax_rates |
| price | DECIMAL | Price in CHF |
| valid_from | DATE | Start of validity |
| valid_to | DATE | End of validity (NULL = current) |

### staff_service_skills

Maps which staff can perform which services.

## Booking Tables

### appointments

Core booking records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| salon_id | UUID | FK to salons |
| customer_id | UUID | FK to customers |
| staff_id | UUID | FK to staff |
| starts_at | TIMESTAMPTZ | Start time (UTC) |
| ends_at | TIMESTAMPTZ | End time (UTC) |
| status | appointment_status | reserved/confirmed/cancelled/etc. |
| reserved_until | TIMESTAMPTZ | Expiry for reserved status |

### appointment_services

Services included in an appointment with price snapshots.

### booking_rules

Per-salon configuration for booking behavior.

| Column | Type | Description |
|--------|------|-------------|
| min_lead_time_minutes | INTEGER | Minimum advance booking |
| max_horizon_days | INTEGER | Maximum days ahead |
| cancellation_cutoff_hours | INTEGER | Cancel deadline |
| slot_granularity_minutes | INTEGER | Slot intervals (15/30) |
| reservation_timeout_minutes | INTEGER | How long reserved slots are held |

### opening_hours

Salon opening hours per day of week.

### staff_working_hours

Staff schedule per day of week.

### blocked_times

Blocked periods for salon or specific staff.

## Enums

| Enum | Values |
|------|--------|
| role_name | admin, manager, mitarbeiter, kunde, hq |
| appointment_status | reserved, requested, confirmed, completed, cancelled, no_show |
| payment_method | stripe_card, stripe_twint, cash, terminal, voucher, manual_adjustment |
| consent_category | marketing_email, marketing_sms, loyalty_program, analytics, partner_sharing |
| day_of_week | 1 (Mon) - 7 (Sun) |

## Time Handling

- All timestamps stored as `TIMESTAMPTZ` (UTC)
- Working hours stored as **minutes from midnight** (avoids DST issues)
- Timezone conversion happens in application code using `date-fns-tz`
- Default timezone: `Europe/Zurich`

Example: 9:00 AM = 540 minutes (9 × 60)

## Indexes

Key indexes for performance:

- `idx_appointments_staff_time` - For slot calculation
- `idx_appointments_no_double_booking` - Unique on (staff_id, starts_at) for active statuses
- `idx_customers_salon` - Customer lookup by salon
- `idx_services_bookable` - Active, bookable services

## Constraints

- Appointments: `ends_at > starts_at`
- Working hours: `end_minutes > start_minutes`
- No overlapping appointments per staff (unique index)
- One role per user per salon (unique constraint)
