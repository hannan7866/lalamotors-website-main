# Lala Motors – Web Platform

Lala Motors is a full-featured motorcycle servicing, breakdown support, spare parts catalog, and pre-owned bike marketplace platform built for high performance and responsiveness.

---

## 1. Architecture Overview

The system uses a lightweight hybrid serverless and static architecture:

- **Frontend**: Vanilla HTML5, CSS3, and ES6+ JavaScript. No bulky UI frameworks; fast load times and clean component styling with custom CSS properties.
- **Local Development**: Node.js with Express (`server.js`) providing local static file serving, local API routing, and proxying.
- **Production Serverless**: Deployed on [Vercel](https://vercel.com) using static routing and Node.js Serverless Functions located in `/api`.
- **Database & Authentication**: [Supabase](https://supabase.com) (PostgreSQL) handling user auth, motorcycle inventory, customer service records, and Row-Level Security (RLS).
- **Email Delivery**: [Nodemailer](https://nodemailer.com) transmitting templated confirmation emails via Gmail SMTP to both customers and shop management.
- **Booking Persistence**: Google Apps Script webhook integration proxying appointments directly into Google Sheets for workshop scheduling.

---

## 2. Directory Structure

```text
lalamotors-website/
├── api/                      # Vercel Serverless Functions (Production API)
│   ├── booking.js            # Booking webhook forwarder with validation
│   └── send-confirmation.js  # Validated, templated transactional email sender
├── routes/                   # Express API routes (Local development)
│   └── email.js              # Local email handler mirroring serverless endpoint
├── services/                 # Service-specific HTML pages & modules
│   ├── admin.html            # Workshop inventory & bike listing admin portal
│   ├── autoparts.html        # Spare parts catalog with search, filter & pagination
│   ├── servicing.html        # Maintenance booking & package selections
│   ├── sale.html             # Pre-owned bike marketplace (Buy & Sell)
│   ├── bikewash.html         # Bike wash & detailing services
│   ├── emergency.html        # Roadside breakdown assistance request
│   ├── profile.html          # User account & vehicle profile management
│   ├── login.html            # Supabase authentication login
│   ├── register.html         # Customer registration
│   └── ...                   # Other dedicated service pages
├── sql/                      # PostgreSQL database schemas & RLS migrations
│   ├── parts.sql             # Base parts table, triggers & status functions
│   ├── bike_listings.sql     # Marketplace pre-owned bike schema
│   ├── addresses.sql         # Customer delivery addresses schema
│   └── 20261112_001_add_rls_and_admin_policies.sql # Hardened RLS & admin policies
├── scripts/                  # Diagnostic, test, and database migration utilities
│   ├── import-csv-to-supabase.js              # CSV bulk seeder for parts
│   ├── migrate-to-parts-table.js              # Schema migration runner
│   ├── migrate-to-parts-table-service-role.js # Service-role migration runner
│   ├── fix-rls-parts.js                       # RLS reset utility
│   ├── test-autoparts-query.js                # Database connection check
│   └── test-client.js                         # Local API test script
├── images/                   # Brand logos, motorcycle models, and asset photos
├── index.html                # Main homepage & interactive booking hub
├── style.css                 # Master stylesheet & responsive design system
├── script.js                 # Global frontend interactions & shopping cart
├── supabase-client.js        # Shared Supabase singleton client & helpers
├── logger.js                 # Production-quiet server logging utility
├── server.js                 # Local Express server
├── vercel.json               # Vercel routing, caching headers & build configuration
├── .env.example              # Template for environment variables
└── README.md                 # Project documentation
```

---

## 3. Getting Started & Local Development

### Prerequisites
- **Node.js**: version `18.0.0` or higher
- **npm** or **yarn**

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd lalamotors-website
npm install
```

### 2. Configure Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Fill in your local credentials (see table below).

### 3. Run Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3001` with hot-reload enabled via `nodemon`.

---

## 4. Environment Variables Reference

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `PORT` | Local Express listening port | `3001` |
| `NODE_ENV` | Runtime environment mode | `development` or `production` |
| `CORS_ORIGIN` | Allowed domain for CORS | `https://lalamotors.com` |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anon key (safe for client) | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated key (bypasses RLS; server/scripts only) | `eyJhbGciOi...` |
| `GMAIL_USER` | Gmail address for sending booking emails | `lalamotors1@gmail.com` |
| `GMAIL_PASS` | 16-character Google App Password | `abcd efgh ijkl mnop` |
| `SHOP_EMAIL` | Internal email destination for alerts | `shop@lalamotors.com` |
| `GOOGLE_SCRIPT_URL` | Google Apps Script Webhook endpoint | `https://script.google.com/macros/s/.../exec` |

---

## 5. Deploying to Vercel

The project is structured for native Vercel deployment:
- Static assets (`index.html`, `style.css`, `services/`, `images/`) are served via `@vercel/static`.
- API endpoints in `/api/*.js` run as Node.js serverless functions.
- Routing and caching rules are governed by `vercel.json`.

### Steps:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), import your repository.
3. In **Settings -> Environment Variables**, add the production values:
   - `CORS_ORIGIN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GMAIL_USER`
   - `GMAIL_PASS`
   - `SHOP_EMAIL`
   - `GOOGLE_SCRIPT_URL`
4. Deploy. Vercel automatically detects the API functions and static configuration.

---

## 6. Applying Database Migrations (Supabase)

To set up the database and apply security policies:

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the base schemas if not already applied:
   - Run `sql/parts.sql` (Creates `parts` table, triggers, and auto-SKU generation).
   - Run `sql/bike_listings.sql` (Creates pre-owned bike listings table).
   - Run `sql/addresses.sql` (Creates customer address table).
3. Apply the security and authorization hardening:
   - Run **`sql/20261112_001_add_rls_and_admin_policies.sql`**.
   - This creates the `admins` table, defines the `is_admin()` security function, and binds strict Row-Level Security rules.
4. **Designate an Admin**:
   - In Supabase -> Authentication -> Users, copy the user's `UUID`.
   - Run in SQL Editor:
     ```sql
     INSERT INTO public.admins (user_id) VALUES ('<COPIED-USER-UUID>');
     ```
