const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const STORAGE_DIR = path.join(process.cwd(), 'storage');

const RAW_LOG_PATH = path.join(STORAGE_DIR, 'raw_logs');

const EXPORT_PATH = path.join(STORAGE_DIR, 'exports');

if (!fs.existsSync(EXPORT_PATH)) {
  fs.mkdirSync(EXPORT_PATH, { recursive: true });
}

async function compressLogs(jobId) {
  return new Promise((resolve, reject) => {
    const zipName = `export-${jobId}.zip`;

    const output = fs.createWriteStream(path.join(EXPORT_PATH, zipName));

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      resolve({
        zipName,
        size: archive.pointer(),
      });
    });

    archive.on('error', reject);

    archive.pipe(output);

    const files = fs.readdirSync(RAW_LOG_PATH);

    files.forEach(file => {
      archive.file(
        path.join(RAW_LOG_PATH, file),

        { name: file },
      );
    });

    archive.finalize();
  });
}

module.exports = compressLogs;
