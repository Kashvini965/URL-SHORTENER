# snip.

A small URL shortener with click analytics — shorten links, track who opened them, pause or expire links when you need to.

MERN stack: React frontend, Express API, MongoDB.

## What it does

- Shorten URLs (auto-generated 7-char codes or custom aliases)
- Redirect at `yourdomain.com/:code` with visit logging (device, browser, OS)
- Dashboard with search, edit, delete, and CSV bulk import
- Per-link analytics: 7-day chart, recent visits, QR download
- Public stats page at `/s/:code` (no destination URL exposed)

## Quick start

**Prerequisites:** Node 18+, MongoDB

```bash
# Backend
cd backend
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install
npm run dev            # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm start              # http://localhost:3000
```

### Environment

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/url_shortener
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

`BASE_URL` is what short links and QR codes point to — set it to your deployed backend in production.

## Notes

- Short codes use `nanoid` (7 chars) unless you pick a custom alias (3–20 chars, `a-z0-9_-`).
- Redirects live at the backend root (`GET /:shortCode`), so deploy the API on the domain you want in links.
- Recent visits capped at 50 per link; daily chart covers the last 7 days.
- Device/browser detection is best-effort via `user-agent` parsing.
- Bulk CSV: one URL per line, max 100, header row with "url" auto-skipped.
- Deleting a link removes its visit history too.

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/signup`, `/login` | — |
| GET | `/api/auth/me` | JWT |
| POST/GET/DELETE | `/api/urls` | JWT |
| PUT | `/api/urls/:id` | JWT |
| POST | `/api/urls/bulk` | JWT |
| GET | `/api/urls/:id` | JWT (analytics) |
| GET | `/api/public/:shortCode` | — |
| GET | `/:shortCode` | — (redirect) |
