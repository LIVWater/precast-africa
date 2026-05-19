# Precast Africa — Website

Static marketing site for Precast Africa. Deployed on Vercel.

## Local development

This is a plain static site — no build step. To preview locally:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000/>.

## Structure

- `index.html` — entry redirect to the main landing page
- `precast-africa-warwick-style.html` — main landing page
- `system.html`, `process.html`, `developers.html`, `sustainability.html`, `news.html`, `manifesto.html`, `build-your-project.html`, `contact.html` — primary nav pages
- `*-case.html`, `*-question.html`, `*-pipeline.html`, etc. — article pages linked from `news.html`
- `assets/css/` — stylesheets (`precast.css` main, `blog-manifesto.css` for articles)
- `assets/js/precast.js` — site interactions
- `assets/logos/` — brand SVGs
- `assets/lottie/` — Lottie animations
- `Background Images/`, `Renders/`, `Graphics/`, `Precast Modules/` — image and video assets

## Deployment

Pushes to `main` deploy automatically via Vercel. Configuration is in `vercel.json`:

- Clean URLs (no `.html` extensions in production URLs)
- Long-term caching for static assets
- Standard security headers

## Optimisation notes

- Hero/background videos re-encoded at 720p H.264, CRF 30, faststart
- Large images resized to max 1920px and re-encoded (mozjpeg q80 / palette PNG q78)
- All non-hero images use `loading="lazy"` and `decoding="async"`
- Hero video uses `preload="metadata"` with a poster image fallback
- Responsive breakpoints at 1024px, 600px, 480px plus touch-pointer refinements
