import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const profileRoutes = new Hono<{ Bindings: Bindings }>();

// Get profile
profileRoutes.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const profile = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).bind(userId).first();

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

// Update profile
profileRoutes.patch('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const updates = await c.req.json();

    const now = Math.floor(Date.now() / 1000);
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.display_name !== undefined) {
      fields.push('display_name = ?');
      values.push(updates.display_name);
    }
    if (updates.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatar_url);
    }
    if (updates.theme !== undefined) {
      fields.push('theme = ?');
      values.push(updates.theme);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(userId);

    await c.env.DB.prepare(
      `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`
    ).bind(...values).run();

    const updatedProfile = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).bind(userId).first();

    return c.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({ error: error.message || 'Failed to update profile' }, 500);
  }
});

// Delete account
profileRoutes.delete('/account', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    // Delete in order (due to foreign keys)
    await c.env.DB.prepare('DELETE FROM tasks WHERE user_id = ?').bind(userId).run();
    await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
    await c.env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').bind(userId).run();
    await c.env.DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(userId).run();
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    return c.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return c.json({ error: error.message || 'Failed to delete account' }, 500);
  }
});
