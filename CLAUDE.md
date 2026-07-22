# Epic Homes Site

Marketing site for Epic Homes Development (theepichomes.com) — custom home builder
in MA/NH/RI/CT. Static HTML/CSS/JS, no build step, deployed via GitHub Pages from `main`.
Lead capture goes to HubSpot; leads are the whole point of this site.

This repo ships a curated skill set in `.claude/skills/` — use it proactively.

## Skill routing

- **copywriting** — any text change on the site: headlines, sections, FAQ, emails.
  Human, benefit-driven; match the existing voice (direct, warm, no corporate filler).
- **cro** — anything touching conversion: forms, CTAs, page structure, pricing display.
- **seo-audit / ai-seo / programmatic-seo** — technical SEO, being cited by AI
  assistants, and scaled location pages (e.g. "custom home builder in [city], MA").
- **frontend-design** — visual/layout changes. Keep the brand: navy #0a1628,
  gold #c9a25f, Playfair Display + Inter.
- **ads / ad-creative** — paid campaigns for listings (e.g. 33 Heritage Ct).
- **brainstorming** — before any new page or campaign concept.
- **adversarial-review** — quality gate before merging significant changes.

## Conventions

- Site copy is in English (US customers). `heritage-pt.html` is the Portuguese variant.
- Design tokens live at the top of `styles.css`; reuse them, don't invent new colors.
- Test by opening `index.html` directly or `python3 -m http.server 8000`.
