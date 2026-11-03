# LaunchScope Open — Product Hunt Pre-Launch Runbook

**Last reviewed:** November 3, 2026 (Asia/Kolkata)  
**Product:** LaunchScope Open  
**Scheduled date:** Thursday, November 12, 2026  
**Product Hunt scheduled start:** 12:01 AM Pacific Standard Time (PST) = **1:31 PM India Standard Time (IST)**.  
**Current status:** Scheduled according to the owner's November 3 Product Hunt screenshot; **NOT live on Product Hunt yet**.

**Public application:** https://launchscope-open.onrender.com/  
**GitHub source:** https://github.com/opandey79-debug/launchscope-open  
**Tester feedback:** https://github.com/opandey79-debug/launchscope-open/issues/1  
**Product Hunt dashboard:** https://www.producthunt.com/my/products

## What is complete

- [x] Public Node.js product hosted at Render free URL.
- [x] GitHub source, MIT license, README, contribution and security docs.
- [x] Product Hunt name, tagline, description, logo and three illustrative gallery visuals.
- [x] Maker and Hunter roles confirmed on owner's Product Hunt account.
- [x] Product Hunt launch date scheduled for November 12.
- [x] Product categories: Developer Tools, Open Source, Productivity.
- [x] Feedback form and visible feedback/share actions within web app.

## Critical launch risk: free hosting cold start

The app uses a Render **free** web service. On November 3, a public homepage check and `/health` both briefly returned **HTTP 503**. A later retry succeeded (homepage and health endpoint). The precise reason was not conclusively established; it is consistent with a free-service warm-up but must not be asserted as proven.

**Before promoting the Product Hunt link:**

- [ ] Open the live app in an incognito/mobile browser and confirm it loads without errors.
- [ ] Verify `https://launchscope-open.onrender.com/health` returns `{"status":"ok"}`.
- [ ] Run the public authorized `example.com` test and confirm all 12 findings appear, report export and share actions work.
- [ ] Measure the first-request experience after inactivity. Record any cold-start errors or delays.
- [ ] Decide whether to accept Render free-tier availability risk or explicitly approve a paid production host. Do **not** upgrade or incur charges without the owner's specific approval.
- [ ] If application issues persist, consider postponing the launch instead of sending users to a broken product.

## November 7–11 — preparation

- [ ] Verify the Product Hunt scheduled page still shows **12 Nov 2026, 12:01 AM PST**.
- [ ] Check the product link, gallery order (Home and Score; 12 Checks; Export and Self-host), logo and tagline.
- [ ] Review the **Founder/Maker Comment** below and preserve the owner's genuine voice.
- [ ] Prepare a social announcement on the owner's personal or developer accounts, not Telecom Bazar corporate channels unless expressly chosen.
- [ ] Avoid encouraging or coordinating votes. Invite testers to try the product and share genuine, constructive feedback.
- [ ] Do not claim a users/revenue count or commission that has not been measured.
- [ ] A full product demo exists as a local MP4 but has **not** been verified as a hosted YouTube/Loom link. The Product Hunt media video field may remain blank.
- [ ] Optionally record which website visits or submissions are being counted in a privacy-respecting analytics plan; site currently says **No tracking**, so do not silently add trackers.

## November 12 — launch day (IST)

| Time (IST) | Action |
| --- | --- |
| 12:45 PM | Check application homepage, health endpoint and one real `example.com` audit. Review Render logs for crashes. |
| 1:15 PM | Open Product Hunt **Pre-Launch Dashboard** and confirm scheduled status, link and product details. |
| 1:31 PM | Product Hunt's scheduled go-live time; confirm a real **Live** public listing before announcing it. |
| 1:35 PM | If Live, post the owner's Founder/Maker Comment as the first substantive comment, or verify the saved one is present. |
| 1:45 PM | Share the **verified live Product Hunt URL** on the owner's personal/developer channels and invite genuine feedback, not votes. |
| 3:30 PM | Check user comments and the app's health. Respond as the maker to real questions. |
| Evening | Review feedback, logs and issues; record confirmed observations, not inferred visitors or signups. |

These are operational check-in times, not additional Product Hunt schedule settings.

## Founder/Maker comment — draft, for the owner to personalize before posting

Hi Product Hunt! 👋

I'm the maker of LaunchScope Open. I wanted a small, straightforward tool to help website owners catch common launch oversights without signing up for yet another service.

LaunchScope checks 12 essentials such as HTTPS, page titles, descriptions, mobile viewport, sitemaps, robots.txt and selected security headers. It gives a score, suggestions, and reports you can export as CSV or JSON.

I kept it open-source under the MIT license, so developers can inspect or self-host it. This is a lightweight checklist, not a complete SEO, accessibility, performance or penetration test.

I'd really value honest feedback. **What's the first check or improvement you'd add?** If anything behaves unexpectedly on your phone, please tell me—those details are especially useful.

Try it: https://launchscope-open.onrender.com/  
Source: https://github.com/opandey79-debug/launchscope-open

Thanks for taking a look!

## Launch-day LinkedIn / personal social draft

🚀 LaunchScope Open is now live on Product Hunt! [Use this sentence only AFTER verifying a live listing.]

It's a free, open-source website launch checker with 12 quick checks, a simple health score and exportable reports. No sign-up needed, MIT licensed, and self-hostable.

Try the app: https://launchscope-open.onrender.com/

Product Hunt: **[Insert verified live Product Hunt listing URL]**

I'd appreciate genuine feedback on the checks and mobile experience. No need to vote—tell me what would make it more useful.

#OpenSource #WebDevelopment #ProductHunt

## After launch — November 13–15

- [ ] Reply to meaningful comments and issues without posting AI-generated comments on behalf of strangers.
- [ ] Gather concrete feedback themes into GitHub issues.
- [ ] Record number of observed comments/issues and product page engagement *only from verified data*.
- [ ] Prioritize fixes and document them in CHANGELOG.
- [ ] Continue watching for Hostinger Open Source Partner approval; no referral link is configured yet.

## Reference

[Official Product Hunt launch guide](https://help.producthunt.com/en/articles/17350772-launch-guide): prepare a real demo, respond to feedback, avoid asking for upvotes, and validate production functionality before launch.
