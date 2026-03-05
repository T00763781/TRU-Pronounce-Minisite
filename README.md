# TRU Diversity & Equity — Tab Mock (GitHub Pages)

This repo is a GitHub-hosted preview that simulates the TRU Diversity & Equity tab UI and includes the
**Name inclusion** content as **tab-content-3**.

## Deploy
1) Push this folder to GitHub as a repo (e.g., `TRU-Diversity-Equity-Tab-Mock`)
2) GitHub → Settings → Pages → Deploy from branch → `main` / `/ (root)`
3) Open:
- `/` (defaults to tab-content-1)
- `/#tab-content-3` (opens Name inclusion)

## What to show TRU
- `/#tab-content-3` is the “what it will look like” preview.
- In ACM CMS, TRU would paste the same HTML fragment into the tab panel container with `id="tab-content-3"`.

## Files
- `index.html` — mock page chrome + tabs + tab panels
- `styles.css` — minimal tru.ca-like styling for the preview
- `tabs.js` — accessible tab switching + hash deep links
- `assets/` — banner images used by the Name inclusion fragment
