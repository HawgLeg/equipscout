# EquipScout

A mobile-first web app and PWA for finding available heavy equipment in Austin, TX. EquipScout is a no-touch equipment availability search engine that surfaces listings and routes leads to vendors.

## Features

### For Contractors
- **Search Equipment**: Search by equipment type (CTL, Skid Steer, Excavator, Dozer, Crane, and more), location, radius (up to 40 miles), and need date
- **View Results**: See availability status, rates, freshness badges, and distance
- **Contact Vendors**: Call, text, email, or visit vendor websites directly
- **Request Availability**: Submit inquiries without creating an account

### For Vendors
- **Self-Serve Dashboard**: Manage equipment listings and availability
- **Lead Tracking**: View contact clicks and availability requests
- **Billing Summary**: See CPC charges, billable clicks this week/month
- **Profile Management**: Update company info and rates
- **Freshness System**: Keep listings current to rank higher

### For Admins
- **Vendor Management**: View all vendors, mark sponsored listings
- **Billing Dashboard**: View all vendor billing, CPC rates, export CSV
- **Vendor Status Control**: Pause/resume billing, mark vendors as opted out
- **Lightweight CRM**: Admin notes, last contacted tracking per vendor
- **Report Moderation**: Review and resolve outdated listing reports
- **Analytics**: Track platform-wide metrics

## CPC Tracking & Monetization

EquipScout uses a Cost-Per-Click (CPC) billing model:

- **Billable Events**: CALL, TEXT, EMAIL, WEBSITE clicks and REQUEST submissions
- **Non-Billable**: Page views, search impressions, scrolling (never charged)
- **Deduplication**: 30-minute window prevents duplicate billing for same user/vendor/action
- **Rate Limiting**: 30 requests/minute per IP to prevent abuse
- **Default CPC**: $15 per billable event (adjustable per vendor)
- **Privacy**: Only IP and user-agent hashes stored (no raw PII)
- **Pay-as-you-go**: No contracts required, vendors can opt out anytime

### Business Model
- Contractors are NEVER charged
- Vendors pay only for qualified contact actions
- Billing is usage-based (weekly or monthly invoicing)
- Manual invoicing via CSV export (Stripe integration optional/deferred)

### Tracking Flow
1. User clicks contact button (Call/Text/Email/Website) or submits Request
2. Frontend calls `POST /api/contact-events/log` with tracking context
3. Backend checks for duplicates within 30-minute window
4. If unique, creates billable ContactEvent record
5. Action proceeds (tel:, sms:, mailto:, window.open)

## Tech Stack

### Frontend (webapp/)
- React 18 with Vite
- React Router v6
- React Query for data fetching
- Tailwind CSS + shadcn/ui
- Better Auth for authentication
- PWA support

### Backend (backend/)
- Bun runtime
- Hono web framework
- Prisma ORM with SQLite
- Better Auth with email/password
- Zod validation

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with search form |
| `/results` | Search results with listing cards |
| `/listing/:id` | Equipment detail page |
| `/vendors/join` | Vendor onboarding |
| `/vendor` | Vendor dashboard (protected) |
| `/vendor/equipment` | Equipment management |
| `/vendor/profile` | Profile settings |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard (protected) |
| `/admin/vendors` | Vendor management |
| `/admin/billing` | Billing analytics & CSV export |
| `/admin/reports` | Report moderation |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/disclaimer` | Platform Disclaimer |

## API Endpoints

### Public
- `GET /api/search` - Search equipment with filters
- `GET /api/equipment/:id` - Get equipment details
- `POST /api/leads` - Submit availability request
- `POST /api/contact-events/log` - Log contact event with deduplication
- `POST /api/reports` - Report outdated listing

### Vendor (authenticated)
- `POST /api/vendors/signup` - Create vendor account
- `GET /api/vendors/me` - Get vendor profile
- `PUT /api/vendors/me` - Update vendor profile
- `GET /api/vendors/me/analytics` - Get analytics with billing summary
- `GET /api/vendors/me/equipment` - List equipment
- `POST /api/vendors/me/equipment` - Add equipment
- `PUT /api/vendors/me/equipment/:id` - Update equipment
- `DELETE /api/vendors/me/equipment/:id` - Delete equipment
- `PUT /api/vendors/me/equipment/:id/availability` - Update availability

### Admin (authenticated, admin role)
- `GET /api/admin/vendors` - List all vendors
- `PUT /api/admin/vendors/:id` - Update vendor
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/billing` - Billing analytics for all vendors
- `PUT /api/admin/billing/:vendorId` - Update vendor CPC rate
- `GET /api/admin/reports` - List reports
- `PUT /api/admin/reports/:id` - Update report status

## Database Schema

- **vendors** - Rental vendor companies
- **equipment** - Equipment listings (13 types supported)
- **availability** - Equipment availability status
- **lead_requests** - Availability request submissions
- **contact_events** - Billable contact events with deduplication
- **vendor_billing** - Vendor CPC rates
- **sponsored_slots** - Sponsored placement tracking
- **audit_logs** - Security audit trail
- **reports** - Outdated listing reports

## Equipment Types

CTL, Skid Steer, Excavator, Dozer, Crane, Backhoe, Forklift, Telehandler, Roller, Grader, Wheel Loader, Dump Truck, Other

## Test Data

The database is seeded with:
- 10 Austin-area vendors
- 52 equipment listings across all types
- Sample contact events and lead requests

To reseed: `cd backend && bun run prisma/seed.ts`

## Security

- HTTPS only
- Secure password hashing (bcrypt)
- Session-based authentication
- Role-based access control (vendor/admin)
- Input validation with Zod
- CORS configured for trusted origins
- Audit logging for sensitive actions
- IP/UA hashing for privacy-preserving tracking

## Legal

- **Terms of Service**: `/terms`
- **Privacy Policy**: `/privacy`
- **Disclaimer**: `/disclaimer`

EquipScout is a discovery platform. We do not rent, sell, or own equipment. All availability and pricing provided by vendors.
