# LaunchScope Open 🌱

**A free, open-source website launch-readiness checker.** Audit the public-facing essentials of your website, including HTTPS, basic security headers, SEO title and description, H1, mobile viewport, robots.txt, sitemap.xml and favicon.

**GitHub repository:** https://github.com/opandey79-debug/launchscope-open

**[▶ Try the live demo](https://launchscope-open.onrender.com/)** · **[🚀 Deploy your own free demo on Render](https://render.com/deploy?repo=https://github.com/opandey79-debug/launchscope-open)**

**[🗓 Product Hunt — November 12 pre-launch checklist](docs/PRODUCT_HUNT_PRELAUNCH_RUNBOOK.md)** · Launch scheduled for **12:01 AM PST / 1:31 PM IST** according to the maker's Product Hunt confirmation. No Product Hunt live listing has been verified yet.

To try it: open the live app, enter a public website you own or are authorized to assess (or choose **Try example.com**), press **Run free audit**, then review your score and 12 findings. Export as **CSV / JSON / PDF**, or **Copy summary** to share a quick text report. A link with `?site=https%3A%2F%2Fexample.com` prefills the domain without automatically scanning it.


## Features

- 12 website launch checks with weighted 0–100 score and clear recommendations
- Responsive, mobile-friendly audit dashboard
- Reviews HTTPS, SEO, robots.txt, sitemap.xml, security headers and favicon
- Exports CSV / JSON / directly downloadable PDF, offers browser printing and copyable text summaries for a developer or client
- Example scan shortcut, query parameter URL prefill and social link-preview metadata
- Self-hostable using Node.js 20+ or Docker
- No paid API, database, sign-up or tracking dependencies
- JSON API: `POST /api/audit`

This is a **basic technical checklist**, not a full penetration test, accessibility, performance or SEO assessment. No scanning result guarantees rankings, indexing or security.

## Share LaunchScope with other website builders

The live app now includes a **Share free tool** action (native mobile sharing or a copy-link fallback), plus a direct link to its public GitHub source. The goal is to make it easy for early users to share a useful free resource. No hidden referral code or tracking is involved.

**[Open the live app](https://launchscope-open.onrender.com/)** · **[Public launch kit and post drafts](docs/LAUNCH_KIT.md)**

## Help us improve: early testers welcome

**A 3-minute feedback test:** [Run the live demo](https://launchscope-open.onrender.com/), try `example.com` or a site you are authorized to assess, read the 12 findings, and check CSV / Copy summary.

- **[Tell us what worked or didn't (early tester thread)](https://github.com/opandey79-debug/launchscope-open/issues/1)**
- **[Structured feedback or bug report](https://github.com/opandey79-debug/launchscope-open/issues/new/choose)**
- **[Contribute code or translations](CONTRIBUTING.md)**

Please don't share secrets, customer data, or private URLs. You need a GitHub account to submit an Issue. **We don't publish invented user counts or testimonials.**



## Run locally

```bash
npm ci
npm start
# Visit http://localhost:3000
npm test
```

Set `PUBLIC_URL` to your canonical public URL when self-hosting so robots.txt and sitemap.xml use the correct origin. It defaults to the live demo URL.

PDF exports render the current audit snapshot with embedded Latin and Devanagari fonts; they do not run another scan.

Try the API:

```bash
curl -X POST http://localhost:3000/api/audit -H 'content-type: application/json' -d '{"url":"https://example.com"}'
```

## Free demo deployment (no Hostinger upgrade required)

[**Deploy a free demo on Render**](https://render.com/deploy?repo=https://github.com/opandey79-debug/launchscope-open)

The included [`render.yaml`](render.yaml) specifies a Node.js free web service, `npm install`, `npm start` and a health check. After signing in to Render and approving the Blueprint, it will create a public `.onrender.com` URL if deployment succeeds. No custom domain is required.

**Limitations:** Render free web services spin down after 15 minutes without traffic and may take around one minute to wake up. This is for testing/hobby/demo use, not production-grade availability. No sales commission is associated with a Render demo; Hostinger partner commission is separate and requires Hostinger approval and an issued referral link.

## Netlify Free deployment

The included `netlify.toml` serves the frontend through Netlify's CDN and routes the audit, PDF, health and discovery endpoints to a Node.js function. The existing Node server, Docker and Render deployment continue to work.

1. Import this public repository into a Netlify **Free** account. Do not select a paid trial or enable paid add-ons.
2. Let Netlify use `netlify.toml` (build command `node scripts/build-netlify.mjs`, publish directory `dist`). Node.js 22 is selected for the build.
3. Netlify's `URL` sets the canonical origin automatically. Set `PUBLIC_URL` only if you need to override it for a custom domain.
4. Verify a live audit, the PDF/CSV/JSON downloads and `/robots.txt`/`/sitemap.xml` before switching any public launch links.

As checked on November 8, 2026, Netlify Free includes 300 credits/month with a hard limit and no automatic recharge. Deploys, traffic and function compute consume credits; sites can pause at the limit. This is not unlimited hosting. See [current Netlify credit pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).

Functions have a 60-second execution limit; very slow targets can time out. Static assets do not invoke the audit function. Netlify's function rate limit is 12 requests per IP per minute, in addition to the existing per-instance application limits. Serverless instances do not share in-memory counters. Review platform usage and rate limits as traffic grows.

## Hostinger deployment

1. Open your Hostinger hPanel and choose **Websites → Create site → Web App → Import Git Repository** (the exact path depends on your plan and hPanel).
2. Choose `https://github.com/opandey79-debug/launchscope-open`.
3. Deploy as Node.js 20+ with start command `npm start`, and the port set in `PORT`.
4. Test your public URL and ensure outbound HTTPS/DNS connections are permitted.

Node.js hosting depends on your subscription. Guide: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

Or use Docker on a compatible VPS:

```bash
docker compose up -d --build
```

## Hostinger Open Source Partners — potential commission

The program advertises 20% commission on eligible first purchases made through an **approved** personal Hostinger Deploy button, subject to its terms. **No commission is guaranteed and no partner code is currently configured here.**

1. Maintain this public GitHub repository with its MIT license and README.
2. Apply from https://www.hostinger.com/open-source-partners or the **Open source partners** section in hPanel using **List your app**.
3. Wait for review and obtain your personal approved deploy/referral URL.
4. Only after approval, replace the empty `partnerDeployUrl` in `public/app.js`, and add the verified official Deploy button to the README.
5. Disclose that qualifying purchases through your referral link can earn you a commission, and follow Hostinger's current terms.

**Do not put an invented code in the app.** Your own hosting purchase or an app installation by itself does not earn a commission.

## Safety

Only scan public websites you own or are authorized to check. The backend blocks private/reserved IP ranges, checks DNS at socket connection time, limits rate and concurrency, applies timeouts and caps response size. Re-review these protections before production use. It is not designed as an open network proxy.

## License

[MIT](LICENSE) — free to use, modify, self-host, and redistribute under the license terms.
