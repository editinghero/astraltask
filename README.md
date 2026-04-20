# AstralTask - Tasks & Study Planner

A beautiful task and study planner with glass morphism design and Material You theming.

## Features

- ✅ Task management with subtasks
- 📅 Calendar view and date picker
- 🔔 Browser notifications and reminders
- 🎨 Multiple themes (Lavender, Rose, Ocean, Forest, Sunset, Midnight)
- 🔐 Secure JWT authentication
- ☁️ Cloud sync with Cloudflare D1
- 📱 PWA support for mobile
- 🌙 Dark/Light mode variants

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Cloudflare Workers (Hono framework)
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT with secure password hashing
- **State**: TanStack Query (React Query)

## Prerequisites

- Node.js 18 or higher
- npm or bun
- Cloudflare account (free tier works)
- Wrangler CLI (`npm install -g wrangler`)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd astraltask
npm install
```

### 2. Set Up Cloudflare D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create astraltask-db

# Copy the database_id from output
# Create wrangler.toml from example
cp wrangler.toml.example wrangler.toml

# Edit wrangler.toml and paste your database_id
```

### 3. Run Database Migration

```bash
wrangler d1 execute astraltask-db --remote --file=./cloudflare/schema.sql
```

### 4. Set Up Environment Variables

```bash
# Copy example files
cp .env.example .env
cp .dev.vars.example .dev.vars

# Edit .dev.vars and set a secure JWT_SECRET
# Edit .env and set your worker URL (after deployment)
```

### 5. Deploy Cloudflare Worker

```bash
# Set JWT secret for production
wrangler secret put JWT_SECRET
# Enter a secure random string

# Deploy worker
wrangler deploy

# Copy the worker URL from output
# Update .env with: VITE_API_URL="https://your-worker.workers.dev"
```

### 6. Start Development

```bash
npm run dev
```

Visit `http://localhost:8080`

## Development

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
```

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

#### Option 2: Other Platforms

Build the project and deploy the `dist` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

## Database Schema

The database includes:
- **users** - User accounts and authentication
- **profiles** - User profiles and preferences
- **tasks** - Tasks with subtasks support
- **sessions** - JWT session management
- **password_reset_tokens** - Password reset functionality

See `cloudflare/schema.sql` for full schema.

## API Endpoints

### Public Routes
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Sign in
- `POST /auth/reset-password` - Request password reset
- `POST /auth/update-password` - Update password with token

### Protected Routes (Require JWT)
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/range?start=&end=` - Get tasks by date range
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `DELETE /api/profile/account` - Delete account

## Project Structure

```
astraltask/
├── src/
│   ├── worker/              # Cloudflare Worker API
│   │   ├── index.ts         # Main worker entry
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts      # Authentication
│   │   │   ├── tasks.ts     # Task management
│   │   │   └── profile.ts   # User profile
│   │   └── utils/           # Utilities
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # App components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   │   └── api.ts           # API client
│   └── providers/           # React context providers
├── cloudflare/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
└── ...
```

## Features in Detail

### Task Management
- Create, edit, delete tasks
- Subtasks support
- Priority levels (low, medium, high)
- Custom colors
- Tags
- Notes
- Date ranges
- Time scheduling
- Pin important tasks

### Calendar
- Week view
- Month view
- Date picker
- Drag and drop (coming soon)

### Notifications
- Browser notifications
- Custom reminder times
- PWA background notifications (Android)

### Themes
- 6 beautiful themes
- Light and dark variants
- Material You inspired
- Glass morphism design

### Authentication
- Secure JWT tokens
- Password hashing
- Password reset via email (requires email service integration)
- Session management

## Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=https://your-worker.workers.dev
```

**Worker (.dev.vars for local, secrets for production)**
```env
JWT_SECRET=your-secure-secret-key
```

### Wrangler Configuration

See `wrangler.toml.example` for configuration template.

## Security

- Passwords hashed with SHA-256 (consider upgrading to bcrypt/argon2)
- JWT tokens with expiration
- CORS configured
- SQL injection protection via prepared statements
- Row-level security in database queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

## Roadmap

- [ ] Email service integration for password reset
- [ ] Drag and drop task reordering
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Task sharing/collaboration
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Tauri)
- [ ] Export/import tasks
- [ ] Calendar integrations

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Cloudflare](https://cloudflare.com/)

---

Made with ❤️ by the AstralTask team
