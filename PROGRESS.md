# Progress Checkpoint

## What's done

### Infrastructure
- Ubuntu 24.04 server at **172.0.0.123** — Docker 29.4, Compose v5.1, Portainer CE running on port 9443
- UFW open on 22, 80, 443, 9443
- Portainer: https://172.0.0.123:9443 (set admin password on first visit)
- SSH key saved at `~/.ssh/claude-session-key` (armandt user, passwordless sudo configured)

### Codebase (this repo)
All source files written. Monorepo with npm workspaces:
- `packages/shared` — TypeScript types + scoring engine (calcPriceScore, calcListing, rankListings)
- `packages/backend` — Fastify API + Drizzle ORM + PostgreSQL
- `packages/frontend` — React + Vite web app
- `packages/extension` — Chrome MV3 extension (content script, popup, options, background SW)
- `docker-compose.yml` — app + db (postgres:16) + caddy services
- `Caddyfile` — placeholder, needs real domain substituted
- `packages/backend/Dockerfile` — multi-stage build, backend serves frontend static files

## What's NOT done yet

### Immediate next steps (in order)

1. **Add `"type": "module"` to `packages/backend/package.json`** — needed for NodeNext ESM imports
2. **Generate Drizzle migrations locally:**
   ```bash
   cd C:/Users/Armandt/marketplace-evaluator
   npm install
   # Start a local postgres or set DATABASE_URL to the server temporarily
   npm run db:generate --workspace=packages/backend
   # This creates packages/backend/drizzle/*.sql migration files
   # Commit and push them
   ```
3. **Create `.env` on server:**
   ```bash
   ssh -i ~/.ssh/claude-session-key armandt@172.0.0.123
   cd ~/marketplace-evaluator  # after git clone (see step 5)
   cp .env.example .env
   # Edit .env — set strong DB_PASSWORD and ADMIN_KEY
   nano .env
   ```
4. **Update `Caddyfile`** — replace `YOURDOMAIN` with actual subdomain once DNS is ready
5. **Clone repo on server and deploy:**
   ```bash
   ssh -i ~/.ssh/claude-session-key armandt@172.0.0.123
   git clone https://github.com/AJ-dev-i60/Marketplace-Evaluator.git ~/marketplace-evaluator
   cd ~/marketplace-evaluator
   cp .env.example .env && nano .env
   sudo docker compose up -d --build
   ```
6. **Run DB migrations:**
   ```bash
   sudo docker compose exec app node packages/backend/dist/db/migrate.js
   ```
7. **Create first user (your API key):**
   ```bash
   curl -X POST https://YOURDOMAIN/api/admin/users \
     -H "Content-Type: application/json" \
     -H "X-Admin-Key: YOUR_ADMIN_KEY" \
     -d '{"name": "Armandt"}'
   # Response contains your apiKey — save it
   ```
8. **Wire Cloudflare DNS** — create A record for subdomain pointing to 172.0.0.123, set SSL to Full (strict)
   - Cloudflare Zone ID: 751adde5f1041fb0957fd402f78bab9f
   - API token available (stored in session)

### Extension
9. **Build the extension:**
   ```bash
   cd C:/Users/Armandt/marketplace-evaluator
   npm install
   npm run build --workspace=packages/extension
   # Output in packages/extension/dist/
   ```
10. **Add placeholder icons** — 3 PNG files needed in `packages/extension/icons/`:
    - `icon16.png`, `icon48.png`, `icon128.png`
    - Any simple icon works for now; can be replaced later before Chrome Web Store submission
11. **Load in Chrome** — chrome://extensions → Developer mode → Load unpacked → point to `packages/extension/dist/`
12. **Publish to Chrome Web Store (Unlisted)** when ready to share with friends ($5 one-time dev fee)

## Credentials summary (for Claude to resume)
- Server: 172.0.0.123, user: armandt, key: ~/.ssh/claude-session-key
- GitHub: https://github.com/AJ-dev-i60/Marketplace-Evaluator.git
- Cloudflare Zone ID: 751adde5f1041fb0957fd402f78bab9f
- GitHub PAT and Cloudflare API token available in session context

## Architecture reminder
- Backend (Fastify) serves the React frontend as static files — one container, not two
- Auth: `X-API-Key` header on all `/api/*` requests; admin routes use `X-Admin-Key`
- Scoring logic lives in `packages/shared` — used by both backend and frontend
- Extension communicates with backend directly; no server-side extension logic needed
