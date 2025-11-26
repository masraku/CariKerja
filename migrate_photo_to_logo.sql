-- Copy the recruiter's photoUrl to the company's logo field
UPDATE companies 
SET logo = (
    SELECT photoUrl 
    FROM recruiters 
    WHERE recruiters.companyId = companies.id 
    LIMIT 1
)
WHERE id = 'cmi966k88001605m0byzixien';
