-- Host IANA timezone for availability and slot display conversion.
ALTER TABLE "User" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'America/New_York';
