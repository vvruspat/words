-- Additive migration for deployments with DB_SYNCHRONIZE=false.
-- Run before deploying the Apple/Google sign-in API. Existing users stay intact.
BEGIN;
CREATE TABLE IF NOT EXISTS social_identity (
    provider varchar(16) NOT NULL,
    subject varchar(255) NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT social_identity_pkey PRIMARY KEY (provider, subject),
    CONSTRAINT social_identity_user_fk FOREIGN KEY (user_id)
        REFERENCES "user" (id) ON DELETE CASCADE
);
COMMIT;
