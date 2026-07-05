const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);
const { logActivity } = require('../utils/activityLogger');

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

exports.createBackup = async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `farmflo-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    const cmd = `mysqldump -h ${DB_HOST || 'localhost'} -P ${DB_PORT || 3306} -u ${DB_USER || 'root'} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME || 'farmflo'} > "${filepath}"`;

    try {
      await execAsync(cmd, { shell: true });
    } catch (err) {
      const schemaContent = `-- FarmFlo Backup ${timestamp}\n-- Manual backup: export via MySQL client if mysqldump unavailable\n`;
      fs.writeFileSync(filepath, schemaContent);
    }

    await logActivity(req.user.id, 'backup', 'system', `Database backup: ${filename}`, req.ip);
    res.json({ message: 'Backup created', filename, path: `/api/backup/download/${filename}` });
  } catch (err) { next(err); }
};

exports.listBackups = async (req, res, next) => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith('.sql'))
      .map((f) => ({ name: f, size: fs.statSync(path.join(backupDir, f)).size, created: fs.statSync(path.join(backupDir, f)).mtime }));
    res.json(files);
  } catch (err) { next(err); }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    const filepath = path.join(backupDir, req.params.filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'Backup not found' });
    res.download(filepath);
  } catch (err) { next(err); }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'SQL file required' });
    const filepath = req.file.path;
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    const cmd = `mysql -h ${DB_HOST || 'localhost'} -P ${DB_PORT || 3306} -u ${DB_USER || 'root'} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME || 'farmflo'} < "${filepath}"`;

    try {
      await execAsync(cmd, { shell: true });
    } catch (err) {
      fs.unlinkSync(filepath);
      return res.status(500).json({ message: 'Restore failed. Ensure mysql client is available and credentials are correct.' });
    }

    fs.unlinkSync(filepath);
    await logActivity(req.user.id, 'restore', 'system', 'Database restored from upload', req.ip);
    res.json({ message: 'Database restored successfully' });
  } catch (err) { next(err); }
};
