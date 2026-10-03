# iamfatness.us

Umbrella landing site for **iamfatness.us** — the front door that introduces the
studio and links out to each product on its own subdomain:

- **CoreVideo** → https://corevideo.iamfatness.us/ (OBS plugin + CoreVideo Pro)
- **Resonance** → https://resonance.iamfatness.us/ (DJ-style music player / EQ)
- **SwarmScribe** → https://swarmscribe.iamfatness.us/ (transcription for recording archives and recorded calls; coming soon)

The product subdomains live in their own repos (`corevideo.iamfatness.us` in
[CoreVideo](https://github.com/iamfatness/CoreVideo); `resonance.iamfatness.us`
*is* the [Resonance](https://github.com/iamfatness/resonance) app itself). This
repo owns the root `iamfatness.us` landing page, plus the SwarmScribe
"coming soon" page until that product has a site of its own.

## What this is

A tiny, dependency-free static site served by a Cloudflare Worker, mirroring the
deployment pattern already used by `corevideo.iamfatness.us` and
`resonance.iamfatness.us`:

```
public/            Static site (served by the Worker's ASSETS binding)
  index.html       Landing page
  404.html         Custom not-found page
  assets/site.css  Brand styling (dark cyan/blue, matches CoreVideo)
  CNAME            iamfatness.us
site-worker.js     Worker: static assets + security headers + trailing slash + 404
wrangler.jsonc     Worker config + routes for iamfatness.us and www.iamfatness.us
sites/swarmscribe/ Second Worker (`swarmscribe-website`) for swarmscribe.iamfatness.us
  public/          Its static page, CSS and logo files (logo.svg, logo-lockup.svg, favicon.svg, og.png)
  og.html          Source for public/assets/og.png (screenshot at 1200x630; not deployed)
  wrangler.jsonc   Worker config; reuses ../../site-worker.js, bound as a custom domain
.github/workflows/deploy-site.yml   Deploy both Workers on push to main (or manual dispatch)
```

There is no build step — `public/` is served as-is.

## Local preview

```sh
npm install
npm run dev                # iamfatness.us
npm run dev:swarmscribe    # swarmscribe.iamfatness.us
```

## Deploy

Deployment goes to the Cloudflare Worker named `iamfatness-website`, bound to the
routes `iamfatness.us/*` and `www.iamfatness.us/*` in the `iamfatness.us` zone.

The `Deploy Site` GitHub Actions workflow runs on pushes to `main` that touch the
site, and can be triggered manually. It requires two repository secrets/vars:

- `CLOUDFLARE_API_TOKEN` (secret) — permission to deploy Worker scripts + assets
- `CLOUDFLARE_ACCOUNT_ID` (secret or variable)

Manual deploy:

```sh
npm install
npm run deploy   # wrangler deploy
```

After the secrets are set, run **Deploy Site**, then point the `iamfatness.us`
zone's route at the `iamfatness-website` Worker.
