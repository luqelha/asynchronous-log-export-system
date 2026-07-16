const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../storage/raw_logs');

const TOTAL_FILES = 10000;

const LINES_PER_FILE = 100;

const LOG_LEVELS = ['INFO', 'DEBUG', 'WARNING', 'ERROR'];

const SERVICES = [
  'AuthService',
  'UserService',
  'OrderService',
  'PaymentService',
  'NotificationService',
  'InventoryService',
];

const ACTIONS = [
  'User login',
  'User logout',
  'Create order',
  'Update profile',
  'Delete account',
  'Payment processed',
  'Payment failed',
  'Stock updated',
  'Email sent',
  'Generate report',
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomTimestamp() {
  const start = new Date('2025-01-01').getTime();
  const end = new Date('2025-12-31').getTime();

  return new Date(start + Math.random() * (end - start)).toISOString();
}

for (let i = 1; i <= TOTAL_FILES; i++) {
  const logs = [];

  for (let j = 1; j <= LINES_PER_FILE; j++) {
    logs.push(
      `[${randomTimestamp()}] ` +
        `[${randomItem(LOG_LEVELS)}] ` +
        `[${randomItem(SERVICES)}] ` +
        `${randomItem(ACTIONS)} ` +
        `IP=${randomIP()}`,
    );
  }

  const filename = `log_${String(i).padStart(5, '0')}.txt`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), logs.join('\n'));
}

console.log(`${TOTAL_FILES} file log berhasil dibuat.`);
