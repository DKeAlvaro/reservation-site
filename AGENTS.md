# AGENTS.md

## Project

**Anzest Friends & Family** — a static reservation page for the Anzest brand inauguration event. Visitors pick a date, time, guest count, and submit contact details. Deployed to GitHub Pages at `opening.anzest.es`.

- **Language:** Spanish (UI text)
- **Backend:** None — form submissions are emailed via [Web3Forms](https://web3forms.com) API
- **Font:** Cascadia Code (variable, via CDN)

## Structure

```
index.html          # Single-page app: multi-step reservation form (6 steps) + success view
anzest_styles.css   # Design system & all styles (CSS custom properties, components, responsive)
dist/output.css     # Built CSS output
CNAME               # GitHub Pages custom domain (opening.anzest.es)
```

Everything is vanilla HTML, CSS, and JS — no frameworks, no build step required.

## Key Details

- **Form steps:** date → guest count → time slot → name → email → optional fields (phone, invited by, notes)
- **Time slots:** 08:00–20:00 in 30-min intervals, rendered as a button grid
- **Validation:** per-step client-side validation with animated error states
- **Config constants** (in `index.html` `<script>`):
  - `WEB3FORMS_ACCESS_KEY` — Web3Forms API key
  - `BUSINESS_EMAIL` — recipient email
  - `TOTAL_STEPS` — number of form steps
- **Design tokens** live in `:root` CSS variables in `anzest_styles.css` (colors, spacing, typography, shadows)
- **Responsive breakpoints:** 768px, 640px, 480px, 360px + `prefers-reduced-motion` support

## Local Dev

```bash
python -m http.server 8080
# open http://localhost:8080
```

No dependencies to install. The `node_modules/` and `dist/` directories exist from a Tailwind CSS setup but are not actively used.
