# Jiazhou Chen — Portfolio

A data-driven React portfolio for [jiazhouchen.com](https://jiazhouchen.com). The site uses React, TypeScript, Vite, and local JSON content. It does not require a CMS, backend, hosted map, or external font service.

## Local development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run build
npm run test:e2e
```

The production build creates static entry pages for `/cv/`, `/research/`, and `/connect/`, then verifies privacy and indexing requirements.

## Editing content

All public website content lives in [`src/content`](src/content). Update the relevant JSON file and push the change to `main`; GitHub Actions validates and redeploys the site.

- `profile.json` — name, current role, affiliation, and location
- `contact.json` — email target and professional profiles
- `post.json` — dated Connect-page posts; set `expiresAt` to an ISO date to hide a post after that date, or `null` to keep it visible
- `education.json`, `research.json`, `teaching.json` — CV positions
- `publications.json`, `presentations.json`, `awards.json`, `skills.json`, `additional.json` — CV details; research outputs include their research-area IDs and expandable descriptions
- `locations.json` — shared map coordinates; Home experiences are inferred from education, research, and profile data
- `researchAreas.json` — research section titles, navigation labels, and introductions

Every record uses a stable kebab-case `id`. Research-area IDs on publications and presentations must match records in `researchAreas.json`; invalid or duplicate references fail the build with a field-specific error.

Add any `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` portrait to `asset/portraits/`. The build discovers every matching image automatically. A full page visit selects a portrait other than the visitor's previous one when alternatives exist. Name special portraits `rare1.jpeg`, `rare2.png`, and so on to place them in a shared rare pool that has a 1% chance of being selected per visit.

## Privacy and indexing

The public CV omits the phone number, does not visibly spell out the email address, and does not deploy the source PDF, Pages, or Markdown documents. Its static HTML contains `noindex, nofollow`, and `/cv/` is omitted from the sitemap. `robots.txt` leaves the route crawlable so search engines can read the `noindex` directive.

## GitHub Pages and Squarespace Domains

The Pages workflow deploys `dist` from `main`. In repository **Settings → Pages**, select GitHub Actions, set `jiazhouchen.com` as the custom domain, complete GitHub's TXT-record verification, and enable HTTPS after certificate provisioning.

In Squarespace Domains, preserve mail-related MX/TXT records and replace only conflicting web-hosting records with:

- `A @ → 185.199.108.153`
- `A @ → 185.199.109.153`
- `A @ → 185.199.110.153`
- `A @ → 185.199.111.153`
- `AAAA @ → 2606:50c0:8000::153`
- `AAAA @ → 2606:50c0:8001::153`
- `AAAA @ → 2606:50c0:8002::153`
- `AAAA @ → 2606:50c0:8003::153`
- `CNAME www → jiazhouchen.github.io`
- GitHub's account-specific `_github-pages-challenge-Jiazhouchen` TXT record

After propagation, verify both `jiazhouchen.com` and `www.jiazhouchen.com`; GitHub Pages will redirect `www` to the apex domain.
