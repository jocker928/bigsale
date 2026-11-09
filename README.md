# BIGSALE starter

A mobile-friendly BIGSALE storefront and admin dashboard using Supabase Auth, Database and Storage. Includes the exact logo image supplied by the shop owner.

## 1. Configure Supabase
1. Open `js/config.js`.
2. Replace `PASTE_SUPABASE_PROJECT_URL_HERE` with the Supabase Project URL.
3. Replace `PASTE_SUPABASE_PUBLISHABLE_KEY_HERE` with the Supabase publishable key (`sb_publishable_...`). Never use a secret/service_role key in browser code.
4. In Supabase SQL Editor, run the complete file `supabase/schema.sql`.

## 2. Create the first Super Admin
1. Open `signup.html` on your deployed site and register using your own email.
2. Confirm your email if Supabase requests it.
3. In Supabase SQL Editor, replace `YOUR_EMAIL_HERE` in the final SQL comment and run:
   `update public.profiles set role='super_admin' where id=(select id from auth.users where email='YOUR_EMAIL_HERE');`
4. Sign in at `admin-login.html`.

Only the Super Admin can promote an already registered customer to Staff Admin from the dashboard.

## 3. Google login
In Supabase Authentication > URL Configuration, set the Site URL to your deployed website URL and add its `/index.html` and `/login.html` redirect URLs. In Authentication > Providers > Google, enter your Google OAuth Client ID and Client Secret. In Google Cloud, add the Supabase callback URL shown in that provider page as an Authorized redirect URI. Do not commit the Client Secret.

## 4. Run locally
You can open `index.html` directly for a visual preview, but Supabase authentication and storage work best from a local web server or deployed HTTPS site. For a simple preview with Python installed:
`py -m http.server 8000`
Then open `http://localhost:8000`.

## 5. Deploy
This is a static frontend, so it can be deployed free on GitHub Pages. Upload the project contents to the root of your repository and enable GitHub Pages. After deployment, add the exact GitHub Pages URL to Supabase Authentication URL Configuration.

## Notes
- Product photo limit: 5 MB; JPG, PNG or WebP.
- Admin access is enforced by Supabase Row Level Security, not just by hiding a page.
- This starter currently provides product management and staff-role promotion. Customer checkout/order placement and order fulfilment screens are a later phase.
- Free service plans have usage limits and may change.
