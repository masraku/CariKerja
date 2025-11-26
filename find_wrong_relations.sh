#!/bin/bash

# Script to find and report all files with wrong Prisma relation names

echo "🔍 Finding files with wrong Prisma relations..."
echo "================================================"
echo ""

# Find files with 'company:' in include/select (should be 'companies:')
echo "❌ Files using 'company:' (should be 'companies:'):"
grep -r "company: {" app/api --include="*.js" | grep -v "companies" | cut -d: -f1 | sort -u | wc -l
echo ""

# Find files with 'recruiter:' in include (should be 'recruiters:')
echo "❌ Files using 'recruiter:' (should be 'recruiters:'):"
grep -r "recruiter: {" app/api --include="*.js" | grep -v "recruiters" | cut -d: -f1 | sort -u | wc -l
echo ""

# Find files with 'job:' in include (should be 'jobs:')
echo "❌ Files using 'job:' (should be 'jobs:'):"
grep -r "job: {" app/api --include="*.js" | grep -v "jobs" | cut -d: -f1 | sort -u | wc -l
echo ""

echo "Total files to fix: $(( $(grep -r "company: {" app/api --include="*.js" | grep -v "companies" | cut -d: -f1 | sort -u | wc -l) + $(grep -r "recruiter: {" app/api --include="*.js" | grep -v "recruiters" | cut -d: -f1 | sort -u | wc -l) + $(grep -r "job: {" app/api --include="*.js" | grep -v "jobs" | cut -d: -f1 | sort -u | wc -l) ))"
