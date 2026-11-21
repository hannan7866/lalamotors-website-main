# Changelog

All notable changes made to the Lala Motors web platform codebase are documented below, organized by phase.

---

## [Phase 1: Security Fixes] - 2026-11-12

### Changed
- **Closed Open Mail Relay (`api/send-confirmation.js`, `routes/email.js`)**:
  - Replaced raw client-supplied `to`, `subject`, and `html` parameters with a fixed, server-rendered confirmation template.
  - Implemented strict input validation and character length bounds (`name`, `service`, `date`, `time`, `phone`, `email`).
  - Added HTML escaping (`escapeHtml`) to prevent injection and XSS in email clients.
  - Added IP-based rate limiting (5 requests/minute) to stop spam and denial-of-service attempts.
  - Routed workshop notification emails to `process.env.SHOP_EMAIL` instead of hardcoded fallbacks.
- **Removed Hardcoded Credentials & URLs**:
  - Removed hardcoded Google Apps Script URL from `api/booking.js` and `server.js` in favor of `process.env.GOOGLE_SCRIPT_URL`.
  - Removed fallback Gmail address from `api/send-confirmation.js`.
  - Created `.env.example` defining all required configuration variables.
  - Verified `.env` is ignored by Git in `.gitignore`.
- **Restricted CORS Policy (`server.js`)**:
  - Replaced unconfigured `cors()` with origin filtering restricted to `process.env.CORS_ORIGIN` (allowing `localhost` only in development).
- **Hardened Row-Level Security (RLS)**:
  - Created new migration file `sql/20261112_001_add_rls_and_admin_policies.sql`.
  - Added `admins` table and `public.is_admin()` SQL function for database-enforced permissions.
  - Restricted `parts` CUD (create/update/delete) operations to admins only, keeping read access public.
  - Secured `bike_listings` so public can view approved bikes, public submissions are forced to `'pending'`, and only admins can approve/modify records.
  - Added `public_bike_listings` view to mask private seller phone and email information.
  - Added user-scoped policies for `addresses` and `orders`.
- **Admin Access Documentation (`services/admin.html`)**:
  - Added security advisory notes clarifying that front-end UI checks are purely visual and database security is enforced by RLS.
- **Secret Audit**:
  - Scanned entire repository for exposed credentials, keys, and tokens and documented locations.

---

## [Phase 2: Repo Cleanup] - 2026-11-12

### Removed
- **Redundant Duplicate Files**:
  - Deleted duplicate `public/style.css` (retained primary root `style.css`).
  - Deleted stale `services/autoparts-data.js` and empty `functions/autoparts-data.js` (retained root `autoparts-data.js`).
  - Deleted legacy root stub `admin.html` (retained full admin dashboard `services/admin.html`).

### Changed
- **Scripts Reorganization**:
  - Moved all migration and test scripts into `/scripts/` directory:
    - `scripts/import-csv-to-supabase.js`
    - `scripts/migrate-to-parts-table.js`
    - `scripts/migrate-to-parts-table-service-role.js`
    - `scripts/fix-rls-parts.js`
    - `scripts/test-autoparts-query.js`
    - `scripts/test-client.js`
    - `scripts/test-server.js`
    - `scripts/test-csv.html`
    - `scripts/test-email.html`
    - `scripts/test-supabase.html`
    - `scripts/test-supabase-autoparts.html`
  - Added structured header comments to all scripts explaining their purpose, when to execute them, and usage instructions.
  - Removed hardcoded credentials inside scripts, reading from environment variables instead.
- **Address Module Architecture**:
  - Documented placeholder status of `services/address.js` and provided future implementation blueprint.
  - Created complete PostgreSQL table schema in `sql/addresses.sql`.
- **Deployment Ignore Rules**:
  - Updated `.gitignore` to explicitly ignore `tunnel-config.yml`.
  - Completely updated `.vercelignore` to exclude local server files, development scripts, repository analysis dumps, and local secrets from production serverless deployments.

---

## [Phase 3: Code Quality] - 2026-11-12

### Added
- **`supabase-client.js`**:
  - Shared singleton client managing `window.supabaseClient` and `window.getSupabaseClient()`.
  - Added reusable `showUserMessage()` toast notification helper and `safeSupabaseQuery()` wrapper.
- **`logger.js`**:
  - Lightweight backend logging utility quiet in production (`NODE_ENV=production`) while maintaining warnings and error traces.

### Changed
- **Refactored Client Setup**:
  - Removed duplicate client initializations and hardcoded credentials across `script.js`, `index.html`, `services/admin.html`, `services/autoparts.html`, `services/login.html`, `services/register.html`, `services/profile.html`, `services/sale.html`, and `services/last-services-booked.html`.
- **Error Handling & Resilience**:
  - Added `try/catch` and user-friendly error fallback displays to `loadPartsData()` in `services/autoparts.html`.
  - Added error handling and non-blocking toast notifications in `services/profile.html` replacing blocking browser `alert()` popups.
  - Protected sidebar session retrieval in `script.js` against expired tokens and offline failures.
- **Catalog Performance & Pagination**:
  - Implemented responsive client-side pagination (12 items per page) in `services/autoparts.html` with Previous/Next controls, page counters, and auto-scroll.
  - Prevents browser lag and high memory consumption when rendering large collections of spare parts.
- **Accessibility & Mobile Enhancements**:
  - Added descriptive `aria-label` attributes to search fields and sort select elements in `services/autoparts.html`.
  - Added global `:focus-visible` outline styles in `style.css` for high-contrast keyboard navigation without disrupting mouse-click aesthetics.

---

## [Phase 4: Documentation & Handover] - 2026-11-21

### Added
- **`README.md`**: Complete rewrite with project overview, architecture diagram, local setup, environment variables, Vercel serverless deployment steps, and migration instructions.
- **`SECURITY.md`**: Detailed document covering Row-Level Security, admin authorization, API protection, and secret rotation steps.
- **`CHANGELOG.md`**: Detailed summary of all improvements organized by development phase.

