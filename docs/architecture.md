# SCHNITTWERK Architecture Overview

## System Overview

SCHNITTWERK is a full-stack web application for managing a Swiss hair salon business.
It provides online booking, e-commerce, customer management, and administrative tools.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Public Site  │  │   Customer   │  │    Admin Portal      │  │
│  │  (Marketing) │  │    Portal    │  │   (Staff/Manager)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Application                        │
│                        (Vercel Edge)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App Router                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │   Pages     │ │   Server    │ │    Route Handlers   │ │  │
│  │  │ (RSC/RCC)   │ │   Actions   │ │   (API + Webhooks)  │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Domain Layer                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │  │
│  │  │  Booking   │ │  Payment   │ │   Notification     │    │  │
│  │  │  Service   │ │  Service   │ │     Service        │    │  │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Supabase    │   │     Stripe      │   │     Resend      │
│  (Database,   │   │   (Payments)    │   │    (Email)      │
│  Auth, Files) │   │                 │   │                 │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public marketing pages
│   ├── (customer)/         # Customer portal (authenticated)
│   ├── (admin)/            # Admin portal (staff/manager)
│   └── api/                # API routes and webhooks
│
├── components/             # Shared UI components
│   └── ui/                 # Base UI primitives (shadcn-style)
│
├── features/               # Feature-specific code
│   ├── booking/            # Booking flow and slot engine
│   ├── shop/               # E-commerce and cart
│   ├── orders/             # Order management
│   ├── customers/          # Customer management
│   ├── notifications/      # Email/SMS templates
│   ├── loyalty/            # Loyalty program
│   └── analytics/          # Reporting and metrics
│
├── lib/                    # Shared utilities and services
│   ├── db/                 # Database client and queries
│   ├── domain/             # Business logic services
│   ├── validators/         # Zod schemas
│   ├── auth/               # Authentication helpers
│   ├── config/             # Configuration management
│   ├── errors/             # Error types and messages
│   ├── payments/           # Stripe integration
│   └── notifications/      # Email/SMS sending
│
└── styles/                 # Global styles
```

## Key Design Decisions

### 1. Multi-Salon Ready

All business data is scoped by `salon_id`. Row Level Security (RLS)
enforces tenant isolation at the database level.

### 2. Domain-Driven Boundaries

Business logic lives in domain services under `lib/domain/`.
Server Actions and API routes only orchestrate calls to these services.

### 3. Idempotent Operations

Critical operations (payments, bookings, notifications) are designed
to be safely retried. Stripe webhook events are deduplicated using
`stripe_event_log`.

### 4. Configuration in Database

Business rules like opening hours, prices, and booking policies are
stored in the database, not hardcoded. Admin can modify without deploys.

## Security Model

```
┌─────────────────────────────────────────────┐
│              UI Layer                       │
│  - Hide/disable based on role               │
│  - Never trust for security                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Server Actions / API                │
│  - Validate session                         │
│  - Check role permissions                   │
│  - Derive salon_id from user_roles          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       Row Level Security (RLS)              │
│  - Enforce tenant isolation                 │
│  - Role-based access per table              │
│  - Service role bypasses for edge functions │
└─────────────────────────────────────────────┘
```

## Data Flow: Booking Example

```
1. Customer selects slot in UI
         │
         ▼
2. createReservation() server action
         │
         ├─► Validate input (Zod)
         ├─► Check slot availability (domain service)
         ├─► Create appointment with status='reserved'
         ├─► Set reserved_until timestamp
         │
         ▼
3. Customer proceeds to payment
         │
         ▼
4. Stripe Payment Intent created
         │
         ├─► appointment_id in metadata
         │
         ▼
5. Customer completes payment
         │
         ▼
6. Stripe webhook received
         │
         ├─► Verify signature
         ├─► Check idempotency (stripe_event_log)
         ├─► Load appointment
         ├─► Update status to 'confirmed'
         ├─► Send confirmation email
         │
         ▼
7. Customer sees confirmed booking
```

## Environments

| Environment | Database | Stripe | Email |
|-------------|----------|--------|-------|
| Development | Local Supabase | Test keys | Console only |
| Staging | Staging project | Test keys | Internal domain |
| Production | Production project | Live keys | Real sending |

## Related Documentation

- [Data Model](./data-model.md)
- [Security and RLS](./security-and-rls.md)
- [Development Setup](./dev-setup.md)
- [Testing Guide](./testing.md)
- [Operations](./operations.md)
