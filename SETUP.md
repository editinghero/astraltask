# Developer Setup Guide

Complete guide for developers to set up AstralTask locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **bun** package manager
- **Git** for version control
- **Cloudflare account** (free tier works fine)
- **Wrangler CLI** - Install globally:
  ```bash
  npm install -g wrangler
  ```

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/astraltask.git
cd astraltask

# 2. Install dependencies
npm install

# 3. Set up Cloudflare
wrangler login
wrangler d1 create astraltask-db

# 4. Configure environment
cp wrangler.toml.example wrangler.toml
cp .env.example .env
cp .dev.vars.example .dev.vars

# Edit files with your values (see below)

# 5. Run database migration
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql

# 6. Set production secrets
wrangler secret put JWT_SECRET

# 7. Deploy worker
wrangler deploy

# 8. Start development
npm run dev
```

## Detailed Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/astraltask.git
cd astraltask
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer bun:
```bash
bun install
```

### 3. Cloudflare Setup

#### Login to Cloudflare

```bash
wrangler login
```

This opens your browser for authentication.

#### Create D1 Database

```bash
wrangler d1 create astraltask-db
```

**Output:**
```
✅ Successfully created DB 'astraltask-db'

[[d1_databases]]
binding = "DB"
database_name = "astraltask-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Important:** Copy the `database_id` - you'll need it next!

### 4. Configure Environment

#### Create wrangler.toml

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database ID:

```toml
name = "astraltask-api"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "astraltask-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Your ID here
```

#### Create .dev.vars (Local Development)

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set a secure JWT secret:

```env
JWT_SECRET=your-super-secret-random-string-at-least-32-characters-long
```

**Generate a secure secret:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Create .env (Frontend)

```bash
cp .env.example .env
```

You'll update this after deploying the worker. For now, leave it as:

```env
VITE_API_URL="http://localhost:8787"
```

### 5. Database Migration

Run the migration to create all tables:

```bash
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql
```

**Expected output:**
```
🚣 Executed 13 queries in X seconds
```

**Verify tables were created:**

```bash
wrangler d1 execute astraltask-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see:
- users
- profiles
- tasks
- sessions
- password_reset_tokens

### 6. Set Production Secrets

Set the JWT secret for production:

```bash
wrangler secret put JWT_SECRET
```

When prompted, enter your secure random string (same one from `.dev.vars` or a different one for production).

### 7. Deploy Worker

```bash
wrangler deploy
```

**Output:**
```
Deployed astraltask-api triggers (X.XX sec)
  https://astraltask-api.your-subdomain.workers.dev
```

**Copy this URL!** You'll need it for the frontend.

### 8. Update Frontend Configuration

Edit `.env` and set your worker URL:

```env
VITE_API_URL="https://astraltask-api.your-subdomain.workers.dev"
```

### 9. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` and create an account!

## Development Commands

```bash
# Start frontend dev server
npm run dev

# Start worker locally (optional)
wrangler dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run tests
npm run test

# Type check
npm run type-check
```

## Project Structure

```
astraltask/
├── src/
│   ├── worker/              # Cloudflare Worker API
│   │   ├── index.ts         # Main entry point
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts      # Authentication endpoints
│   │   │   ├── tasks.ts     # Task CRUD operations
│   │   │   └── profile.ts   # User profile management
│   │   └── utils/           # Helper functions
│   │       ├── password.ts  # Password hashing
│   │       └── id.ts        # ID generation
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # App-specific components
│   ├── pages/               # Page components
│   │   ├── Auth.tsx         # Login/Signup
│   │   ├── Today.tsx        # Today's tasks
│   │   ├── Calendar.tsx     # Calendar view
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   └── useTasks.ts      # Task management hook
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # API client
│   │   ├── theme.ts         # Theme management
│   │   └── ...
│   └── providers/           # React context providers
│       ├── AuthProvider.tsx # Authentication state
│       └── ThemeProvider.tsx # Theme state
├── cloudflare/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
├── .env.example             # Environment template
├── .dev.vars.example        # Local secrets template
├── wrangler.toml.example    # Worker config template
└── ...
```

## Database Schema

The database includes 5 tables:

### users
- User accounts and authentication
- Stores email and password hash

### profiles
- User profiles and preferences
- Display name, avatar, theme

### tasks
- Tasks with full details
- Supports subtasks via `parent_id`
- Tags, priorities, dates, times

### sessions
- JWT session management
- Tracks active sessions

### password_reset_tokens
- Password reset functionality
- Tokens with expiration

See `cloudflare/schema.sql` for complete schema.

## Troubleshooting

### "database_id is required"

**Solution:**
1. Make sure you created the database: `wrangler d1 create astraltask-db`
2. Copy the `database_id` from the output
3. Paste it in `wrangler.toml`

### "JWT_SECRET is not defined"

**Solution:**

For local development:
```bash
# Make sure .dev.vars exists
cp .dev.vars.example .dev.vars
# Edit and add your secret
```

For production:
```bash
wrangler secret put JWT_SECRET
```

### "Failed to connect to API"

**Solution:**
1. Check `.env` has correct `VITE_API_URL`
2. Verify worker is deployed: `wrangler deployments list`
3. Test API: `curl https://your-worker.workers.dev/`

### "No such table: users"

**Solution:**
```bash
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql
```

### Build Errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

### CORS Errors

**Solution:**
The worker has CORS configured. If you still see errors:
1. Check your worker URL in `.env`
2. Make sure the worker is deployed
3. Check browser console for exact error

## Testing

### Test Database Connection

```bash
# List all tables
wrangler d1 execute astraltask-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Query users table
wrangler d1 execute astraltask-db --remote --command="SELECT * FROM users LIMIT 5"
```

### Test API Endpoints

```bash
# Health check
curl https://your-worker.workers.dev/

# Expected: {"message":"AstralTask API","version":"1.0.0","status":"healthy"}

# Sign up
curl -X POST https://your-worker.workers.dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST https://your-worker.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Frontend

1. Start dev server: `npm run dev`
2. Open `http://localhost:8080`
3. Create an account
4. Create a task
5. Check calendar view
6. Test notifications

## Deployment

### Deploy Worker (Backend)

```bash
wrangler deploy
```

### Deploy Frontend

#### Option 1: Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist
```

#### Option 2: Vercel

```bash
npm run build
vercel deploy
```

#### Option 3: Netlify

```bash
npm run build
netlify deploy --prod
```

## Environment Variables Reference

### .env (Frontend)
```env
VITE_API_URL=https://your-worker.workers.dev
```

### .dev.vars (Local Worker)
```env
JWT_SECRET=your-secure-random-string
```

### Production Secrets (Cloudflare)
```bash
wrangler secret put JWT_SECRET
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## Need Help?

- **Issues**: [GitHub Issues](https://github.com/yourusername/astraltask/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/astraltask/discussions)
- **Documentation**: [README.md](README.md)

## Additional Resources

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Hono Framework](https://hono.dev/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

Happy coding! 🚀
