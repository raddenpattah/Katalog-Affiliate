# Alfeto

Alfeto adalah katalog produk dekorasi dan blog inspirasi ruang aesthetic.

## Getting started

Install dependencies and start the Astro development server:

```sh
npm install
npm run dev
```

Astro serves the site at `http://localhost:4321`.

## Build

```sh
npm run build
npm run preview
```

## Pages

- `/` — product catalog with category filters
- `/blog` — blog index backed by Astro Content Collections
- `/blog/<slug>` — individual Markdown or MDX articles
- `/about` — tentang Alfeto
- `/contact` — formulir kontak yang membuka aplikasi surel pengunjung
- `/privacy-policy` — kebijakan privasi dan informasi tautan rekomendasi

Product details and Shopee URLs are in `src/data/products.ts`. Replace the sample search URLs with your product links before publishing. The initial category data is in `src/data/category-options/`; the CMS-managed category collection is the source for category choices on the site. Add blog entries as `.md` or `.mdx` files under `src/content/blog/`, with `title`, `description`, and `pubDate` frontmatter. Draft posts can be hidden from the public blog by setting `draft: true`.

## Blog CMS

Decap CMS is available at `/admin/`. Its blog collection edits Markdown files in
`src/content/blog/` and saves uploaded hero images to `public/images/blog/`,
using `/images/blog/...` paths in the article frontmatter.

The CMS uses the GitHub backend for this repository. Before signing in on a
deployed site, configure a GitHub OAuth app and an OAuth provider for Decap CMS;
authentication credentials are intentionally not stored in this repository.

The CMS also includes a **Produk** collection for editing product details and
Shopee links in `src/data/products/`. Product images can be uploaded from the
CMS to `public/images/products/`. Blog articles support a **Galeri Gambar**
field for adding any number of additional images with alt text and optional
captions; the images are uploaded to `public/images/blog/` and displayed below
the article body. These optional settings, including SEO title and description,
tags, scheduled publishing, gallery images, and related products, are grouped
under the collapsible **Pengaturan Lanjutan** section in the blog editor. Blog
author is fixed to **Alfeto**. The category field is in **Pengaturan Lanjutan**
to keep the main editor form compact; it still labels the article and helps
prioritize related products. Blog articles can select products from the Produk
collection; the CMS stores the selected product IDs.
Blog and product forms use the same managed category collection. To add a
category, open **Kategori** in the CMS, create an entry with a lowercase slug
ID (letters, numbers, and hyphens, such as `dekorasi-kamar`) and a display name.
The new category becomes available in product and blog forms and appears in the
public catalog filters after the content commit is deployed. Keep the ID
unchanged once it is used by products or articles; category deletion is disabled
to prevent leaving those entries with invalid references. Product search results
show the category alongside each name to make related items easier to find.

### Scheduled blog publishing

Set **Jadwal Terbit** in the blog editor to the date and time in the editor
device's WIB (UTC+07:00) timezone. Leave it empty to publish the article on the
next regular deploy. Scheduled articles stay hidden from the blog index and
their direct URLs until their scheduled time. A GitHub Actions workflow checks
for due posts every five minutes and triggers a Vercel deployment; the exact
publish time can be delayed by the workflow queue and deployment duration.

To enable automatic scheduled deployments:

1. In Vercel, open the project **Settings > Git > Deploy Hooks**, create a hook
   for the `main` branch, and copy its URL.
2. In GitHub, open the repository **Settings > Secrets and variables >
   Actions** and add a repository secret named `VERCEL_DEPLOY_HOOK` with that
   URL.
3. Ensure GitHub Actions is enabled for the repository.

The workflow triggers one deployment for each set of due articles. Manual or
CMS commits continue to deploy through the existing Git integration.

### GitHub OAuth for a Vercel deployment

Vercel does not provide a built-in OAuth proxy for Decap's GitHub backend. Keep
the site on Vercel and run a small OAuth proxy separately on the Cloudflare
Workers free plan. The CMS calls the proxy only for sign-in; it continues to
read and commit content through GitHub. This example uses the community
[decap-proxy Worker](https://github.com/sterlingwes/decap-proxy), not a Vercel
or Decap-managed service.

1. Deploy the site from this GitHub repository to Vercel and note its public
   URL (for example, `https://your-site.vercel.app`). Ensure Vercel redeploys
   when commits land on `main`.
2. Create a GitHub OAuth App at
   [GitHub Developer Settings](https://github.com/settings/developers) >
   **OAuth Apps** > **New OAuth App**:
   - **Homepage URL:** your public Vercel site URL.
   - **Authorization callback URL:** `https://<worker-name>.<account-name>.workers.dev/callback`.
   - Save the **Client ID** and **Client secret**. Never put the secret in this
     repository, the CMS config, or a `VITE_` environment variable.
3. Deploy the proxy by following the
   [decap-proxy Worker instructions](https://github.com/sterlingwes/decap-proxy#2-deploy-the-oauth-proxy).
   In short: clone that repository, copy `wrangler.toml.sample` to
   `wrangler.toml`, set a Worker name, run `npx wrangler login`, add the GitHub
   credentials as Worker secrets (`GITHUB_OAUTH_ID` and
   `GITHUB_OAUTH_SECRET`), then run `npx wrangler deploy`. Use the deployed
   `workers.dev` URL as `<worker-name>.<account-name>.workers.dev`. If this
   GitHub repository is private, set `GITHUB_REPO_PRIVATE = "1"` in the
   Worker configuration as described by the proxy instructions.
4. In `public/admin/config.yml`, add the proxy URL and auth endpoint under
   `backend`, replacing the example URL with the exact deployed Worker URL:

   ```yaml
   backend:
     name: github
     repo: raddenpattah/Katalog-Affiliate
     branch: main
     base_url: https://<worker-name>.<account-name>.workers.dev
     auth_endpoint: /auth
   ```

   Redeploy the Vercel site after committing this config change, then open
   `https://your-site.vercel.app/admin/` and sign in with a GitHub account that
   has **write access** to this repository.

The OAuth proxy is an extra service to maintain, and free-plan limits or terms
can change; check Cloudflare's current
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
For the official Decap GitHub backend details, see the
[Decap GitHub backend documentation](https://decapcms.org/docs/github-backend/).
