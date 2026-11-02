# VaqCorp

Website for [vaqcorp.com](https://vaqcorp.com): Rafael Vaquero's inventions and Radar. Static files, no build step, Spanish/English toggle on every page.

| Page | What it is |
|---|---|
| `index.html` | Home: hero, buttons to the sections, about, contact |
| `inventos.html` | My inventions + supported initiatives |
| `radar.html` | Cool inventions by other mad inventors (from `posts.json`) |

Shared: `site.css` (all pages), `home.css` (home only), `site.js` (language toggle + helpers). `radar.js` renders Radar (2-column card grid + a detail view per post); `radar-filters.js` adds the tag chips and search. `share.js` adds a share button (copy link + social networks, native share sheet on phones) to every card with an id. `img/` holds images.

## Add a Radar post

Add an entry to `posts.json` and push. Newest date shows first:

```json
{ "date": "2026-10-11", "url": "https://example.com",
  "title": "Product name",
  "note": { "es": "Por qué está bien.", "en": "Why it's cool." },
  "image": "img/radar/example.webp",
  "stamps": [{ "es": "DIVERTIDO", "en": "FUN" }, "ORIGINAL"],
  "tags": ["tool"] }
```

Optional `"try": { "label": {es, en}, "url": "https://tool/?url={vaqcorp}" }` adds a button that runs the tool on our site (`{vaqcorp}` becomes our public URL, set in `radar.js`).
`stamps` are the VaqCorp seal: the highlights shown on the card. `tags` can only be `tool`, `game` or `idea` (one or more; labels live in `RADAR_TAGS` in `radar.js`) and drive the chips at the top.
Each post opens its detail at `radar.html#<slug of title>` (e.g. `#big-words`); set `"id"` to override it. The grid card shows picture, title, site and stamps; the detail adds the date, note, link and `try` button.
`title`, `note` and each stamp can be a plain string or `{es, en}`. `image`, `stamps` and `tags` are optional.

## Deploy

GitHub Pages via `.github/workflows/pages.yml` on every push to `main`.
Preview before the custom domain is set: https://redaah.github.io/vaqcorp/
