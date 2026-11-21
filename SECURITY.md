# Security Policy & Implementation Notes

This document details the security posture, Row-Level Security (RLS) model, input validation guarantees, and secret rotation procedures for the Lala Motors web platform.

---

## 1. Row-Level Security (RLS) Policies

All database access from public clients uses Supabase's PostgreSQL Row-Level Security. Policies are declared in `sql/20261112_001_add_rls_and_admin_policies.sql`.

### Inventory (`parts` & `autoparts`)
- **Public**: Unauthenticated and authenticated visitors have `SELECT` access (`true`) to browse the parts catalog.
- **Admin Only**: `INSERT`, `UPDATE`, and `DELETE` permissions are strictly restricted to authenticated users verified by the `public.is_admin()` database function.

### Pre-Owned Bikes (`bike_listings`)
- **Public Read**: Anyone can query approved listings (`status = 'approved'`).
- **Public Submission**: Anyone can submit a bike for sale, but the policy mandates `status = 'pending'` on `INSERT`.
- **Admin Management**: Only verified admins can update listing status (`approved`, `sold`, `rejected`) or delete records.
- **Privacy View (`public_bike_listings`)**: Exposes public bike details while omitting private customer contact information (`phone_number`, `email`) from client queries.

### Customer Addresses (`addresses`)
- **Owner Scoped**: Users can only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` rows matching their own `auth.uid() = user_id`.
- **Workshop Access**: Admins are granted view access for order delivery and service pickup fulfillment.

### Orders (`orders`)
- **Customer Access**: Users can only query their own order history (`auth.uid() = user_id`).
- **Admin Access**: Admins can view and update order status (`processing`, `shipped`, `delivered`).

---

## 2. Admin Authorization Architecture

Admin validation is enforced at the database engine level, not solely in browser JavaScript:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    );
$$;
```

- Client-side checks in `services/admin.html` only control UI view visibility. 
- Even if a client bypasses browser restrictions or sends requests directly to the Supabase PostgREST API, PostgreSQL blocks unauthorized database writes because the caller's session UID is not in `public.admins`.

---

## 3. API & Server Security Hardening

### Closed Open-Mail Relay (`api/send-confirmation.js` & `routes/email.js`)
- **Fixed Template Only**: The server constructs email HTML internally. Raw client-supplied HTML or custom email bodies are rejected.
- **Strict Input Validation**: Fields (`name`, `service`, `date`, `time`, `phone`, `email`) are validated with strict regex patterns and character length constraints.
- **XSS & Injection Protection**: User values are escaped with `escapeHtml()` prior to template interpolation.
- **Rate Limiting**: Sliding-window IP rate limiting restricts rapid POST requests (maximum 5 requests per minute per IP address).

### Booking Proxy Protection (`api/booking.js`)
- Enforces HTTP `POST` only.
- Sanitizes request payloads and forwards only approved booking parameters to Google Apps Script.
- Prevents verbose error leakage; internal service failures return sanitized messages.

### CORS Origin Restriction (`server.js`)
- Replaced open `cors()` with origin-filtering:
  - In production: strictly locked to `process.env.CORS_ORIGIN`.
  - In development: permits `http://localhost:3001` and `http://127.0.0.1:3001`.

---

## 4. Secret Rotation Checklist

If credentials ever need to be rotated or refreshed, follow this checklist:

1. **Gmail App Password (`GMAIL_PASS`)**:
   - Go to Google Account -> Security -> 2-Step Verification -> App Passwords.
   - Delete the old App Password and generate a new 16-character password.
   - Update `GMAIL_PASS` in your local `.env` and in the Vercel project settings.
2. **Google Apps Script Webhook URL (`GOOGLE_SCRIPT_URL`)**:
   - Open your Google Sheets script editor.
   - Deploy as Web App -> New Deployment.
   - Copy the new Web App URL and update `GOOGLE_SCRIPT_URL` in `.env` and Vercel.
3. **Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)**:
   - Only used in offline administrative migration scripts (`/scripts`).
   - If rotated in Supabase Dashboard (Project Settings -> API), update `.env`. Never expose this key in client-side code.
4. **Supabase Anon Key (`SUPABASE_ANON_KEY`)**:
   - If rotated in Supabase Dashboard, update `.env`, Vercel environment variables, and `supabase-client.js`.

