import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'child')),
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(10),
        grade VARCHAR(50),
        class_name VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        subject_id INTEGER NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('复习', '预习', '作业')),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        weekdays INTEGER[],
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS checkin_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        task_id VARCHAR(50) NOT NULL,
        checkin_date DATE NOT NULL,
        minutes INTEGER NOT NULL DEFAULT 30,
        mood INTEGER NOT NULL DEFAULT 1 CHECK (mood BETWEEN 0 AND 2),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, task_id, checkin_date)
      );

      CREATE TABLE IF NOT EXISTS reward_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        star_cost INTEGER NOT NULL,
        description VARCHAR(500),
        is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reward_item_id INTEGER NOT NULL,
        star_cost INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        request_date DATE NOT NULL,
        approved_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS parent_messages (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL,
        child_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_checkin_logs_date ON checkin_logs(checkin_date);
      CREATE INDEX IF NOT EXISTS idx_checkin_logs_user_date ON checkin_logs(user_id, checkin_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject_id);
      CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
    `);

    console.log('Database tables created successfully');
  } finally {
    client.release();
  }
}

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Database already seeded');
      return;
    }

    await client.query(`
      INSERT INTO users (role, name, avatar, grade, class_name) VALUES
      ('parent', '家长', '家', '三年级', '2班'),
      ('child', '小明', '明', '三年级', '2班');

      INSERT INTO tasks (id, subject_id, category, title, description, weekdays, is_default) VALUES
      ('c1', 0, '复习', '古诗背诵', '《静夜思》默写 1 遍', NULL, true),
      ('c2', 0, '预习', '第 9 课《曹冲称象》', '朗读 3 遍，圈出生字', NULL, true),
      ('c3', 0, '作业', '生字练习', '第 8 课生字各写 3 遍', NULL, true),
      ('m1', 1, '复习', '错题整理', '本周错题 3 道', NULL, true),
      ('m2', 1, '预习', '第五单元', '读课本 42–45 页', NULL, true),
      ('m3', 1, '作业', '口算练习', '20 题 · 限时 10 分钟', NULL, true),
      ('e1', 2, '复习', 'Unit 2 单词听写', '听写 10 个', NULL, true),
      ('e2', 2, '预习', 'Unit 3 跟读', '跟读录音 2 遍', NULL, true),
      ('e3', 2, '作业', '抄写单词', 'Unit 3 各 2 遍', NULL, true);

      INSERT INTO reward_items (name, star_cost, description) VALUES
      ('看动画片 30 分钟', 20, '周末可用'),
      ('新文具一份', 40, '自己挑选'),
      ('周末去公园', 50, '全家一起'),
      ('选一本课外书', 60, '书店任选'),
      ('家庭电影夜', 90, '选片权归你'),
      ('乐园一日游', 150, '每学期限 1 次');
    `);

    console.log('Database seeded successfully');
  } finally {
    client.release();
  }
}

export default pool;
