import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), 'dist', 'tokens');
const TARGET_DIR = path.join(process.cwd(), 'public', 'tokens');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.warn('⚠️ Missing dist/tokens, run tokens:export first.');
  process.exit(0);
}

copyDir(SOURCE_DIR, TARGET_DIR);
console.log(`✅ W3C tokens copied to ${TARGET_DIR}`);
