const express = require('express');
const cors = require('cors');
const path = require('path'); // เพิ่มสำหรับการจัดการไฟล์โลโก้
const db = require('./db'); 

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// เปิดให้หน้าบ้าน (Frontend) เข้าถึงไฟล์รูปโลโก้ได้ (สร้างโฟลเดอร์ public และนำ logo.png ไปใส่ไว้ข้างใน)
app.use('/public', express.static(path.join(__dirname, 'public')));

/// ------------------------------------
// 🔐 LOGIN
// ------------------------------------
const USERS = [
  {
    username: 'admin',
    password: 'NP999999999',
    role: 'admin'
  },
  {
    username: 'npprime',
    password: 'NPNP99999',
    role: 'manager'
  }
];

app.post('/login', (req, res) => {

  const { username, password } = req.body || {};

  const user = USERS.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (user) {
    return res.json({
      success: true,
      token: 'npclinic-token',
      role: user.role
    });
  }

  return res.status(401).json({
    success: false
  });

});

// ------------------------------------
app.get('/', (req, res) => {
  res.send('NP PRIME CLINIC API RUNNING');
});

app.get('/doctor-income', async (req, res) => {

  try {

    const result = await db.query(`
      SELECT *
      FROM doctor_income
      ORDER BY id DESC
    `);

    const rows = [];

    for (const r of result.rows) {

      const itemsResult = await db.query(
        `
        SELECT
          procedure_name,
          sales,
          df_percent,
          df_amount
        FROM doctor_income_items
        WHERE income_id = $1
        `,
        [r.id]
      );

      rows.push({
        ...r,

        items: itemsResult.rows.map(item => ({
          procedure: item.procedure_name,
          sales: item.sales,
          percent: item.df_percent,
          df: item.df_amount
        }))
      });
    }

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'server error'
    });

  }

});

// ------------------------------------
// 💾 SAVE DOCTOR INCOME
// ------------------------------------

app.post('/doctor-income', async (req, res) => {

  try {

    const {
      doctor_name,
      date,
      time_start,
      time_end,
      hour_rate,
      hours,
      total_hr,
      total_df,
      dfhr,
      wht,
      doctor_receive,
      total_sales,
      items
    } = req.body;

    // 🔥 save main
    const result = await db.query(
      `
      INSERT INTO doctor_income (
        doctor_name,
        date,
        time_start,
        time_end,
        hour_rate,
        hours,
        total_hr,
        total_df,
        dfhr,
        wht,
        doctor_receive,
        total_sales
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING id
      `,
      [
        doctor_name,
        date,
        time_start,
        time_end,
        hour_rate,
        hours,
        total_hr,
        total_df,
        dfhr,
        wht,
        doctor_receive,
        total_sales
      ]
    );

    const incomeId = result.rows[0].id;

    // 🔥 save items
    for (const item of items) {

      const sales = Number(item.sales || 0);
      const percent = Number(item.percent || 0);

      const df =
        sales * percent / 100;

      await db.query(
        `
        INSERT INTO doctor_income_items (
          income_id,
          procedure_name,
          sales,
          df_percent,
          df_amount
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          incomeId,
          item.procedure,
          sales,
          percent,
          df
        ]
      );
    }

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

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

  try {

    const result = await db.query(
      'SELECT * FROM patients ORDER BY id DESC'
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ'
    });

  }

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
      appointment_date: a.appointment_date,
      end_date: a.end_date,
      note: a.note,
      type: a.type,
      followup_status: a.followup_status,

      deposit_amount: a.deposit_amount,
      total_amount: a.total_amount,
      paid_amount: a.paid_amount,
      payment_status: a.payment_status,

      remaining_amount:
        Number(a.total_amount || 0) -
        Number(a.paid_amount || 0)
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
      p.phone,

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
    LEFT JOIN patients p 
      ON a.patient_id = p.id

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
  try {

    const result = await db.query(`
      SELECT *
      FROM payments
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

// CREATE
app.post('/appointments', async (req, res) => {
  let {
  patient_id,
  appointment_date,
  end_date,
  note,
  type,
  deposit_amount,
  total_amount,
  paid_amount,
  deposit_date,
  payment_status

} = req.body;

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
   (
     patient_id,
     appointment_date,
     end_date,
     note,
     type,
     followup_status,
     deposit_amount,
     total_amount,
     paid_amount,
     payment_status
   ) 
   VALUES (
     $1,$2,$3,$4,$5,$6,
     $7,$8,$9,$10,$11
   ) 
   RETURNING *`,
  [
    patient_id,
    start,
    end,
    note,
    type || 'normal',
    'pending',

    deposit_amount || 0,
    total_amount || 0,
    paid_amount || 0,
    payment_status || 'pending'
  ]
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
// 📦 INVENTORY
// ------------------------------------

// GET ALL
app.get('/inventory', async (req, res) => {

  try {

    const result = await db.query(`
      SELECT *
      FROM inventory
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'โหลดสินค้าไม่สำเร็จ'
    });

  }

});

// CREATE
app.post('/inventory', async (req, res) => {

  try {

    const {
      product_name,
      category,
      stock_qty,
      min_qty,
      unit,
      cost_price,
      sell_price
    } = req.body;

    const result = await db.query(
      `
      INSERT INTO inventory (
        product_name,
        category,
        stock_qty,
        min_qty,
        unit,
        cost_price,
        sell_price
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        product_name,
        category,
        stock_qty,
        min_qty,
        unit,
        cost_price,
        sell_price
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'เพิ่มสินค้าไม่สำเร็จ'
    });

  }

}); 

app.post('/inventory/movement', async (req, res) => {

  const client = await db.connect();

  try {

    const {
      inventory_id,
      type,
      qty,
      note
    } = req.body;

    await client.query('BEGIN');

    // log
    await client.query(
      `
      INSERT INTO inventory_logs (
        inventory_id,
        type,
        qty,
        note
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        inventory_id,
        type,
        qty,
        note
      ]
    );

    // update stock
    if (type === 'IN') {

      await client.query(
        `
        UPDATE inventory
        SET stock_qty = stock_qty + $1
        WHERE id = $2
        `,
        [qty, inventory_id]
      );

    } else {

      await client.query(
        `
        UPDATE inventory
        SET stock_qty = stock_qty - $1
        WHERE id = $2
        `,
        [qty, inventory_id]
      );

    }

    await client.query('COMMIT');

    res.json({
      success: true
    });

  } catch (err) {

    await client.query('ROLLBACK');

    console.error(err);

    res.status(500).json({
      error: 'movement failed'
    });

  } finally {

    client.release();

  }

});
// ------------------------------------
// 📦 เบิกสินค้าหลายรายการ
// ------------------------------------
app.post('/inventory/withdraw', async (req, res) => {

  const client = await db.connect();

  try {

    const {
      items,
      note
    } = req.body;

    await client.query('BEGIN');

    // movement main
    const movementResult = await client.query(
      `
      INSERT INTO inventory_movements (
        type,
        note
      )
      VALUES ('OUT', $1)
      RETURNING *
      `,
      [note || 'เบิกสินค้า']
    );

    const movementId =
      movementResult.rows[0].id;

    // 🔥 LOOP ITEMS
    for (const item of items) {

      // เช็ค stock
      const stockResult = await client.query(
        `
        SELECT *
        FROM inventory
        WHERE id = $1
        `,
        [item.inventory_id]
      );

      const stock = stockResult.rows[0];

      if (!stock) {
        throw new Error('ไม่พบสินค้า');
      }

      if (
        Number(stock.stock_qty) <
        Number(item.qty)
      ) {
        throw new Error(
          `${stock.product_name} stock ไม่พอ`
        );
      }

      // save item
      await client.query(
        `
        INSERT INTO inventory_movement_items (
          movement_id,
          inventory_id,
          qty
        )
        VALUES ($1,$2,$3)
        `,
        [
          movementId,
          item.inventory_id,
          item.qty
        ]
      );

      // update stock
      await client.query(
        `
        UPDATE inventory
        SET stock_qty = stock_qty - $1
        WHERE id = $2
        `,
        [
          item.qty,
          item.inventory_id
        ]
      );

      // save log
      await client.query(
        `
        INSERT INTO inventory_logs (
          inventory_id,
          type,
          qty,
          note
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
          item.inventory_id,
          'OUT',
          item.qty,
          note || 'เบิกสินค้า'
        ]
      );

    }

    await client.query('COMMIT');

    res.json({
      success: true
    });

  } catch (err) {

    await client.query('ROLLBACK');

    console.error(err);

    res.status(500).json({
      error: err.message || 'withdraw failed'
    });

  } finally {

    client.release();

  }

});

// ------------------------------------
// 📜 INVENTORY LOGS
// ------------------------------------
app.get('/inventory/history', async (req, res) => {

  try {

    const result = await db.query(`
      SELECT
        m.id,
        m.type,
        m.note,
        m.created_at,

        json_agg(
          json_build_object(
            'product_name', i.product_name,
            'qty', mi.qty
          )
        ) AS items

      FROM inventory_movements m

      LEFT JOIN inventory_movement_items mi
        ON m.id = mi.movement_id

      LEFT JOIN inventory i
        ON mi.inventory_id = i.id

      GROUP BY m.id

      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'history failed'
    });

  }

});

// ------------------------------------
// 📦 เติมสินค้าเข้า stock
// ------------------------------------
app.post('/inventory/restock', async (req, res) => {

  try {

    const {
      inventory_id,
      qty,
      note
    } = req.body;

    // update stock
    await db.query(
      `
      UPDATE inventory
      SET stock_qty = stock_qty + $1
      WHERE id = $2
      `,
      [qty, inventory_id]
    );

    // log
    await db.query(
      `
      INSERT INTO inventory_logs (
        inventory_id,
        type,
        qty,
        note
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        inventory_id,
        'IN',
        qty,
        note || 'เติมสินค้า'
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'restock failed'
    });

  }

});

// DELETE PRODUCT
app.delete('/inventory/:id', async (req, res) => {

  const client = await db.connect();

  try {

    const id = req.params.id;

    await client.query('BEGIN');

    // ลบ logs
    await client.query(
      `
      DELETE FROM inventory_logs
      WHERE inventory_id = $1
      `,
      [id]
    );

    // ลบ movement items
    await client.query(
      `
      DELETE FROM inventory_movement_items
      WHERE inventory_id = $1
      `,
      [id]
    );

    // ลบ movement ที่ไม่มี item แล้ว
    await client.query(`
      DELETE FROM inventory_movements
      WHERE id NOT IN (
        SELECT DISTINCT movement_id
        FROM inventory_movement_items
      )
    `);

    // ลบสินค้า
    const result = await client.query(
      `
      DELETE FROM inventory
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'ไม่พบสินค้า'
      });
    }

    res.json({
      success: true
    });

  } catch (err) {

    await client.query('ROLLBACK');

    console.error('DELETE INVENTORY ERROR:', err);

    res.status(500).json({
      error: err.message
    });

  } finally {

    client.release();

  }

});

// =============================
// DF RECORDS
// =============================

let dfRecords = [];

app.get('/df-records', (req, res) => {
  res.json(dfRecords);
});

app.post('/df-records', (req, res) => {

  const data = {
    id: Date.now(),
    ...req.body,
    created_at: new Date()
  };

  dfRecords.unshift(data);

  res.json({
    success: true
  });

});
// ------------------------------------

app.listen(3001, () => {
  console.log('✅ Server running on port 3001');

});

