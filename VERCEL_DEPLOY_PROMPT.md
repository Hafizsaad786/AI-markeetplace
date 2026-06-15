# Vercel Deploy Prompt — AI marketplace

Yeh TanStack Start app hai (React 19 + Vite 7 + Supabase + Lovable AI). Vercel par deploy karna hai.

## Build settings
- Framework preset: **Other**
- Install command: `bun install` (ya `npm install`)
- Build command: `bun run build` (ya `npm run build`)
- Output directory: `.output/public` (auto-detect chalega)
- Node version: 20+

## Environment Variables (Vercel Dashboard -> Settings -> Environment Variables)

Public (already `.env.example` me filled — wahi values paste karein):
- `VITE_SUPABASE_URL` = `https://nxmrnvpvodkbpvvmdimz.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_TbQjq9m-v7SbV68HuLsW4w_UyGWWioe`
- `VITE_SUPABASE_PROJECT_ID` = `nxmrnvpvodkbpvvmdimz`
- `SUPABASE_URL` = `https://nxmrnvpvodkbpvvmdimz.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_TbQjq9m-v7SbV68HuLsW4w_UyGWWioe`
- `SUPABASE_PROJECT_ID` = `nxmrnvpvodkbpvvmdimz`

SECRET (mai zip me include nahi kar sakta — security reason; user khud paste kare):
- `SUPABASE_SERVICE_ROLE_KEY` = Lovable Cloud → Backend → Project Settings → API → `service_role` key copy karke paste karein
- `LOVABLE_API_KEY` = Lovable Cloud → Secrets se copy karke paste karein

## Notes
- App ka name: **AI marketplace**
- Admin email: `hafizsaadraza58@gmail.com` (auto-approved + admin role)
- Server functions aur `/api/*` routes server-side hain — Vercel par Node/Edge runtime chahiye, static frontend-only deploy NAHI chalega.
- WhatsApp admin: +92 313 3488621
