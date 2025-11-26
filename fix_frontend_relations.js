const fs = require('fs');
const path = require('path');

// Fix frontend files that reference app.job (should be app.jobs)
const frontendFixes = [
  { pattern: /app\.job\./g, replacement: 'app.jobs.' },
  { pattern: /app\.job\.company\./g, replacement: 'app.jobs.companies.' },
  { pattern: /app\.job\.recruiter/g, replacement: 'app.jobs.recruiters' },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  frontendFixes.forEach(({ pattern, replacement }) => {
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

const filesToFix = [
  'app/profile/jobseeker/applications/page.jsx',
  'app/profile/recruiter/dashboard/applications/page.jsx',
  'app/api/debug/check-jobseeker/route.js',
  'app/api/debug/data/route.js',
  'app/api/profile/recruiter/jobs/[slug]/applications/batch/route.js'
];

console.log('🔧 Fixing frontend files...\n');

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath)) {
      console.log('✅ Fixed:', file);
      fixed++;
    } else {
      console.log('⏭️  Skipped (no changes):', file);
    }
  } else {
    console.log('❌ Not found:', file);
  }
});

console.log('\n🎉 Fixed', fixed, 'files');
