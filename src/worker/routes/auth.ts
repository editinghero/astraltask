import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateId } from '../utils/id';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// Sign up
authRoutes.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = generateId();
    const now = Math.floor(Date.now() / 1000);

    // Create user
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, passwordHash, now, now).run();

    // Create profile
    const profileId = generateId();
    const displayName = name || email.split('@')[0];
    
    await c.env.DB.prepare(
      'INSERT INTO profiles (id, user_id, display_name, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(profileId, userId, displayName, 'lavender-light', now, now).run();

    // Generate JWT
    const token = await sign(
      { 
        sub: userId, 
        email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      c.env.JWT_SECRET,
      'HS256'
    );

    // Create session
    const sessionId = generateId();
    const expiresAt = now + (60 * 60 * 24 * 7); // 7 days
    
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, userId, expiresAt, now).run();

    return c.json({
      user: {
        id: userId,
        email,
        display_name: displayName,
      },
      token,
      session: {
        id: sessionId,
        expires_at: expiresAt,
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Failed to create account' }, 500);
  }
});

// Sign in
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Get profile
    const profile = await c.env.DB.prepare(
      'SELECT display_name, avatar_url, theme FROM profiles WHERE user_id = ?'
    ).bind(user.id).first();

    // Generate JWT
    const token = await sign(
      { 
        sub: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      c.env.JWT_SECRET,
      'HS256'
    );

    // Create session
    const sessionId = generateId();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (60 * 60 * 24 * 7); // 7 days
    
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt, now).run();

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        theme: profile?.theme,
      },
      token,
      session: {
        id: sessionId,
        expires_at: expiresAt,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: error.message || 'Failed to login' }, 500);
  }
});

// Request password reset
authRoutes.post('/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if user exists
    const user = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    // Always return success (don't reveal if email exists)
    if (!user) {
      return c.json({ message: 'If the email exists, a reset link will be sent' });
    }

    // Generate reset token
    const token = generateId() + generateId(); // Long random token
    const tokenId = generateId();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (60 * 60); // 1 hour

    // Store token
    await c.env.DB.prepare(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(tokenId, user.id, token, expiresAt, now).run();

    // TODO: Send email with reset link
    // For now, return the token (in production, send via email)
    return c.json({ 
      message: 'If the email exists, a reset link will be sent',
      // Remove this in production:
      debug_token: token,
      debug_reset_url: `${c.req.header('origin')}/reset-password?token=${token}`
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return c.json({ error: error.message || 'Failed to process request' }, 500);
  }
});

// Update password with token
authRoutes.post('/update-password', async (c) => {
  try {
    const { token, password } = await c.req.json();

    if (!token || !password) {
      return c.json({ error: 'Token and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);

    // Get valid token
    const resetToken = await c.env.DB.prepare(
      'SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > ?'
    ).bind(token, now).first();

    if (!resetToken) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(passwordHash, now, resetToken.user_id).run();

    // Delete used token
    await c.env.DB.prepare(
      'DELETE FROM password_reset_tokens WHERE token = ?'
    ).bind(token).run();

    return c.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Update password error:', error);
    return c.json({ error: error.message || 'Failed to update password' }, 500);
  }
});
