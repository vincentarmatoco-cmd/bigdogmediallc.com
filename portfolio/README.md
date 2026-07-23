# Portfolio — folder-driven curation

The Work section on the homepage mirrors this folder structure. Highest-value work always renders first.

```
portfolio/
├── manifest.json                  ← the site reads this at runtime
└── homepage/
    ├── best_campaigns/            ← tier 01 · the payday shelf (renders FIRST)
    └── best_social_assets/        ← tier 02 · supporting social assets
```

## How to publish work

1. Export the asset (see budgets below) into the right folder.
2. Add an entry to the matching array in `manifest.json`:

```json
{
  "title": "Client Name",
  "result": "The number that closes deals (e.g. 6.1x ROAS on Meta)",
  "src": "portfolio/homepage/best_campaigns/client-hero.webp",
  "href": "#contact"
}
```

3. Commit and push — the site swaps its placeholder cards for your real work automatically. No entries yet? The styled placeholders keep the section alive.

Array order = display order. Put the highest-revenue campaign first in `best_campaigns`; it becomes the first thing a prospective client sees in the portfolio.

## Image budgets (GitHub Pages is static — weight is everything)

| Asset | Format | Target |
|---|---|---|
| Card thumbnail | WebP (or AVIF), ~1200px on the long edge, quality 75–80 | ≤ 300KB |
| Video preview | Poster image + link out (host video on YouTube/Vimeo/CDN) | don't commit .mp4 over ~8MB |

Quick compression: [squoosh.app](https://squoosh.app) (manual) or `npx @squoosh/cli --webp auto` (batch). All `src` paths must be **relative** (no leading `/`) so they survive `username.github.io/repo/` sub-path hosting.
