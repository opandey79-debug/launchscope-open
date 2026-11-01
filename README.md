# LaunchScope Open 🌱

**A free, open-source website launch-readiness checker.** Audit the public-facing essentials of your website, including HTTPS, basic security headers, SEO title and description, H1, mobile viewport, robots.txt, sitemap.xml and favicon.

**GitHub repository:** https://github.com/opandey79-debug/launchscope-open

## Features

- 12 website launch checks with weighted 0–100 score and clear recommendations
- Responsive, mobile-friendly audit dashboard
- Reviews HTTPS, SEO, robots.txt, sitemap.xml, security headers and favicon
- Exports the report to JSON and offers browser Print/PDF
- Self-hostable using Node.js 20+ or Docker
- No paid API, database, sign-up or tracking dependencies
- JSON API: `POST /api/audit`

This is a **basic technical checklist**, not a full penetration test, accessibility, performance or SEO assessment. No scanning result guarantees rankings, indexing or security.

## Run locally

```bash
npm start
# Visit http://localhost:3000
npm test
```

Try the API:

```bash
curl -X POST http://localhost:3000/api/audit -H 'content-type: application/json' -d '{"url":"https://example.com"}'
```

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
