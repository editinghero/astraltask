# Setup Guide

Complete guide to set up AstralTask from scratch.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up Cloudflare
wrangler login
wrangler d1 create astraltask-db

# 3. Configure
cp wrangler.toml.example wrangler.toml
cp .env.example .env
cp .dev.vars.example .dev.vars

# Edit wrangler.toml with your database_id
# Edit .dev.vars with a secure JWT_SECRET

# 4. Migrate database
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql

# 5. Deploy worker
wrangler secret put JWT_SECRET
wrangler deploy

# 6. Update .env with your worker URL
# VITE_API_URL="https://your-worker.workers.dev"

# 7. Start development
npm run dev
```

## Detailed Steps

### 1. Prerequisites

Install required tools:

```bash
# Node.js 18+ (check version)
node --version

# Install Wrangler CLI globally
npm install -g wrangler

# Verify installation
wrangler --version
```

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd astraltask
npm install
```

### 3. Cloudflare Account Setup

1. Create a free account at [cloudflare.com](https://cloudflare.com)
2. Login via Wrangler:

```bash
wrangler login
```

This opens a browser window for authentication.

### 4. Create D1 Database

```bash
wrangler d1 create astraltask-db
```

You'll see output like:
```
✅ Successfully created DB 'astraltask-db'

[[d1_databases]]
binding = "DB"
database_name = "astraltask-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

**Copy the `database_id`** - you'll need it next.

### 5. Configure Wrangler

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database_id:

```toml
[[d1_databases]]
binding = "DB"
database_name = "astraltask-db"
database_id = "xxxx-xxxx-xxxx-xxxx"  # Your actual ID here
```

### 6. Run Database Migration

```bash
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql
```

This creates all necessary tables. You should see:
```
🚣 Executed 13 queries in X seconds
```

### 7. Set Up Environment Variables

#### For Local Development

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set a secure JWT secret:

```env
JWT_SECRET=your-super-secret-random-string-here-make-it-long-and-random
```

**Important**: Use a strong random string! You can generate one with:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### For Production

Set the JWT secret as a Cloudflare secret:

```bash
wrangler secret put JWT_SECRET
```

When prompted, enter your secure random string.

### 8. Deploy Worker

```bash
wrangler deploy
```

You'll see output like:
```
Deployed astraltask-api triggers (X.XX sec)
  https://astraltask-api.your-subdomain.workers.dev
```

**Copy this URL** - this is your API endpoint.

### 9. Configure Frontend

```bash
cp .env.example .env
```

Edit `.env` and set your worker URL:

```env
VITE_API_URL="https://astraltask-api.your-subdomain.workers.dev"
```

### 10. Start Development

```bash
npm run dev
```

Visit `http://localhost:8080` and create an account!

## Troubleshooting

### "database_id is required"

Make sure you:
1. Created the database with `wrangler d1 create astraltask-db`
2. Copied the database_id to `wrangler.toml`
3. The ID is in quotes: `database_id = "xxxx-xxxx-xxxx-xxxx"`

### "JWT_SECRET is not defined"

For local development:
1. Create `.dev.vars` file
2. Add `JWT_SECRET=your-secret-here`

For production:
1. Run `wrangler secret put JWT_SECRET`
2. Enter your secret when prompted

### "Failed to connect to API"

1. Check `.env` has correct `VITE_API_URL`
2. Verify worker is deployed: `wrangler deployments list`
3. Test API directly: `curl https://your-worker.workers.dev/`

### "No such table: users"

Run the migration:
```bash
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

## Verify Setup

### Test Database

```bash
# List tables
wrangler d1 execute astraltask-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Should show: users, profiles, tasks, sessions, password_reset_tokens
```

### Test API

```bash
# Health check
curl https://your-worker.workers.dev/

# Should return: {"message":"AstralTask API","version":"1.0.0","status":"healthy"}
```

### Test Frontend

1. Start dev server: `npm run dev`
2. Open `http://localhost:8080`
3. Click "Sign up"
4. Create an account
5. Create a task

If all works, you're ready! 🎉

## Production Deployment

### Deploy Frontend to Cloudflare Pages

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist

# Or create a Pages project in Cloudflare dashboard
# and connect your GitHub repo for automatic deployments
```

### Deploy to Other Platforms

Build and deploy `dist` folder to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Push `dist` to `gh-pages` branch

## Next Steps

- Set up custom domain
- Configure email service for password reset
- Set up monitoring and analytics
- Enable HTTPS (automatic on Cloudflare)
- Set up CI/CD pipeline

## Need Help?

- Check [README.md](README.md) for features and API docs
- Open an issue on GitHub
- Check Cloudflare docs: [developers.cloudflare.com](https://developers.cloudflare.com)
