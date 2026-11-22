# Fuusio 80

Website for Fuusio 80, the 80th annual ball of the Guild of Physics (13.3.2027), and for the
jubilee year around it. Built on a stripped-down copy of
[fk-web](https://github.com/fyysikkokilta/fk-web): Next.js, Payload CMS, Base UI, Tailwind CSS,
PostgreSQL, next-intl (fi/en).

## What is in it

- **Pages** (Payload collection): free content with a localized path, optional table of contents.
  The page with the path `home` is the front page, shown at `/fi` and `/en`.
- **Content blocks**: Events (list, tabs or calendar), Section Cards (3D link cards), Team, Card,
  Collapsible, Two Columns, PDF Viewer.
- **Sponsors**: the Partner Section global is shown at the bottom of every page.
- **Media** and **Documents** (PDF) uploads, stored on disk in `public/media` and
  `public/documents`.

### Events come from Ilmomasiina

Events are not stored in this site. The Events block reads them from the public API of
Ilmomasiina (`ILMO_URL`, default `https://ilmo.fyysikkokilta.fi`) and filters them by the
**Category** field of the Ilmomasiina event. To get an event onto a page, give it the right
category in Ilmomasiina.

The seeded pages expect these categories:

| Page         | Ilmomasiina category   |
| ------------ | ---------------------- |
| Juhlavuosi   | `Juhlavuositapahtumat` |
| Fuusioviikko | `Fuusioviikko`         |
| Fuusio       | `Fuusio 80`            |

The categories are plain text in the block settings and can be changed in the admin panel.
Titles, descriptions, locations and prices use the English translation from Ilmomasiina on the
English site when one exists. Ilmomasiina only lists past events for a limited time, so old
events eventually disappear from the "past events" lists.

## Development

Requires Node 26, pnpm 12 and PostgreSQL.

```bash
cp .env.example .env   # fill in DATABASE_URI and PAYLOAD_SECRET
pnpm install
pnpm migrate           # create the tables
pnpm seed              # optional: starter pages, navigation and footer (empty database only)
pnpm dev
```

The admin panel is at `/admin`. Login is Google OAuth only, like in fk-web: set
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and allow the redirect URI
`<NEXT_PUBLIC_SERVER_URL>/api/users/oauth/google/callback` in Google Cloud. To create the first
user, set `ALLOW_NON_EXISTING_USERS=true`, log in once, and set it back to `false`. After that,
add more users by email in the admin panel.

After changing collections, globals or blocks run `pnpm generate:payload` and commit the result.

```bash
pnpm test        # unit tests for the event helpers
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```

## Deployment

`Dockerfile` builds a standalone image and `docker-compose.yml` runs it. Uploaded files live in
the `public/media` and `public/documents` volumes, so back those up together with the database.
