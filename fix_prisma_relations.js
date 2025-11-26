const fs = require('fs');
const path = require('path');

// Patterns to fix
const fixes = [
  // company: { -> companies: {
  { pattern: /(\s+)company: \{/g, replacement: '$1companies: {' },
  
  // recruiter: { -> recruiters: {
  { pattern: /(\s+)recruiter: \{/g, replacement: '$1recruiters: {' },
  
  // job: { -> jobs: {
  { pattern: /(\s+)job: \{/g, replacement: '$1jobs: {' },
  
  // jobseeker: { -> jobseekers: { (in include/select)
  { pattern: /(\s+)jobseeker: \{/g, replacement: '$1jobseekers: {' },
  
  // Access patterns: job.company -> job.companies
  { pattern: /\.company\./g, replacement: '.companies.' },
  
  // Access patterns: job.recruiter -> job.recruiters
  { pattern: /\.recruiter\./g, replacement: '.recruiters.' },
  
  // Access patterns: application.job -> application.jobs
  { pattern: /application\.job\./g, replacement: 'application.jobs.' },
  
  // Access patterns: user.jobseeker -> user.jobseekers (but not user.jobseekers already)
  { pattern: /user\.jobseeker\./g, replacement: 'user.jobseekers.' },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(({ pattern, replacement }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  const results = { fixed: [], total: 0 };
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && !file.startsWith('node_modules')) {
        const subResults = walkDir(filePath);
        results.fixed.push(...subResults.fixed);
        results.total += subResults.total;
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.total++;
      if (fixFile(filePath)) {
        results.fixed.push(filePath);
      }
    }
  });
  
  return results;
}

console.log('🔧 Auto-fixing Prisma relation names...\n');

const apiDir = path.join(__dirname, 'app', 'api');
const results = walkDir(apiDir);

console.log('✅ Fixed', results.fixed.length, 'files out of', results.total, 'total files\n');

if (results.fixed.length > 0) {
  console.log('📝 Modified files:');
  results.fixed.forEach(f => {
    console.log('  -', path.relative(__dirname, f));
  });
}

console.log('\n🎉 Done! All API files have been fixed.');
