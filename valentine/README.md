# Valentine

A single-page vanilla HTML/CSS/JS app built with [Vite](https://vite.dev). Responsive for mobile and desktop.

## Commands

```bash
npm install          # first time
npm run dev          # dev server
npm run build        # production build → dist/
npm run preview      # preview dist/ locally
```

## Deploy to GitHub Pages

### 1. Create repo and push

- Create a new GitHub repo (e.g. `valentine`).
- If the repo name is not `valentine`, set `base` in `vite.config.js` to `'/<repo-name>/'`.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/valentine.git
git push -u origin main
```

### 2. Enable GitHub Pages (required)

1. Open the repo on GitHub.
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment** → **Source**, choose **GitHub Actions**.

No branch deploy or other options are needed; the workflow deploys the built site.

### 3. Deploy

- Every push to `main` runs `.github/workflows/deploy.yml`: install deps → `npm run build` → upload `dist/` → deploy to Pages.
- Site URL: **https://\<username\>.github.io/valentine/**

### 4. Repo name ≠ valentine

If you rename the repo, update `base` in `vite.config.js` to `'/<new-repo-name>/'` (with leading and trailing slashes) or assets will 404 on Pages.
