-- Clean up duplicate interview participants
-- This script finds and removes duplicate interview participants for the same application

-- First, let's identify duplicates
SELECT 
    a.id as application_id,
    j.email,
    COUNT(DISTINCT ip.interview_id) as interview_count,
    STRING_AGG(DISTINCT i.id, ', ') as interview_ids,
    STRING_AGG(DISTINCT i.scheduled_at::text, ', ') as scheduled_dates
FROM "Application" a
JOIN "Jobseeker" j ON a.jobseeker_id = j.id
JOIN "User" u ON j.user_id = u.id
JOIN "InterviewParticipant" ip ON ip.application_id = a.id
JOIN "Interview" i ON ip.interview_id = i.id
WHERE i.status IN ('SCHEDULED', 'RESCHEDULED')
GROUP BY a.id, j.email
HAVING COUNT(DISTINCT ip.interview_id) > 1
ORDER BY interview_count DESC;

-- To delete duplicate interviews (keeping only the latest one):
-- UNCOMMENT BELOW AFTER REVIEWING THE DUPLICATES

/*
WITH duplicates AS (
    SELECT 
        ip.id as participant_id,
        ip.interview_id,
        ip.application_id,
        i.scheduled_at,
        ROW_NUMBER() OVER (PARTITION BY ip.application_id ORDER BY i.created_at DESC) as rn
    FROM "InterviewParticipant" ip
    JOIN "Interview" i ON ip.interview_id = i.id
    WHERE i.status IN ('SCHEDULED', 'RESCHEDULED')
)
DELETE FROM "InterviewParticipant"
WHERE id IN (
    SELECT participant_id 
    FROM duplicates 
    WHERE rn > 1  -- Remove all except the most recent
);
*/

-- After deleting participants, clean up orphaned interviews
/*
DELETE FROM "Interview"
WHERE id NOT IN (
    SELECT DISTINCT interview_id 
    FROM "InterviewParticipant"
)
AND status IN ('SCHEDULED', 'RESCHEDULED');
*/
