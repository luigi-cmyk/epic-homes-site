# Epic Homes Site

Marketing website for **Epic Homes Development** — a custom modern farmhouse and luxury home builder serving Massachusetts, New Hampshire, Rhode Island, and Connecticut.

🌐 **Live site:** [theepichomes.com](https://theepichomes.com)

## About the project

Single-page static website showcasing Epic Homes' services, completed projects, customer testimonials, and contact form. Built as a polished marketing site with a focus on lead capture for new home builds.

## Tech stack

- **HTML5** — single-page layout with semantic sections
- **CSS3** — custom design system, no framework
- **Vanilla JavaScript** — image carousel, mobile menu, form handling
- **Google Fonts** — Playfair Display + Inter

No build step. No external dependencies.

## Project structure

```
epic-homes-site/
├── index.html       # Full page content (hero, about, projects, FAQ, contact)
├── styles.css       # Design system + all component styles
├── script.js        # Carousel, mobile nav, form handling
└── assets/          # Logos and project photos
```

## Running locally

The site is fully static — you can open `index.html` directly in a browser, or serve it with any local web server:

```bash
# Python 3 (built into macOS)
python3 -m http.server 8000

# Node
npx serve .
```

Then visit [http://localhost:8000](http://localhost:8000).

## Sections

The page is a single scrollable layout with these sections:

- **Hero** — main pitch and primary call-to-action
- **About** — company overview and the three-company group structure
- **Services** — what they build (custom homes, ADUs, renovations, etc.)
- **Projects** — featured homes with photo carousels
- **Testimonials** — client reviews
- **Process** — 4-step build journey
- **FAQ** — common questions and honest answers
- **Contact** — form + office details
- **Newsletter** — priority list signup

## Business

**Epic Homes Development**
97 Central St, STE 204, Lowell, MA
📞 (978) 201-3507 · ✉️ info@theepichomes.com
Licensed: CSL 120115 · HIC 212727
