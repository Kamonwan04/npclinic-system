const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ------------------------------------
// 🔐 LOGIN
// ------------------------------------
const USER = {
  username: 'admin',
  password: 'NP999999999'
};

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === USER.username && password === USER.password) {
    return res.json({ success: true, token: 'npclinic-token' });
  }

  return res.status(401).json({ success: false });
});

// ------------------------------------
app.get('/', (req, res) => {
  res.send('NP PRIME CLINIC API RUNNING');
});

// ------------------------------------
// 📊 SALES
// ------------------------------------
app.get('/sales-summary', async (req, res) => {
  try {
    const daily = await db.query(`
      SELECT COALESCE(SUM(amount),0) AS total
      FROM payments
      WHERE created_at >= CURRENT_DATE
    `);

    const monthly = await db.query(`
      SELECT COALESCE(SUM(amount),0) AS total
      FROM payments
      WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
    `);

    const yearly = await db.query(`
      SELECT COALESCE(SUM(amount),0) AS total
      FROM payments
      WHERE date_trunc('year', created_at) = date_trunc('year', CURRENT_DATE)
    `);

    res.json({
      daily: daily.rows[0].total,
      monthly: monthly.rows[0].total,
      yearly: yearly.rows[0].total
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ------------------------------------
// 👥 PATIENTS
// ------------------------------------
app.get('/patients', async (req, res) => {
  const result = await db.query('SELECT * FROM patients ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/patients', async (req, res) => {
  const {
    name,
    lastname,
    nickname,
    phone,
    emergency_name,
    emergency_phone,
    source,
    feeling,
    allergies,
    concerns
  } = req.body;

  const result = await db.query(
    `INSERT INTO patients 
    (name, lastname, nickname, phone, emergency_name, emergency_phone, source, feeling, allergies, concerns) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      name,
      lastname,
      nickname,
      phone,
      emergency_name,
      emergency_phone,
      source,
      feeling,
      allergies,
      concerns
    ]
  );

  res.json(result.rows[0]);
});

app.put('/patients/:id', async (req, res) => {
  const {
    name,
    lastname,
    nickname,
    phone,
    emergency_name,
    emergency_phone,
    source,
    feeling,
    allergies,
    concerns
  } = req.body;

  const result = await db.query(
    `UPDATE patients SET 
      name=$1,
      lastname=$2,
      nickname=$3,
      phone=$4,
      emergency_name=$5,
      emergency_phone=$6,
      source=$7,
      feeling=$8,
      allergies=$9,
      concerns=$10
    WHERE id=$11 RETURNING *`,
    [
      name,
      lastname,
      nickname,
      phone,
      emergency_name,
      emergency_phone,
      source,
      feeling,
      allergies,
      concerns,
      req.params.id
    ]
  );

  res.json(result.rows[0]);
});

app.delete('/patients/:id', async (req, res) => {
  const id = req.params.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM follow_ups WHERE patient_id=$1', [id]);
    await client.query('DELETE FROM appointments WHERE patient_id=$1', [id]);
    await client.query('DELETE FROM medical_records WHERE patient_id=$1', [id]);
    await client.query('DELETE FROM payments WHERE patient_id=$1', [id]);
    await client.query('DELETE FROM patients WHERE id=$1', [id]);

    await client.query('COMMIT');

    res.json({ success: true });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    client.release();
  }
});

// ------------------------------------
// 🔥 PATIENT PROFILE
// ------------------------------------
app.get('/patients/:id', async (req, res) => {
  const id = req.params.id;

  const patient = await db.query('SELECT * FROM patients WHERE id=$1', [id]);

  const records = await db.query(
    'SELECT * FROM medical_records WHERE patient_id=$1 ORDER BY id DESC',
    [id]
  );

  const appointments = await db.query(
    'SELECT * FROM appointments WHERE patient_id=$1 ORDER BY appointment_date ASC',
    [id]
  );

  res.json({
    ...patient.rows[0],

    history: records.rows.map(r => ({
  id: r.id,
  treatment: r.treatment,
  description: r.description,
  media: typeof r.media === 'string'
    ? JSON.parse(r.media)
    : (r.media || [])
})),

    appointments: appointments.rows.map(a => ({
      id: a.id,
      date: new Date(a.appointment_date).toLocaleString('th-TH'),
      note: a.note
    }))
  });
});

// ------------------------------------
// 🏥 RECORDS
// ------------------------------------
app.post('/records', async (req, res) => {
  const { patient_id, treatment, description, media } = req.body;

  const result = await db.query(
    `INSERT INTO medical_records 
     (patient_id, treatment, description, media) 
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [
      patient_id,
      treatment,
      description,
      JSON.stringify({
        before: media?.before || [],
        after: media?.after || []
      })
    ]
  );

  res.json(result.rows[0]);
});

// ------------------------------------
// 📅 APPOINTMENTS
// ------------------------------------
app.get('/appointments', async (req, res) => {
  const result = await db.query(`
    SELECT 
      a.id,
      a.patient_id,
      p.name,
      a.appointment_date,
      a.end_date,
      a.note,
      a.type,
      a.followup_status,

      COALESCE((
        SELECT SUM(amount)
        FROM payments
        WHERE payments.appointment_id = a.id
      ), 0) AS total_paid

    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    ORDER BY a.appointment_date ASC;
  `);

  res.json(result.rows);
});


// ------------------------------------
// 💰 UPDATE / CREATE PAYMENT (จากคิว)
// ------------------------------------
app.post('/payments', async (req, res) => {
  const { appointment_id, patient_id, amount } = req.body;

  if (!appointment_id || !amount) {
    return res.status(400).json({ error: 'missing data' });
  }

  const result = await db.query(
    `INSERT INTO payments (appointment_id, patient_id, amount) 
     VALUES ($1,$2,$3) RETURNING *`,
    [appointment_id, patient_id, amount]
  );

  res.json(result.rows[0]);
});

app.get('/payments', async (req, res) => {
  const result = await db.query('SELECT * FROM payments');
  res.json(result.rows);
});

// CREATE
app.post('/appointments', async (req, res) => {
  let { patient_id, appointment_date, end_date, note, type } = req.body;

  const start = new Date(appointment_date);
  const end = end_date ? new Date(end_date) : new Date(start.getTime() + 3600000);

  if (type !== 'followup') {
    const conflict = await db.query(`
      SELECT * FROM appointments
      WHERE type != 'followup'
      AND ($1 < COALESCE(end_date, appointment_date)
      AND $2 > appointment_date)
    `, [start, end]);

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: '❌ เวลาซ้อน' });
    }
  }

  const result = await db.query(
    `INSERT INTO appointments 
     (patient_id, appointment_date, end_date, note, type, followup_status) 
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [patient_id, start, end, note, type || 'normal', 'pending']
  );

  res.json(result.rows[0]);
});

// ✅ UPDATE TIME (สำคัญมาก)
app.put('/appointments/:id', async (req, res) => {
  const { appointment_date, end_date } = req.body;

  try {
    const result = await db.query(
      `UPDATE appointments
       SET appointment_date=$1, end_date=$2
       WHERE id=$3 RETURNING *`,
      [appointment_date, end_date, req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ MARK FOLLOWUP DONE
app.put('/appointments/:id/followup', async (req, res) => {
  const { status } = req.body;

  const result = await db.query(
    `UPDATE appointments
     SET followup_status = $1
     WHERE id = $2
     RETURNING *`,
    [status, req.params.id]
  );

  res.json(result.rows[0]);
});

// DELETE
app.delete('/appointments/:id', async (req, res) => {
  await db.query('DELETE FROM appointments WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ------------------------------------
// 🔔 FOLLOWUPS
// ------------------------------------
app.get('/followups', async (req, res) => {
  const result = await db.query(`
    SELECT * FROM appointments
    WHERE type='followup'
  `);

  res.json(result.rows);
});

// ------------------------------------
// 🔥 FOLLOWUP AUTO
// ------------------------------------
app.post('/appointments/followup-auto', async (req, res) => {
  let { patient_id, base_date } = req.body;

  if (!base_date) base_date = new Date().toISOString();

  const base = new Date(base_date);
  const days = [1, 7, 14, 30];

  for (let d of days) {
    const start = new Date(base);
    start.setDate(start.getDate() + d);
    start.setHours(11, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    await db.query(
      `INSERT INTO appointments 
       (patient_id, appointment_date, end_date, note, type, followup_status) 
       VALUES ($1,$2,$3,$4,'followup','pending')`,
      [patient_id, start, end, `📞 ติดตามผล ${d} วัน`]
    );
  }

  res.json({ success: true });
});


// ------------------------------------
app.listen(3001, () => {
  console.log('✅ Server running on port 3001');
});