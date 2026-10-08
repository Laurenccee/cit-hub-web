-- Offline-first desk attendance: idempotency keys, one-open-visit guard,
-- realtime publication membership, and public UPDATE policy for check-outs.
-- Mirrors what was applied to the remote database (version 20261008034030).

ALTER TABLE public.event_attendance
    ADD COLUMN IF NOT EXISTS check_in_client_id text,
    ADD COLUMN IF NOT EXISTS check_out_client_id text;

-- Idempotency keys for offline tap replay: one row per client-generated tap id.
CREATE UNIQUE INDEX IF NOT EXISTS event_attendance_check_in_client_id_key
    ON public.event_attendance (check_in_client_id)
    WHERE check_in_client_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS event_attendance_check_out_client_id_key
    ON public.event_attendance (check_out_client_id)
    WHERE check_out_client_id IS NOT NULL;

-- A student can only have one open visit (checked in, not yet checked out).
CREATE UNIQUE INDEX IF NOT EXISTS event_attendance_one_open_visit_key
    ON public.event_attendance (student_id)
    WHERE student_id IS NOT NULL AND check_in IS NOT NULL AND check_out IS NULL;

-- Realtime updates for the desk terminal live feed.
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendance;

-- Allow check-outs (UPDATE) on attendance rows for published, non-archived events.
CREATE POLICY event_attendance_public_update ON public.event_attendance
    FOR UPDATE TO public
    USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_attendance.event_id
              AND e.is_published = true
              AND e.is_archived = false
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_attendance.event_id
              AND e.is_published = true
              AND e.is_archived = false
        )
    );
