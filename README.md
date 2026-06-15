# To-Do (React + Vite)

A single-page to-do list app. Each user's list is stored in **their own browser**
via `localStorage` — no accounts, no backend. Built with React + Vite and
deployed to GitHub Pages.

## Local development

```sh
npm install      # first time only
npm run dev      # start the dev server, then open the printed localhost URL
```

## Build / preview the production output

```sh
npm run build    # outputs static files to dist/
npm run preview  # serve the built dist/ locally to sanity-check
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in
`.github/workflows/deploy.yml`, which builds the app and publishes `dist/`
to GitHub Pages.

**One-time setup in the repo:** Settings → Pages → **Source: GitHub Actions**.

Live URL: `https://jacobbuchinsky.github.io/ClaudeTest1/`

> Note: the `base` in `vite.config.js` is set to `/ClaudeTest1/` to match the
> repo name. If you rename the repo, update `base` to match or assets will 404.
