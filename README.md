# Abuja Life

**The Capital Has Levels.** Abuja Life is an Abuja/FCT-first life simulation built as a browser game. Players create a character, explore a stylized Abuja, travel between districts, meet residents, work, earn Game Naira, manage money, rent a home and own a vehicle.

Abuja Life is an original fictional game. Real places and institutions may be simplified or adapted. Political roles and election systems are fictional game mechanics. **Game Naira has no real-world cash value.**

## Current playable systems

- Registration and login, with persistent character appearance and background.
- A Three.js-based 3D home/street world with a day/night lighting and population cycle.
- District map and transport choices including walking, shared commercial car, Keke, Metro, Bolt, inDrive and personal car.
- Persistent in-game clock. Actions and travel advance game time; sleeping at home can move the clock to morning.
- Jobs board with skill and vehicle requirements, workplace locations, scheduled shifts, career performance and saved job history.
- Wallet/bank/savings/debt actions and a transaction ledger.
- Rental listings, occupied-property checks and unused prepaid-rent credit when moving.
- Vehicle purchase, fuel, maintenance and vehicle-based job eligibility.
- Activities, NPC greetings, saved in-game contacts and basic social progression.

Some systems remain in progress. In particular, commission-based jobs are listed but their payout mechanics are not yet available. The build should not be treated as evidence that every system in the master specification is complete.

## Tech stack

- Next.js App Router, React and TypeScript
- Three.js with React Three Fiber and Drei
- Prisma 7 with PostgreSQL
- NextAuth credentials authentication
- Tailwind CSS

## Local development

Requirements: Node.js 22+ and a PostgreSQL database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set a PostgreSQL connection string in `DATABASE_URL`. Set `NEXTAUTH_SECRET` to a long random value and `NEXTAUTH_URL` to your local URL, normally `http://localhost:3000`.

3. Generate the Prisma client and create/update the local database schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   Use a disposable/local database for `db push`; review schema changes and use a deliberate migration process for production data.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string; required |
| `NEXTAUTH_SECRET` | Secret used to sign/authenticate sessions; required |
| `NEXTAUTH_URL` | Canonical application URL; set to `http://localhost:3000` locally |
| `PAYSTACK_SECRET_KEY` | Optional server-side secret for payment functionality as it is implemented |

Do not commit real secrets or production database credentials.

## Verification

The repository's GitHub Actions workflow installs dependencies, generates the Prisma client and runs `npm run build` on pushes to `develop` and `main`, and on pull requests targeting those branches.

## Product direction

See [docs/MASTER-SPECIFICATION.md](docs/MASTER-SPECIFICATION.md) for the evolving design and product requirements. The goal is a persistent, Abuja-specific life simulation—not merely a dashboard—with server-authoritative money, ownership and career progress.
