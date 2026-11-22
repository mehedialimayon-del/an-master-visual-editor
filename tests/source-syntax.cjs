'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
  .filter((match) => !/\bsrc\s*=/.test(match[1]));

if (!scripts.length) {
  throw new Error('No inline editor scripts found; source-syntax guard cannot run.');
}
for (let i = 0; i < scripts.length; i += 1) {
  try {
    new vm.Script(scripts[i][2], { filename: 'index.html:inline-script-' + (i + 1) });
  } catch (error) {
    console.error('Inline JavaScript parse failure at script ' + (i + 1) + ': ' + error.message);
    throw error;
  }
}
console.log('PASS: Parsed ' + scripts.length + ' inline JavaScript blocks in index.html.');
