# Quill (mini Medium)

A multi-writer blog platform: sign up, write in Markdown, publish, and read at clean SEO-friendly URLs.

**Stack:** Next.js (App Router) on **Vercel** · Tailwind CSS · Firebase Auth · Firestore · Cloud Functions (stubbed; not deployed)

## Why Next.js (not Vite)

Organic search is the business model. Post pages need real HTML, `<title>` / meta / Open Graph tags, `sitemap.xml`, and `robots.txt` on first request — not after a client-side fetch. Next.js server-renders those pages from Firestore. Vite + React would ship an empty shell, which is a poor fit here.

## Spark tier — what is (and is not) used

Phase 1 stays inside the **free Spark** plan:

| Service | Phase 1 |
|---|---|
| Authentication | Yes |
| Cloud Firestore | Yes |
| App hosting | **Vercel** (Next.js SSR) |
| Firebase Hosting | Removed — Spark cannot SSR Next.js |
| Cloud Functions | Stub only — **not deployed** |

I will not add Blaze-only products until you say so. That includes deploying Cloud Functions.

Local development uses the **Auth + Firestore emulators** and does not need a live Firebase project. The Firestore emulator needs a JDK 17+ on your PATH (`java -version`). This repo pins `firebase-tools@14` so Java 17 still works; CLI v15+ requires Java 21.

## Local development (emulators)

```bash
cp .env.example .env.local   # already done if you just cloned this repo's defaults
npm install
npm run dev:emu
```

Optional: seed a demo writer and published post (emulators must already be running):

```bash
npm run seed
```

Then sign in as `writer@example.com` / `password123` to open the dashboard, or read the public post at `/post/why-we-write`.

Then open:

- App: [http://localhost:3000](http://localhost:3000)
- Emulator UI: [http://127.0.0.1:4000](http://127.0.0.1:4000)

`NEXT_PUBLIC_USE_EMULATORS=true` points the app at Auth (`9099`) and Firestore (`8080`).

### Smoke test

1. Sign up with email/password (or Google — the Auth emulator accepts it).
2. Complete display name + bio.
3. Write a post, save a draft, then publish.
4. Confirm the homepage, `/post/[slug]`, author page, and tag page show it.
5. View source on a post page: you should see the title in `<h1>`, meta description, and OG tags.

## Point it at a real Firebase project (still Spark)

1. Create a project in the [Firebase console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method**: Email/Password and Google.
3. Create a **Firestore** database (start in production mode; we deploy rules from this repo).
4. Register a **Web app** and copy the config into `.env.local`.
5. Set `NEXT_PUBLIC_USE_EMULATORS=false`.
6. Put your public URL in `NEXT_PUBLIC_SITE_URL` (used for canonical/OG/sitemap).
7. Replace `.firebaserc` `default` with your project ID.
8. Deploy rules + indexes only:

```bash
npm run deploy:rules
```

### Make yourself admin

New accounts always get `role: "writer"` (enforced by security rules). In Firestore, open `users/{yourUid}` and set `role` to `"admin"`. After a refresh you will see **Moderation**, which can edit or delete any post.

## Data model

- `users/{uid}`: `uid`, `displayName`, `email`, `bio`, `role` (`writer` \| `admin`), `createdAt`
- `posts/{postId}`: `authorId`, `authorName`, `title`, `slug`, `canonicalPath` (`/post/{slug}`), `content` (Markdown), `tags`, `status` (`draft` \| `published`), `createdAt`, `publishedAt`, `viewCount`
- `payouts/{id}`: `authorId`, `authorName`, `month` (`YYYY-MM`), `totalAdRevenue`, `writerShare`, `status` (`pending` \| `paid`), `paidAt`
- `config/revenueShare`: `writerPercent` (0–100), editable by admin

## AdSense (client, Spark-safe)

Keep `NEXT_PUBLIC_ADSENSE_ENABLED=false` while developing. No script and no ad slots render.

When you are approved for AdSense:

1. Create two **Display** ad units in AdSense (in-article and end-of-post).
2. Set in `.env.local`:

```
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_END=0987654321
NEXT_PUBLIC_ADSENSE_TEST=false
```

3. Restart the app. Post pages load the AdSense script and at most two units: after the first paragraph (if there is more content) and at the end.
4. `/ads.txt` is served from the publisher ID when `NEXT_PUBLIC_ADSENSE_CLIENT` is set.

### URL attribution (how a PAGE_URL becomes an author)

Every published post lives at **`/post/{slug}`**, which is also stored as `canonicalPath` on the post document. Slugs are unique among published posts.

AdSense Management API reports use a `PAGE_URL` dimension such as `https://yoursite.com/post/why-we-write`. Join path:

1. Normalize the reported URL → path `/post/why-we-write` (strip origin, query, hash, trailing slash).
2. Look up `posts` where `canonicalPath == that path` (or `slug == why-we-write`) and `status == published`.
3. Read `authorId` from that post.

Set `NEXT_PUBLIC_SITE_URL` to the exact public origin AdSense will report (including `https://`), so canonical URLs match the report.

## Admin and writer payout UI (built)

- Writers: `/dashboard/earnings` — pending total + history for their `authorId` only.
- Admins: `/dashboard/payouts` — all records, mark paid, CSV export, writer-share %.
- Payouts stay **manual** (UPI/bank). No Razorpay/Stripe Connect.

These tables stay empty until monthly AdSense numbers are imported.

## AdSense Management API (Blaze — not enabled)

A scheduled Cloud Function that pulls last month’s earnings **is not scaffolded**. Deploying it requires the **Blaze** plan. Confirm that upgrade before I write the function.

What you will need before any API code:

1. **AdSense account** approved, site added, ads.txt live on the production origin.
2. **Google Cloud project** (the same one as Firebase is simplest).
3. Enable **AdSense Management API** in [Google Cloud Console → APIs](https://console.cloud.google.com/apis/library/adsense.googleapis.com).
4. OAuth consent screen (External is fine for a single admin user).
5. OAuth **Desktop** or **Web** client ID + secret (the monthly job acts as you, the AdSense owner — a service account **cannot** access AdSense).
6. One-time local consent to get a **refresh token** with scope `https://www.googleapis.com/auth/adsense.readonly`.
7. Store the refresh token, client ID, and client secret in **Secret Manager** or Firebase functions config — never in git.
8. In AdSense, note your account ID (`pub-…` / `accounts/pub-…`). Reports use dimension `PAGE_URL` and metric `ESTIMATED_EARNINGS` for the previous calendar month.
9. Upgrade the Firebase project to **Blaze**, then we can add `functions/src/importAdSensePayouts.ts` on a monthly schedule (1st, ~06:00).

The job, once you approve it, will: fetch URL earnings → join via `canonicalPath`/`slug` → sum by `authorId` → apply `config/revenueShare.writerPercent` → write `payouts` with `status: "pending"`.

## SEO


- Server-rendered homepage, post, author, and tag pages
- `generateMetadata` + canonical URL + Open Graph + Twitter tags
- Article JSON-LD on post pages
- Semantic `<article>` / `<h1>` / `<time>`
- Dynamic `/sitemap.xml` and `/robots.txt`
- Dashboard/auth routes are `noindex`

## Deploy on Vercel (hosting only)

The Next.js app is hosted on Vercel. Firebase is still Auth + Firestore only. There is no `vercel.json` — Vercel auto-detects Next.js App Router (`next build`, no static export).

Do not run `firebase deploy` with functions included until you approve Blaze. Deploy Firestore rules with `npm run deploy:rules`.

### Environment variables for Vercel

Copy these into **Vercel → Project → Settings → Environment Variables** (Production, Preview, and Development). Leave `NEXT_PUBLIC_USE_EMULATORS` **unset**.

| Variable | Where to copy it (Firebase console) |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project settings → Your apps → Web app → `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same panel → `authDomain` (usually `your-project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same panel → `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same panel → `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same panel → `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same panel → `appId` |
| `NEXT_PUBLIC_SITE_NAME` | Your choice (e.g. `Quill`) |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Your choice |
| `NEXT_PUBLIC_SITE_URL` | Your live origin, **no trailing slash** (e.g. `https://your-app.vercel.app`) |

No Firebase Admin / service-account JSON is required. The app talks to Firestore with the **client SDK** on both the server (SSR) and the browser. Admin role is a Firestore field (`users/{uid}.role`), not a custom Auth claim.

### Manual steps

1. Push this repo to GitHub (there is no remote yet).
2. Create a [Vercel](https://vercel.com/signup) account and **Add New Project** → import that GitHub repo.
3. Framework preset: **Next.js**. Build command `next build`, output left default. Do not set “Output Directory” to `out` or `public`.
4. Paste the env vars above. Redeploy after saving them.
5. After the first deploy, copy the `*.vercel.app` URL into `NEXT_PUBLIC_SITE_URL` and redeploy.
6. Firebase console → **Authentication → Settings → Authorized domains** → add `your-app.vercel.app` (and any custom domain). Google sign-in fails without this.
7. If you use Google sign-in, also add `https://your-app.vercel.app` as an authorized JavaScript origin on the OAuth client in Google Cloud Console.

### Verify after deploy

1. Homepage loads at the Vercel URL.
2. Open a published post → **View Page Source** (not DevTools Elements). You should see `<title>…</title>`, `<meta property="og:title" …>`, and the story `<h1>` in the HTML.
3. Sign up / log in, write a draft, publish, then confirm `/post/{slug}` and the homepage show it.
