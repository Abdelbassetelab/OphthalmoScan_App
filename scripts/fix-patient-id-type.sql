-- Temporarily disable the foreign key constraint
ALTER TABLE scan_requests DROP CONSTRAINT IF EXISTS fk_patient;

-- Change patient_id column type from UUID to TEXT
ALTER TABLE scan_requests 
    ALTER COLUMN patient_id TYPE TEXT,
    ALTER COLUMN patient_id SET NOT NULL;

-- Update the foreign key constraint to reference auth.users with TEXT id
ALTER TABLE scan_requests 
    ADD CONSTRAINT fk_patient 
    FOREIGN KEY (patient_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
