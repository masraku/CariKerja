-- Check interview status untuk application ini
-- Ganti APPLICATION_ID dengan ID dari screenshot

SELECT 
    a.id as application_id,
    a.status as application_status,
    ip.id as participant_id,
    ip.status as participant_status,
    i.id as interview_id,
    i.status as interview_status,
    i.scheduled_at,
    i.title
FROM "Application" a
LEFT JOIN "InterviewParticipant" ip ON ip.application_id = a.id
LEFT JOIN "Interview" i ON ip.interview_id = i.id
WHERE a.id = 'YOUR_APPLICATION_ID_HERE'
ORDER BY i.created_at DESC;

-- Jika interview.status bukan 'COMPLETED', maka itu masalahnya
-- Harusnya setelah klik "Mark as Completed", interview.status = 'COMPLETED'
