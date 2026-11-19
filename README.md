# BraveTalk Bangladesh

**Be a Speaker, Be a Leader!** — the website and learning platform of BraveTalk Bangladesh: spoken English, public speaking and leadership courses, books with video lessons, batches and QR-verified certificates.

## Repository layout

| Folder | What it is | Stack |
|---|---|---|
| `aptech_client/` | Website + student / mentor / admin dashboards | Next.js 16, React 19, Tailwind CSS 4 |
| `aptech_server/` | REST API (`/api/...`) | Node.js, Express, TypeScript, MongoDB (Mongoose) |

## Main features
- Courses (online, in-person, recorded) — free or paid with a single full payment
- Automatic batch placement for live courses, self-paced batches for recorded courses
- Bookstore: printed / digital books with YouTube video lessons, orders and stock
- Manual payment verification by admin, money receipts
- One-click certificates with QR code and public verification page
- Notifications for orders, new lessons, notices and recordings
- Bilingual UI (English / বাংলা)

## Run locally

```bash
# API
cd aptech_server
cp .env.example .env      # fill in DATABASE_URL, JWT secrets …
npm install
npm run start:dev         # http://localhost:5001 (PORT in .env)

# Website
cd aptech_client
echo NEXT_PUBLIC_API_URL=http://localhost:5001 > .env.local
npm install
npm run dev               # http://localhost:3000
```

Useful scripts (in `aptech_server`): `npm run seed:admin`, `npm run seed:settings`, `node src/scripts/seedDemoCourses.js`, `node src/scripts/seedDemoBooks.js`.

## Deployment (Coolify)
Both apps ship with a `Dockerfile`.

- **API** — build context `aptech_server`, port `5000`, persistent volume at `/app/uploads`. Env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `FRONTEND_URL`, optional SMTP / Cloudinary keys.
- **Website** — build context `aptech_client`, port `5005`. Build-time env: `NEXT_PUBLIC_API_URL` (the API's public URL), `NEXT_PUBLIC_SITE_URL`.

Never commit `.env` files — they are ignored by `.gitignore`.
