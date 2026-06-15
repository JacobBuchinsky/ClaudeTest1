# Test Page

A single-page static site: a black square containing the text "This is a test".

## Live site

Once GitHub Pages is enabled, the site will be available at:

`https://<your-username>.github.io/<repo-name>/`

## Local preview

Just open `index.html` in any browser, or serve it:

```sh
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploying changes

GitHub Pages rebuilds automatically on every push to the `main` branch:

```sh
git add .
git commit -m "Update page"
git push
```
