# GitHub Pages website

Public URL: <https://adsorgcn.github.io/hotel-corporate-codes/>.

This static site is generated from `data/*.json`. The source data, npm package and separately deployed hotelcorporatecodes.com application are unchanged. Search, hotel-group filtering, rental records and copy buttons run locally in the browser. Each record retains string codes, source links and its historical fields. The complete directory is also present in the generated HTML for readers without JavaScript.

## Build and preview

Node.js 24; no package installation is required.

```sh
node site/build.mjs
node --test site/test/*.test.mjs
node site/preview.mjs
```

Open <http://127.0.0.1:4173/hotel-corporate-codes/> for a local preview using the actual project prefix. All local asset URLs are relative. `_site/` is generated output and is not committed.

## Publishing boundary

`.github/workflows/pages.yml` runs on pushes to `main` that affect the site, `data/`, `.zenodo.json` or that workflow. Manual dispatch is also available, with build/deploy jobs restricted to `refs/heads/main`. Pull requests get a build-and-test check without deployment. There is no `release` event and no trigger on `hotel-data-maintenance`; routine data releases cannot publish this page or send anything to Zenodo.

The build checks the existing dataset tests and README tables as well as the Pages tests before uploading `_site/`. The deploy job uses GitHub’s `github-pages` environment with `pages: write` and `id-token: write`. Repository settings must select **GitHub Actions** as the Pages source. No custom domain, CNAME, redirect or external credential is used.

Action revisions were resolved from official action repositories on 2026-11-08 and pinned to complete commit hashes. The workflow follows [GitHub’s custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

The page has its own canonical URL, the existing dataset concept DOI, and links to the original site, Zenodo, GitHub and npm. DataDownload URLs are pinned to the actual build commit. DOI publication remains a separate workflow and is never performed by this site build.

See [ASSETS.md](ASSETS.md) for photo provenance and licensing.
