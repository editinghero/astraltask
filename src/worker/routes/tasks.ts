import { Hono } from 'hono';
import { generateId } from '../utils/id';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const taskRoutes = new Hono<{ Bindings: Bindings }>();

// Get all tasks for user
taskRoutes.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY scheduled_date, position'
    ).bind(userId).all();

    return c.json({ tasks: results });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return c.json({ error: error.message || 'Failed to fetch tasks' }, 500);
  }
});

// Get tasks by date range
taskRoutes.get('/range', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const startDate = c.req.query('start');
    const endDate = c.req.query('end');

    if (!startDate || !endDate) {
      return c.json({ error: 'Start and end dates are required' }, 400);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE user_id = ? AND scheduled_date >= ? AND scheduled_date <= ? ORDER BY scheduled_date, position'
    ).bind(userId, startDate, endDate).all();

    return c.json({ tasks: results });
  } catch (error: any) {
    console.error('Get tasks by range error:', error);
    return c.json({ error: error.message || 'Failed to fetch tasks' }, 500);
  }
});

// Create task
taskRoutes.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const task = await c.req.json();

    const taskId = generateId();
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(`
      INSERT INTO tasks (
        id, user_id, parent_id, title, notes, scheduled_date, 
        start_time, end_time, end_date, completed, priority, 
        color, notify_at, notify_enabled, position, tags, pinned,
        recurring_type, recurring_interval, recurring_end_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      taskId,
      userId,
      task.parent_id || null,
      task.title,
      task.notes || null,
      task.scheduled_date,
      task.start_time || null,
      task.end_time || null,
      task.end_date || null,
      task.completed ? 1 : 0,
      task.priority || 'medium',
      task.color || null,
      task.notify_at || null,
      task.notify_enabled ? 1 : 0,
      task.position || 0,
      JSON.stringify(task.tags || []),
      task.pinned ? 1 : 0,
      task.recurring_type || null,
      task.recurring_interval || null,
      task.recurring_end_date || null,
      now,
      now
    ).run();

    const newTask = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).bind(taskId).first();

    return c.json({ task: newTask }, 201);
  } catch (error: any) {
    console.error('Create task error:', error);
    return c.json({ error: error.message || 'Failed to create task' }, 500);
  }
});

// Update task
taskRoutes.patch('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const taskId = c.req.param('id');
    const updates = await c.req.json();

    // Verify task belongs to user
    const task = await c.env.DB.prepare(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(taskId, userId).first();

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const fields: string[] = [];
    const values: any[] = [];

    // Build dynamic update query
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.scheduled_date !== undefined) {
      fields.push('scheduled_date = ?');
      values.push(updates.scheduled_date);
    }
    if (updates.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(updates.start_time);
    }
    if (updates.end_time !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.end_time);
    }
    if (updates.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updates.end_date);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.notify_at !== undefined) {
      fields.push('notify_at = ?');
      values.push(updates.notify_at);
    }
    if (updates.notify_enabled !== undefined) {
      fields.push('notify_enabled = ?');
      values.push(updates.notify_enabled ? 1 : 0);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.pinned !== undefined) {
      fields.push('pinned = ?');
      values.push(updates.pinned ? 1 : 0);
    }
    if (updates.recurring_type !== undefined) {
      fields.push('recurring_type = ?');
      values.push(updates.recurring_type);
    }
    if (updates.recurring_interval !== undefined) {
      fields.push('recurring_interval = ?');
      values.push(updates.recurring_interval);
    }
    if (updates.recurring_end_date !== undefined) {
      fields.push('recurring_end_date = ?');
      values.push(updates.recurring_end_date);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(taskId);

    await c.env.DB.prepare(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    const updatedTask = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).bind(taskId).first();

    return c.json({ task: updatedTask });
  } catch (error: any) {
    console.error('Update task error:', error);
    return c.json({ error: error.message || 'Failed to update task' }, 500);
  }
});

// Delete task
taskRoutes.delete('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const taskId = c.req.param('id');

    // Verify task belongs to user
    const task = await c.env.DB.prepare(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(taskId, userId).first();

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    await c.env.DB.prepare(
      'DELETE FROM tasks WHERE id = ?'
    ).bind(taskId).run();

    return c.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return c.json({ error: error.message || 'Failed to delete task' }, 500);
  }
});
