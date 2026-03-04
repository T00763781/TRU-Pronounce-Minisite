# TRU Pronounce Minisite (POC)

A framed minisite for TRU’s Name Inclusion Project. Designed to “drop cleanly” into tru.ca (ACM CMS) later.

## What’s included
- Landing page with:
  - Pronunciation helper embed (iframe)
  - Space for **2 horizontal videos** (how to learn a name, how to teach your name)
  - A **carousel of 5 short videos** (students and staff sharing why names matter)
- Placeholder video files in `/assets/videos` and poster images in `/assets/posters`

## Configure the tool URL
Open `index.html` and set the `data-tool-url` attribute on the `<html>` element:

```html
<html lang="en" data-tool-url="https://YOUR-ORG.github.io/TRU-Name-Pronouncer/embed.html">
```

## Deploy (GitHub Pages)
1. Push this repo to GitHub.
2. Settings → Pages → Deploy from branch → `main` / `/root`.
3. Your minisite will be available at the Pages URL.

## ACM CMS (tru.ca) embed
Use `acm-embed-snippet.html` as a starting point in an HTML/Embed component.
