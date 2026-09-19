# The Imperium League — Player Research

Dark, mobile-first player research site for **The Imperium League**, built to feel like the front door of a future eFootball Mobile league rather than a generic form.

## Stack
- React + Vite
- Lucide React
- Supabase (optional until `.env` is configured)
- CSS-first visual system (no Tailwind dependency)

## Run in GitHub Codespaces

1. Create a GitHub repository named `the-imperium-league`.
2. Upload **all contents of this folder** into the repository root.
3. Open **Code → Codespaces → Create codespace on main**.
4. In the Codespaces terminal run:

```bash
npm install
npm run dev
```

5. Open the forwarded port **5173**.

Vite is already configured for `0.0.0.0` so the preview can be opened from Codespaces.

## Optional: Supabase

Copy `.env.example` to `.env` and add:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

Without Supabase credentials, the app still works in **demo mode** and validates the full questionnaire flow locally.

## Design system

Primary identity: **Imperium Gold**

Supporting accents:
- Gold `#FFC52B`
- Pink `#EC2A8C`
- Purple `#8B5CF6`
- Lime `#B8F34C`

The landing background is intentionally abstract and non-repetitive. The old full mockup image is **not** used as the page background. The right-side hero visual is a dedicated poster composition built from the Imperium art asset and CSS overlays.

## Questionnaire

19 questions, one question per screen, localStorage autosave, multi-select limits, rating grid, text responses, completion screen, and optional Supabase submission.

## Future roadmap

Research → Registration → Player Profiles → Fixtures → Results → Standings → Statistics → MVP/Awards → Hall of Fame.
