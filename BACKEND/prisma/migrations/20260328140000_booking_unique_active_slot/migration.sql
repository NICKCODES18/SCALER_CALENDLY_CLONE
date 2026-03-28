-- Prevent two scheduled bookings for the same event type, calendar date, and start time (race-safe).
CREATE UNIQUE INDEX "Booking_eventTypeId_date_startTime_scheduled_unique"
ON "Booking" ("eventTypeId", "date", "startTime")
WHERE status = 'scheduled';
