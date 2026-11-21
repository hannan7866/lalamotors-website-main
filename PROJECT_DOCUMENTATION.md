# Lala Motors – Complete Master Project Documentation & Knowledge Base

---

## 1. Executive Summary & Project Overview

**Lala Motors** is a full-featured, multi-service automotive and motorcycle platform. It provides motorcycle servicing, emergency breakdown support, bike modification, vehicle restoration, custom painting, an auto parts e-commerce catalog with inventory management, a used motorcycle buy/sell marketplace, customer profiles, and a full-featured administrative portal.

The application combines a lightweight, performant frontend with a flexible Node.js/Express backend, Vercel serverless deployment capabilities, Supabase (PostgreSQL) for relational database and authentication services, Nodemailer for automated transactional emails, and Google Sheets integration via Google Apps Script for automated booking logs.

---

## 2. Technology Stack & Architecture

### Frontend
- **Languages**: Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3.
- **Styling**: Comprehensive design system in `style.css` (custom CSS variables, responsive grid/flexbox layouts, card designs, animations, glassmorphic elements, modals, responsive navigation).
- **Icons & Fonts**: Font Awesome 6.x, Google Fonts (Inter, Outfit/Poppins typography).
- **Client-side Libraries**: `@supabase/supabase-js` v2 (via CDN & bundler), Axios for HTTP requests.

### Backend & Serverless API
- **Runtime**: Node.js (>= 18.0.0).
- **Web Framework**: Express.js (v4.21.2) with CORS and Body-Parser.
- **Serverless Hosting**: Vercel Serverless Functions (`api/` directory) and static asset hosting configured via `vercel.json`.
- **Local Dev Server**: Express server in `server.js` with Nodemon for hot reloading.

### Database & BaaS (Backend-as-a-Service)
- **Database**: Supabase PostgreSQL.
- **Security**: PostgreSQL Row-Level Security (RLS) policies.
- **Automation**: PostgreSQL Functions and Triggers for automatic SKU generation, status updates (`in_stock`, `out_of_stock`), and `updated_at` timestamps.

### Third-Party Integrations
- **Email Delivery**: Nodemailer sending transactional emails via Gmail SMTP (`api/send-confirmation.js` & `routes/email.js`).
- **Booking Persistence**: Google Apps Script Webhooks (`/api/booking` forwarding customer appointments to Google Sheets).
- **Parts Data & Inventory**: Dynamic loading from Supabase table `parts` / `autoparts` + fallback to offline CSV (`Complete_Motorcycle_Spare_Parts_List.csv`) and JS datasets (`autoparts-data.js`).

---

## 3. Complete File & Folder Structure

```
lalamotors-website-main/
│
├── .env                                       # Environment variables (DB keys, Gmail credentials, port)
├── .gitignore                                 # Git ignored files & directories
├── .vercelignore                              # Vercel deployment ignored patterns
├── package.json                               # Node.js dependencies, scripts, engines
├── package-lock.json                          # Lockfile for exact dependency versions
├── vercel.json                                # Vercel deployment routes, headers, build config
├── server.js                                  # Main local Express application server
├── tunnel-config.yml                          # Cloudflare / Local tunneling configuration
├── README.md                                  # Repository overview and setup instructions
├── PROJECT_DOCUMENTATION.md                   # Complete master project overview & Gemini prompt doc
├── index.html                                 # Primary landing page and core service portal
├── style.css                                  # Master stylesheet for main site and UI components
├── script.js                                  # Core client-side JavaScript logic & interactions
├── admin.html                                 # Root-level admin panel entry point
├── submit-bike.html                           # Standalone form to list a motorcycle for sale
├── favicon.ico                                # Site icon
│
├── Complete_Motorcycle_Spare_Parts_List new.csv # Master spare parts dataset (CSV format)
│
├── api/                                       # Vercel Serverless Function Handlers
│   ├── booking.js                             # API endpoint to forward bookings to Google Sheets
│   └── send-confirmation.js                   # API endpoint to send dual emails via Nodemailer
│
├── routes/                                    # Express API Route Handlers (Local Dev Server)
│   └── email.js                               # Local route handling email sending and notifications
│
├── functions/                                 # Helper functions and serverless utility modules
│   └── autoparts-data.js                      # Auto parts helper export module
│
├── sql/                                       # PostgreSQL Database Schemas, Triggers & Policies
│   ├── parts.sql                              # Production parts table, ENUMs, triggers, indexes, RLS
│   ├── autoparts.sql                          # Legacy autoparts table schema with stock triggers
│   ├── bike_listings.sql                      # Marketplace bike submissions schema
│   ├── addresses.sql                          # User saved addresses table schema
│   └── rls_policies.sql                       # Row Level Security access policies
│
├── services/                                  # Individual Service & Functional Pages
│   ├── about.html                             # About Lala Motors, history, mission, and team
│   ├── address.html                           # Manage saved customer delivery/service addresses
│   ├── address.js                             # Client-side address management logic
│   ├── admin.html                             # Comprehensive administrative dashboard & CRUD interface
│   ├── autoparts-data.js                      # Static backup catalog of spare parts
│   ├── autoparts.html                         # Spare parts e-commerce catalog with search & filter
│   ├── bikewash.html                          # Bike wash & detailing package booking page
│   ├── cart.html                              # Shopping cart for parts and service bookings
│   ├── emergency.html                         # 24/7 Roadside breakdown assistance request page
│   ├── last-services-booked.html              # Customer booking history & service logs
│   ├── login.html                             # User and Admin authentication / sign-in page
│   ├── modify.html                            # Custom bike modification & styling showcase
│   ├── orders.html                            # User order tracking and status history
│   ├── painting.html                          # Custom paint jobs, ceramic coating, tank painting
│   ├── profile.html                           # User profile, vehicle details, contact settings
│   ├── register.html                          # User registration / sign-up page
│   ├── repairing.html                         # Engine repair, electrical, mechanical diagnostics
│   ├── restoring.html                         # Vintage & accidental bike restoration services
│   ├── sale.html                              # Used bike marketplace (Buy & Sell motorcycles)
│   ├── servicing.html                         # Periodic maintenance & service package booking
│   └── subscription.html                      # Lala Motors annual maintenance & wash subscriptions
│
├── public/                                    # Public Static Assets
│   ├── style.css                              # Public stylesheet mirror
│   └── files/
│       └── Complete_Motorcycle_Spare_Parts_List.csv # Publicly accessible parts CSV
│
├── images/                                    # Image Assets and Brand Media
│   ├── logos/                                 # Brand logos and variations
│   ├── brands_clean/                          # Clean motorcycle manufacturer brand badges
│   ├── bajaj/                                 # Bajaj motorcycle & parts images
│   ├── hero/                                  # Hero MotoCorp assets
│   ├── honda/                                 # Honda 2-wheelers assets
│   ├── ktm/                                   # KTM motorcycle assets
│   ├── royal enfield/                         # Royal Enfield assets
│   ├── suzuki/                                # Suzuki motorcycle assets
│   ├── tvs/                                   # TVS motor assets
│   ├── yamaha/                                # Yamaha motor assets
│   ├── oils/                                  # Engine oil brand product photos
│   ├── premium oils/                          # Synthetic & high-performance oil photos
│   ├── logoo neww.png                         # Lala Motors primary logo
│   └── logooooooo.png                         # Lala Motors alternate badge
│
└── [Data Migration & Diagnostic Scripts]/
    ├── import-csv-to-supabase.js              # Script to parse CSV and seed Supabase DB
    ├── migrate-to-parts-table.js              # Migration utility from legacy to new schema
    ├── migrate-to-parts-table-service-role.js # Migration using elevated Supabase service role
    ├── fix-rls-parts.js                       # Script to patch and verify RLS security policies
    ├── test-autoparts-query.js                # Database querying and connection testing script
    ├── test-client.js                         # API test script simulating client requests
    ├── test-server.js                         # Mock server for rapid API testing
    ├── test-supabase-autoparts.html           # In-browser Supabase query diagnostic tool
    ├── test-supabase.html                     # In-browser database connection test page
    ├── test-csv.html                          # In-browser CSV parsing & validation page
    └── test-email.html                        # In-browser Nodemailer testing interface
```

---

## 4. Key Modules & Feature Breakdown

### 1. Main Hub & Landing Page (`index.html`, `script.js`, `style.css`)
- **Hero Section**: High-impact brand introduction with direct CTAs for booking service, roadside emergency assistance, and exploring spare parts.
- **Service Showcase Grid**: Quick navigation cards for General Servicing, Bike Wash, Engine Repair, Custom Modifications, Restoration, Custom Paint, Emergency Breakdown, and Subscriptions.
- **Interactive Booking Modal**: Real-time form allowing users to select motorcycle brand, model, service type, preferred date/time slot, and pickup/doorstep service options.
- **Customer Testimonials & Statistics**: Social proof counters and real customer reviews.

### 2. Auto Parts E-Commerce Catalog (`services/autoparts.html`, `autoparts-data.js`)
- **Search & Multi-level Filter**: Filter parts by Brand (Hero, Honda, Bajaj, Yamaha, Royal Enfield, TVS, KTM, Suzuki), Model, Category (Engine, Brakes, Electrical, Suspension, Body Parts, Transmission, Oils & Lubricants), and Price range.
- **Live Supabase Integration**: Real-time stock status (`in_stock`, `out_of_stock`), price calculation, discount badges, and image galleries.
- **Cart Integration**: Add to cart, quantity selection, persistent local cart storage, and checkout redirection.

### 3. Motorcycle Buy & Sell Marketplace (`services/sale.html`, `submit-bike.html`)
- **Browse Listed Bikes**: Filter available verified second-hand motorcycles with mileage, model year, condition ratings, asking prices, and verified photos.
- **Sell Your Bike Form**: Multi-step submission form storing listings in the `bike_listings` table with owner contact details and bike specs for admin verification.

### 4. Specialized Service Pages
- **Periodic Maintenance (`services/servicing.html`)**: Standard, Comprehensive, and Major service tier comparisons.
- **Bike Wash & Detailing (`services/bikewash.html`)**: Foam wash, Teflon coating, deep degreasing, and ceramic treatment options.
- **Custom Modification (`services/modify.html`)**: Scrambler, Cafe Racer, Cruiser, and Tourer custom build inquiries.
- **Emergency Breakdown Assistance (`services/emergency.html`)**: Geolocation sharing and instant dispatch request for flat tires, battery jumpstart, fuel delivery, or towing.
- **Restoration & Painting (`services/restoring.html`, `services/painting.html`)**: Vintage restorations, tank custom paint, anti-rust coatings.
- **Subscription Plans (`services/subscription.html`)**: Quarterly and annual maintenance memberships offering scheduled free washes, discounts on parts, and priority service slots.

### 5. Authentication, User Portal & Admin Dashboard
- **Authentication (`services/login.html`, `services/register.html`)**: Supabase Auth (email/password), session persistence, and role verification.
- **User Dashboard (`services/profile.html`, `services/orders.html`, `services/address.html`, `services/last-services-booked.html`)**: Manage vehicle garage details, address book, past booking logs, and part orders.
- **Admin Dashboard (`services/admin.html`)**:
  - Live inventory management (Add, Edit, Delete, Stock update of spare parts).
  - Review and approve pending motorcycle listings.
  - View incoming booking appointments and customer dispatch queries.

---

## 6. Database Schema & Data Models

### Table: `parts`
```sql
CREATE TYPE part_status AS ENUM ('in_stock', 'out_of_stock', 'discontinued');

CREATE TABLE parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status part_status DEFAULT 'in_stock',
    sku TEXT UNIQUE,
    weight DECIMAL(8,2),
    dimensions TEXT,
    manufacturer TEXT,
    warranty_months INTEGER DEFAULT 12,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

**Triggers & Logic**:
- Auto `updated_at` on update.
- Auto status toggle: `quantity <= 0` sets status to `'out_of_stock'`; `quantity > 0` sets status to `'in_stock'`.
- Auto SKU generation: Formatted as `UPPER(BRAND[0:3]-MODEL[0:3]-CATEGORY[0:3]-UUID[last8])`.

### Table: `bike_listings`
```sql
CREATE TABLE bike_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    bike_brand TEXT NOT NULL,
    bike_model TEXT NOT NULL,
    year INTEGER NOT NULL,
    kms_run INTEGER NOT NULL,
    condition TEXT NOT NULL,
    asking_price INTEGER NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'sold', 'rejected'
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

---

## 7. Backend API Endpoints & Workflows

| Endpoint | Method | Handler File | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | `server.js` | Server health and uptime check. |
| `/api/booking` | `POST` | `api/booking.js` / `server.js` | Forwards service booking details directly to Google Apps Script Webhook. |
| `/api/send-confirmation` | `POST` | `api/send-confirmation.js` | Sends HTML confirmation email to the user and notification email to the shop owner. |
| `/api/send-email` | `POST` | `routes/email.js` | Local development Express route for email notifications. |
| `/services/*` | `GET` | `server.js` | Serves individual service pages with caching headers. |

---

## 8. Environment Variables Configuration

The `.env` file required in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Credentials
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Email / Nodemailer Configuration
GMAIL_USER=lalamotors1@gmail.com
GMAIL_PASS=<your-app-specific-password>

# External Services
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/<script-id>/exec
```

---

## 9. Development & Deployment Commands

```bash
# 1. Install dependencies
npm install

# 2. Run locally with hot-reloading (nodemon)
npm run dev

# 3. Run in production mode
npm start

# 4. Import / Seed CSV spare parts to Supabase
node import-csv-to-supabase.js

# 5. Execute schema migrations
node migrate-to-parts-table-service-role.js
```

---

## 10. Key Integration Highlights for AI Prompting & Gemini

- **E-Commerce & Catalog**: Powered by Supabase table `parts` with automatic SKU and stock handling.
- **Booking Flow**: Multi-step booking form on client -> `/api/booking` -> Google Apps Script (Google Sheets) + `/api/send-confirmation` -> Nodemailer (Dual emails).
- **Security**: PostgreSQL RLS enabled for public reads and authenticated user/admin modifications.
- **Design Philosophy**: High-performance Vanilla JavaScript, CSS custom properties, responsive desktop-and-mobile layout, without heavy frontend framework overhead.
