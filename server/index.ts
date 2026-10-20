import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDatabase, seedDatabase } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CHILD_USER_ID = 2;
const PARENT_USER_ID = 1;

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY subject_id, category');
    const tasks = result.rows.map(t => ({
      ...t,
      subject_id: parseInt(t.subject_id),
      weekdays: t.weekdays || null,
    }));
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { subject_id, category, title, description, weekdays } = req.body;
    const id = `t${Date.now()}`;
    const result = await pool.query(
      'INSERT INTO tasks (id, subject_id, category, title, description, weekdays) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, subject_id, category, title, description, weekdays || null]
    );
    res.json({ ...result.rows[0], subject_id: parseInt(result.rows[0].subject_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { subject_id, category, title, description, weekdays } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET subject_id=$1, category=$2, title=$3, description=$4, weekdays=$5 WHERE id=$6 RETURNING *',
      [subject_id, category, title, description, weekdays || null, req.params.id]
    );
    res.json({ ...result.rows[0], subject_id: parseInt(result.rows[0].subject_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/checkin/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM checkin_logs WHERE user_id=$1 AND checkin_date=$2',
      [CHILD_USER_ID, today]
    );
    const logs = result.rows.reduce((acc, r) => {
      acc[r.task_id] = {
        minutes: r.minutes,
        mood: r.mood,
        status: r.status,
      };
      return acc;
    }, {});
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch checkin logs' });
  }
});

app.post('/api/checkin', async (req, res) => {
  try {
    const { task_id, minutes, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'INSERT INTO checkin_logs (user_id, task_id, checkin_date, minutes, mood, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [CHILD_USER_ID, task_id, today, minutes, mood, 'pending']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to checkin' });
  }
});

app.delete('/api/checkin/:taskId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'DELETE FROM checkin_logs WHERE user_id=$1 AND task_id=$2 AND checkin_date=$3',
      [CHILD_USER_ID, req.params.taskId, today]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to undo checkin' });
  }
});

app.get('/api/checkin/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT checkin_date, COUNT(*) as count FROM checkin_logs WHERE user_id=$1 GROUP BY checkin_date ORDER BY checkin_date DESC LIMIT 28',
      [CHILD_USER_ID]
    );
    const history = result.rows.reduce((acc, r) => {
      acc[r.checkin_date] = parseInt(r.count);
      return acc;
    }, {});
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM checkin_logs WHERE user_id=$1',
      [CHILD_USER_ID]
    );
    const categoryResult = await pool.query(
      'SELECT t.category, COUNT(*) as count FROM checkin_logs c JOIN tasks t ON c.task_id = t.id WHERE c.user_id=$1 GROUP BY t.category',
      [CHILD_USER_ID]
    );
    const subjectResult = await pool.query(
      'SELECT t.subject_id, COUNT(*) as count FROM checkin_logs c JOIN tasks t ON c.task_id = t.id WHERE c.user_id=$1 GROUP BY t.subject_id',
      [CHILD_USER_ID]
    );
    const streakResult = await pool.query(
      `SELECT checkin_date FROM checkin_logs WHERE user_id=$1 GROUP BY checkin_date ORDER BY checkin_date DESC`,
      [CHILD_USER_ID]
    );

    let streak = 0;
    const today = new Date();
    const dates = streakResult.rows.map(r => r.checkin_date.toISOString().split('T')[0]);
    let checkDate = new Date(today);
    if (!dates.includes(checkDate.toISOString().split('T')[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (dates.includes(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      total: parseInt(totalResult.rows[0].total),
      streak,
      categories: categoryResult.rows.reduce((acc, r) => {
        acc[r.category] = parseInt(r.count);
        return acc;
      }, {}),
      subjects: subjectResult.rows.reduce((acc, r) => {
        acc[r.subject_id] = parseInt(r.count);
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/rewards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reward_items WHERE is_active=true ORDER BY star_cost');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

app.post('/api/redemptions', async (req, res) => {
  try {
    const { reward_item_id, star_cost, name } = req.body;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'INSERT INTO redemptions (user_id, reward_item_id, star_cost, status, request_date) VALUES ($1, $2, $3, $4, $5)',
      [CHILD_USER_ID, reward_item_id, star_cost, 'pending', today]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create redemption' });
  }
});

app.get('/api/redemptions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, ri.name as reward_name FROM redemptions r JOIN reward_items ri ON r.reward_item_id = ri.id WHERE r.user_id=$1 ORDER BY r.created_at DESC',
      [CHILD_USER_ID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

app.get('/api/parent/pending', async (req, res) => {
  try {
    const checkinResult = await pool.query(
      `SELECT c.*, t.title, t.subject_id, t.category FROM checkin_logs c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.status='pending' AND c.user_id=$1
       ORDER BY c.created_at DESC`,
      [CHILD_USER_ID]
    );
    const redemptionResult = await pool.query(
      `SELECT r.*, ri.name as reward_name FROM redemptions r
       JOIN reward_items ri ON r.reward_item_id = ri.id
       WHERE r.status='pending' AND r.user_id=$1
       ORDER BY r.created_at DESC`,
      [CHILD_USER_ID]
    );
    res.json({
      checkins: checkinResult.rows,
      redemptions: redemptionResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending items' });
  }
});

app.post('/api/parent/checkin/:id/approve', async (req, res) => {
  try {
    await pool.query('UPDATE checkin_logs SET status=$1 WHERE id=$2', ['approved', req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve checkin' });
  }
});

app.post('/api/parent/checkin/:id/reject', async (req, res) => {
  try {
    await pool.query('DELETE FROM checkin_logs WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject checkin' });
  }
});

app.post('/api/parent/redemption/:id/approve', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await pool.query('UPDATE redemptions SET status=$1, approved_date=$2 WHERE id=$3', ['approved', today, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve redemption' });
  }
});

app.post('/api/parent/redemption/:id/reject', async (req, res) => {
  try {
    await pool.query('UPDATE redemptions SET status=$1 WHERE id=$2', ['rejected', req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject redemption' });
  }
});

app.get('/api/parent/message', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT message FROM parent_messages WHERE parent_id=$1 AND child_id=$2 ORDER BY updated_at DESC LIMIT 1',
      [PARENT_USER_ID, CHILD_USER_ID]
    );
    res.json({ message: result.rows[0]?.message || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

app.post('/api/parent/message', async (req, res) => {
  try {
    const { message } = req.body;
    const existing = await pool.query(
      'SELECT id FROM parent_messages WHERE parent_id=$1 AND child_id=$2',
      [PARENT_USER_ID, CHILD_USER_ID]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE parent_messages SET message=$1, updated_at=NOW() WHERE parent_id=$2 AND child_id=$3',
        [message, PARENT_USER_ID, CHILD_USER_ID]
      );
    } else {
      await pool.query(
        'INSERT INTO parent_messages (parent_id, child_id, message) VALUES ($1, $2, $3)',
        [PARENT_USER_ID, CHILD_USER_ID, message]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initDatabase();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
