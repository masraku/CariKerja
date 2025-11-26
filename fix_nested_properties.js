const fs = require('fs');
const path = require('path');

// More comprehensive fixes for nested properties
const fixes = [
  // Must fix nested ones FIRST before general ones
  { pattern: /\.job\.company\./g, replacement: '.jobs.companies.' },
  { pattern: /\.job\.company\b/g, replacement: '.jobs.companies' },
  { pattern: /\.job\.recruiter\./g, replacement: '.jobs.recruiters.' },
  { pattern: /\.job\.recruiter\b/g, replacement: '.jobs.recruiters' },
  { pattern: /\.jobseeker\./g, replacement: '.jobseekers.' },
  { pattern: /\.jobseeker\b/g, replacement: '.jobseekers' },
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

const filesToFix = [
  'app/profile/jobseeker/applications/page.jsx',
  'app/profile/recruiter/dashboard/applications/page.jsx',
];

console.log('🔧 Fixing nested properties in frontend files...\n');

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath)) {
      console.log('✅ Fixed:', file);
      fixed++;
    } else {
      console.log('⏭️  No changes needed:', file);
    }
  } else {
    console.log('❌ Not found:', file);
  }
});

console.log('\n🎉 Fixed', fixed, 'files');
