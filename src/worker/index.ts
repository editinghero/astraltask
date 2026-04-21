import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';
import { profileRoutes } from './routes/profile';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'AstralTask API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Public routes (no auth required)
app.route('/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/*', async (c, next) => {
  const jwtMiddleware = jwt({ 
    secret: c.env.JWT_SECRET,
    alg: 'HS256'
  });
  return jwtMiddleware(c, next);
});

app.route('/api/tasks', taskRoutes);
app.route('/api/profile', profileRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
