## What we'll build (v1)

A dark-themed (Charcoal Ember) Facebook Marketplace AI platform with admin-approved signup, plus the highest-impact AI modules. All AI uses Lovable Cloud + Lovable AI Gateway (Gemini for text, gpt-image-2 for images).

### Auth & Admin Approval Flow
- Email/password signup only (no Google login).
- New signups land in `pending` state — cannot access app until admin approves.
- Login: if pending → show "Awaiting admin approval" screen.
- Admin panel (`/admin`) lists pending users with Approve / Reject buttons.
- Your email `hafizsaadraza58@gmail.com` is auto-seeded as admin on first signup with that email (role: `admin`, status: `approved`).
- Roles stored in separate `user_roles` table with `has_role()` security-definer function (no privilege escalation).

### Modules (v1 functional)
1. **Dashboard** — overview cards, quick actions.
2. **Listing Generator** — form with selectable options (category, condition, country/city, language, tone, delivery, target audience) + free-text notes box. Each output field (title, description, price, tags, CTA, category, delivery) appears in its own copy-able box. Every generation uses high randomness so every user gets a unique, human-sounding, FB-safe output (anti-spam rules in system prompt to avoid suspension).
3. **AI Image Studio** — select options (product type, room style, lighting, camera angle, country aesthetic, "customer-shot" realism level) + notes. Generates realistic Marketplace-style images via gpt-image-2 streaming.
4. **Image Analyzer** — upload an image; AI returns suggested title, description, category, size estimate, condition, suggested price, tags. Each output in its own copyable box.
5. **Name Generator** — pick country + gender + count → returns authentic local names for that country (useful for seller persona variation).
6. **FB Post Generator**, **Ad Creative Generator**, **Multi-language Translator**, **Branding Kit**, **Reply Generator** — single-page generators each, using the same option-driven pattern.

### UI rules
- Dark Charcoal Ember palette, sidebar nav, mobile responsive.
- Every output field in its own bordered card with a Copy button.
- Generation requests include a random seed + per-user salt so two users never get identical output.
- System prompts enforce: human tone, no spammy caps, no repeated phrasing, locally believable, FB-policy-safe.

### Tech
- TanStack Start, Lovable Cloud (Supabase) for auth + profile/roles/approval, Lovable AI Gateway for text + image generation.
- DB tables: `profiles` (id, email, full_name, status: pending|approved|rejected), `user_roles` (user_id, role: admin|user). RLS + grants per security rules.
- Server functions for AI calls; streaming server route for image generation.

### Out of scope for v1 (can add later)
Analytics dashboard with real metrics, saved templates persistence, competitor analyzer, price optimization AI, viral analyzer — stubs/coming-soon cards only.

### What you'll do after build
1. Sign up with `hafizsaadraza58@gmail.com` / your password → you're auto-approved as admin.
2. Other users sign up → they appear in your admin panel pending → you approve.