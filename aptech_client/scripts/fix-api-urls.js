const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
let fixedCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      walkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix: fetch(`/api/...`) → fetch(`${API_BASE}/...`)
  // Pattern: fetch(`/api/ or fetch("/api/ or fetch('/api/
  const patterns = [
    // backtick template: fetch(`/api/mentors/${id}`)
    { find: /fetch\(`\/api\//g, replace: "fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')}/api/" },
    // double quote: fetch("/api/mentors")
    { find: /fetch\("\/api\//g, replace: "fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + \"/api/" },
    // single quote: fetch('/api/mentors')
    { find: /fetch\('\/api\//g, replace: "fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/" },
  ];

  for (const p of patterns) {
    if (p.find.test(content)) {
      content = content.replace(p.find, p.replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log('Fixed:', path.relative(srcDir, filePath));
  }
}

walkDir(srcDir);
console.log(`\nTotal files fixed: ${fixedCount}`);
