# TRU Diversity & Equity — Tab Mock (GitHub Pages) v2

This repo is a GitHub-hosted preview that simulates the TRU Diversity & Equity tab UI and includes the
**Name inclusion** content as **tab-content-3**.

## Block sequence (tab-content-3)
1) Banner (Name inclusion)
2) Your name matters
3) Carousel (Why my name matters)
4) Learning and sharing names
5) Share your name tool
6) Side-by-side how-to videos
7) Barriers and bridges

## Deploy
1) Push this folder to GitHub as a repo
2) GitHub → Settings → Pages → Deploy from branch → `main` / `/ (root)`
3) Open:
- `/` (defaults to tab-content-1)
- `/#tab-content-3` (opens Name inclusion)

## Content editing
Edit `content.md` in the repo root (key format):
- HERO_HEADING / HERO_BODY
- LEARNING_HEADING / LEARNING_BODY
- SHARING_HEADING / SHARING_BODY
- BARRIERS_HEADING / BARRIERS_BODY

No external libraries are used; `ni.js` parses and renders markdown-lite.

## Files
- `index.html` — chrome + tabs + tab panels + Name inclusion layout
- `styles.css` — minimal tru.ca-like styling + Name inclusion styles
- `tabs.js` — accessible tab switching + hash deep links
- `ni.js` — loads and injects content.md blocks
- `content.md` — editable copy blocks
- `assets/` — banner images
