const fs = require('node:fs');
const path = require('node:path');

const url = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

fs.writeFileSync(
  path.join(__dirname, 'js', 'config.js'),
  `export const API_BASE_URL = ${JSON.stringify(url)};\n`
);