# Operations Guide

This document covers operational aspects of running SCHNITTWERK in production.

## Environments

### Development
- Local Next.js dev server
- Local Supabase via Docker
- Uses `.env.local` for configuration
- All features enabled, verbose logging

### Staging
- Vercel preview deployment
- Separate Supabase project
- Uses Stripe test keys
- Anonymized/synthetic test data only

### Production
- Vercel production deployment
- Production Supabase project
- Live Stripe keys
- Real customer data

## Deployment

### Automatic Deployments
- `main` branch → Production
- `develop` branch → Staging
- Pull requests → Preview environments

### Manual Deployment
```bash
# Deploy to production (use with caution)
vercel --prod

# Deploy to staging
vercel
```

### Pre-deployment Checklist
1. All CI checks pass
2. Database migrations tested in staging
3. No pending security vulnerabilities
4. Feature flags configured correctly

## Database Operations

### Running Migrations
```bash
# Local development
supabase db reset          # Reset and rerun all migrations

# Staging
supabase db push --db-url $STAGING_DB_URL

# Production (requires approval)
supabase db push --db-url $PRODUCTION_DB_URL
```

### Migration Best Practices
1. Never run destructive migrations directly
2. Use expand-contract pattern for breaking changes
3. Test migrations in staging first
4. Have rollback plan ready

### Backup and Recovery
- Supabase automatic daily backups
- Point-in-time recovery available
- Document recovery procedure before needed

## Monitoring

### Health Checks
- `/api/health` endpoint for uptime monitoring
- Returns 200 OK when service is healthy
- Monitor with external service (e.g., UptimeRobot)

### Error Tracking
- Sentry integration for error capture
- Configure `SENTRY_DSN` in environment
- Review errors daily

### Key Metrics to Monitor
1. **Application**
   - Error rate
   - Response times
   - Active users

2. **Database**
   - Connection pool usage
   - Query performance
   - Storage usage

3. **Business**
   - Bookings per day
   - Orders per day
   - Payment success rate

## Logging

### Log Levels
- `debug`: Detailed debugging info (dev only)
- `info`: General operational messages
- `warn`: Warning conditions
- `error`: Error conditions

### Structured Logging Format
```json
{
  "timestamp": "2025-01-20T10:30:00.000Z",
  "level": "info",
  "message": "Booking confirmed",
  "context": {
    "salonId": "salon-1",
    "customerId": "customer-1",
    "appointmentId": "apt-123"
  }
}
```

### Viewing Logs
- Vercel: Dashboard → Project → Logs
- Supabase: Dashboard → Logs

## Scheduled Jobs

### Cleanup Expired Reservations
- Runs every 5 minutes
- Clears reservations past `reserved_until`
- Endpoint: `/api/cron/cleanup-reservations`

### Send Booking Reminders
- Runs hourly
- Sends 24h reminders for upcoming appointments
- Configurable via settings

### Data Retention
- Session cleanup: 30 days
- Notification logs: 90 days
- Audit logs: 10 years (legal requirement)

## Incident Response

### Severity Levels

**P1 - Critical**
- Complete service outage
- Payment processing failure
- Data breach
- Response: Immediate

**P2 - High**
- Partial service degradation
- Booking failures
- Response: Within 1 hour

**P3 - Medium**
- Non-critical feature broken
- Performance degradation
- Response: Within 4 hours

**P4 - Low**
- Minor bugs
- UI issues
- Response: Next business day

### Incident Procedure
1. **Detect**: Alert triggers or user report
2. **Assess**: Determine severity and impact
3. **Communicate**: Notify stakeholders
4. **Mitigate**: Apply immediate fix or workaround
5. **Resolve**: Implement permanent fix
6. **Review**: Post-incident analysis

### Rollback Procedure
```bash
# Quick rollback via Vercel
# 1. Go to Vercel Dashboard
# 2. Select deployment to rollback to
# 3. Click "Promote to Production"

# Database rollback (if needed)
# 1. Identify the failing migration
# 2. Run corresponding down.sql
# 3. Deploy previous code version
```

## Security Operations

### Secret Rotation
1. Generate new secret
2. Add to environment variables
3. Deploy with both old and new
4. Remove old secret after verification

### Secrets to Rotate Periodically
- `SUPABASE_SERVICE_ROLE_KEY`: Annually
- `STRIPE_SECRET_KEY`: Annually
- `RESEND_API_KEY`: Annually
- `STRIPE_WEBHOOK_SECRET`: When compromised

### Security Checklist
- [ ] Review Sentry for security-related errors
- [ ] Check Stripe dashboard for suspicious activity
- [ ] Review audit logs for unusual access patterns
- [ ] Verify RLS policies are enforced
- [ ] Update dependencies with security patches

## Performance

### Database Optimization
- Monitor slow queries in Supabase dashboard
- Add indexes for frequent query patterns
- Use connection pooling

### Caching Strategy
- Static pages generated at build time
- Revalidate dynamic data appropriately
- Cache frequently accessed settings

### Load Testing
```bash
# Run basic load test
# (Use tools like k6 or Artillery)

# Key scenarios to test:
# 1. Slot search under load
# 2. Concurrent bookings
# 3. Checkout flow
```

## Cost Management

### Monthly Cost Breakdown
- Vercel: Based on usage
- Supabase: Based on plan + usage
- Stripe: 2.9% + 0.30 CHF per transaction
- Email: Based on volume

### Cost Optimization
- Monitor Supabase bandwidth usage
- Optimize image sizes
- Use appropriate caching

## Support Procedures

### Customer Data Export
1. Navigate to Admin → Customers
2. Select customer
3. Click "Export Data"
4. Download JSON/ZIP

### Account Deletion
1. Verify identity
2. Check for pending orders/appointments
3. Cancel/complete pending items
4. Run anonymization procedure
5. Confirm deletion

### Impersonation (Support)
1. Log action in audit_logs
2. Access customer portal view
3. Diagnose issue
4. End impersonation session
5. Document findings

## Compliance

### GDPR/DSG Requirements
- Right to access: Customer data export
- Right to rectification: Profile editing
- Right to erasure: Account deletion
- Data portability: JSON export

### Audit Trail
All critical actions are logged:
- Customer profile views by staff
- Data exports
- Role changes
- Payment operations
- Impersonation sessions

### Data Retention
| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Orders/Invoices | 10 years | Legal requirement |
| Appointments | 10 years | Business records |
| Customer profiles | Until deletion request | Service provision |
| Session data | 30 days | Security |
| Notification logs | 90 days | Debugging |
