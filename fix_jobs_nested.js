const fs = require('fs');
const path = require('path');

// Fix company and recruiter nested in jobs
const fixes = [
  // After .jobs, fix .company to .companies
  { pattern: /\.jobs\.company\./g, replacement: '.jobs.companies.' },
  { pattern: /\.jobs\.company([,\s\)])/g, replacement: '.jobs.companies$1' },
  
  // After .jobs, fix .recruiter to .recruiters
  { pattern: /\.jobs\.recruiter\./g, replacement: '.jobs.recruiters.' },
  { pattern: /\.jobs\.recruiter([,\s\)])/g, replacement: '.jobs.recruiters$1' },
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
  'app/profile/jobseeker/dashboard/page.jsx',
  'app/profile/recruiter/dashboard/applications/page.jsx',
];

console.log('🔧 Fixing .jobs.company → .jobs.companies...\n');

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath)) {
      console.log('✅ Fixed:', file);
      fixed++;
    } else {
      console.log('⏭️  Already correct:', file);
    }
  } else {
    console.log('❌ Not found:', file);
  }
});

console.log('\n🎉 Fixed', fixed, 'files');
console.log('📝 All .jobs.company references changed to .jobs.companies');
