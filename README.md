# VaqCorp

Website for [vaqcorp.com](https://vaqcorp.com): Rafael Vaquero's inventions and Radar. Static files, no build step, Spanish/English toggle on every page.

| Page | What it is |
|---|---|
| `index.html` | Home: hero, buttons to the sections, about, contact |
| `inventos.html` | My inventions + supported initiatives |
| `radar.html` | Cool inventions by other mad inventors (from `posts.json`) |

Shared: `site.css` (all pages), `home.css` (home only), `site.js` (language toggle + helpers). `radar.js` renders Radar; `radar-filters.js` adds Radar's search, tag/stamp chips and month filter. `img/` holds images.

## Add a Radar post

Add an entry to `posts.json` and push. Newest date shows first:

```json
{ "date": "2026-10-11", "url": "https://example.com",
  "title": "Product name",
  "note": { "es": "Por qué está bien.", "en": "Why it's cool." },
  "image": "img/radar/example.webp",
  "stamps": [{ "es": "DIVERTIDO", "en": "FUN" }, "ORIGINAL"],
  "tags": ["AI"] }
```

Optional `"try": { "label": {es, en}, "url": "https://tool/?url={vaqcorp}" }` adds a button that runs the tool on our site (`{vaqcorp}` becomes our public URL, set in `radar.js`).
`stamps` are the VaqCorp seal (shown big on the thumbnail); `tags` classify (small, under the text).
`title`, `note`, each stamp and each tag can be a plain string or `{es, en}`. `image`, `stamps` and `tags` are optional.

## Deploy

GitHub Pages via `.github/workflows/pages.yml` on every push to `main`.
Preview before the custom domain is set: https://redaah.github.io/vaqcorp/
