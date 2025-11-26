const fs = require('fs');
const path = require('path');

// COMPREHENSIVE fixes - fix ALL .job references to .jobs
const fixes = [
  // Fix all variations of .job. to .jobs.
  { pattern: /(\w+)\.job\./g, replacement: '$1.jobs.' },
  
  // Fix .job at end of expression (without dot after)
  { pattern: /(\w+)\.job([,\s\)])/g, replacement: '$1.jobs$2' },
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
  'app/profile/jobseeker/dashboard/page.jsx',  // Added dashboard
  'app/profile/recruiter/dashboard/applications/page.jsx',
];

console.log('🔧 Fixing dashboard and all remaining .job references...\n');

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath)) {
      console.log('✅ Fixed:', file);
      fixed++;
    } else {
      console.log('⏭️  Already fixed:', file);
    }
  } else {
    console.log('❌ Not found:', file);
  }
});

console.log('\n🎉 Fixed', fixed, 'files');
