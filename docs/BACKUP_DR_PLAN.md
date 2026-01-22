# Backup & Disaster Recovery Plan

## Overview

This document outlines the backup and disaster recovery procedures for the Disnaker Kabupaten Cirebon job portal.

---

## 1. Infrastructure Components

| Component             | Provider         | Backup Method                        |
| --------------------- | ---------------- | ------------------------------------ |
| Database (PostgreSQL) | Supabase         | Automatic daily backups (Pro plan)   |
| File Storage          | Supabase Storage | Replicated across availability zones |
| Application           | Vercel           | Git-based, instant rollback          |
| Environment Variables | Vercel           | Manual backup recommended            |

---

## 2. Database Backup

### Supabase Automatic Backups

- **Frequency**: Every 24 hours (Pro plan)
- **Retention**: 7 days (Pro) / 30 days (Enterprise)
- **Location**: Secure cloud storage

### Manual Backup (Recommended Monthly)

```bash
# Using pg_dump via Supabase connection
pg_dump -h db.<project-ref>.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

### Restore Procedure

1. Log into Supabase Dashboard
2. Navigate to Settings > Database
3. Use Point-in-Time Recovery (PITR) if available
4. Or restore from SQL dump:

```bash
psql -h db.<project-ref>.supabase.co -U postgres -d postgres < backup_file.sql
```

---

## 3. File Storage Backup

### Supabase Storage

- Files are automatically replicated
- For critical files, download periodically:

```bash
# Using Supabase CLI
supabase storage download Profile --output ./backup/profile/
supabase storage download Resume --output ./backup/resume/
supabase storage download Lowongan --output ./backup/lowongan/
```

---

## 4. Application Recovery

### Vercel Deployment

- All deployments are versioned in Git
- Instant rollback available via Vercel Dashboard

### Recovery Steps

1. Go to Vercel Dashboard > Deployments
2. Find the last stable deployment
3. Click "..." > "Promote to Production"

---

## 5. Environment Variables

### Backup

Store a secure copy of all environment variables:

- Database URL
- JWT Secret
- Supabase Keys
- Redis Credentials

**Storage**: Use a secure password manager or encrypted file.

### Recovery

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Re-add all required variables
3. Redeploy

---

## 6. Disaster Scenarios

### Scenario A: Database Corruption

1. Stop accepting new writes (maintenance mode ON)
2. Identify last clean backup
3. Restore from Supabase backup
4. Verify data integrity
5. Resume operations

### Scenario B: Application Down

1. Check Vercel status page
2. If Vercel issue: Wait for resolution
3. If code issue: Rollback to previous deployment
4. If DNS issue: Check domain settings

### Scenario C: Security Breach

1. Immediately rotate all secrets (JWT, API keys)
2. Enable maintenance mode
3. Review audit logs
4. Identify compromised accounts
5. Force password reset for affected users
6. Notify relevant authorities if required

---

## 7. Recovery Time Objectives

| Scenario         | RTO (Recovery Time) | RPO (Data Loss) |
| ---------------- | ------------------- | --------------- |
| Minor outage     | < 15 minutes        | 0               |
| Database restore | < 2 hours           | < 24 hours      |
| Full disaster    | < 4 hours           | < 24 hours      |

---

## 8. Testing Schedule

| Test                | Frequency | Responsible      |
| ------------------- | --------- | ---------------- |
| Backup verification | Monthly   | IT Admin         |
| Restore drill       | Quarterly | IT Team          |
| Full DR simulation  | Annually  | All stakeholders |

---

## 9. Contacts

| Role             | Contact             | Responsibility    |
| ---------------- | ------------------- | ----------------- |
| IT Admin         | [TBD]               | Primary responder |
| Supabase Support | support@supabase.io | Database issues   |
| Vercel Support   | support@vercel.com  | Deployment issues |

---

## 10. Revision History

| Date       | Version | Changes          |
| ---------- | ------- | ---------------- |
| 2026-01-23 | 1.0     | Initial document |
