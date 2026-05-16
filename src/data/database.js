import * as SQLite from 'expo-sqlite';
import { devices as seedDevices } from './dummyData';

let dbPromise = null;

function getDb() {
  if (!dbPromise) dbPromise = initDb();
  return dbPromise;
}

async function initDb() {
  const db = await SQLite.openDatabaseAsync('savesome.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS devices (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      model       TEXT,
      room_id     TEXT,
      icon        TEXT,
      energyClass TEXT,
      watt        INTEGER,
      kwh_per_day REAL,
      status      TEXT,
      start_time  TEXT,
      end_time    TEXT,
      type        TEXT,
      pnc         TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const { count: sc } = await db.getFirstAsync('SELECT COUNT(*) as count FROM settings');
  if (sc === 0) {
    await db.withTransactionAsync(async () => {
      for (const [key, value] of [
        ['monthlyGoalKwh', '180'],
        ['strompreis',     '0.30'],
        ['notifications',  'true'],
      ]) {
        await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
      }
    });
  }

  const { count } = await db.getFirstAsync('SELECT COUNT(*) as count FROM devices');
  if (count === 0) {
    await db.withTransactionAsync(async () => {
      for (const d of seedDevices) {
        await db.runAsync(
          `INSERT INTO devices
             (id, name, model, room_id, icon, energyClass, watt, kwh_per_day,
              status, start_time, end_time, type, pnc)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.name, d.model, d.room_id, d.icon, d.energyClass,
           d.watt, d.kwh_per_day, d.status, d.start_time, d.end_time, d.type, d.pnc]
        );
      }
    });
  }
  return db;
}

export async function getAllDevices() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM devices ORDER BY room_id');
}

export async function getSettings() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT key, value FROM settings');
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    monthlyGoalKwh: parseInt(map.monthlyGoalKwh  ?? '180',  10),
    strompreis:     parseFloat(map.strompreis     ?? '0.30'),
    notifications:  (map.notifications            ?? 'true') === 'true',
  };
}

export async function saveSetting(key, value) {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, String(value)]
  );
}

export async function insertDevice(device) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR IGNORE INTO devices
       (id, name, model, room_id, icon, energyClass, watt, kwh_per_day,
        status, start_time, end_time, type, pnc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      device.id,
      device.name,
      device.model  ?? device.name,
      device.room_id,
      device.icon,
      device.energyClass,
      device.watt,
      device.kwh_per_day ?? +(device.watt * 8 / 1000).toFixed(2),
      device.status     ?? 'off',
      device.start_time ?? null,
      device.end_time   ?? null,
      device.type       ?? null,
      device.pnc        ?? null,
    ]
  );
}

export async function deleteDevice(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM devices WHERE id=?', [id]);
}

export async function updateDevice(device) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE devices
     SET name=?, watt=?, energyClass=?, status=?, start_time=?, end_time=?, room_id=?
     WHERE id=?`,
    [device.name, device.watt, device.energyClass,
     device.status, device.start_time, device.end_time,
     device.room_id, device.id]
  );
}
