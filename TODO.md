# TODO - Nirmaan Exam System Fixes

## Attendance (Unauthorized + teacher/admin access)
- [x] Locate the exact 401/403 source for attendance report/verification when admin/teacher uses UI.
- [ ] Fix any role mismatch in JWT payload handling.
- [ ] Ensure teacher can access only their records and admin can access all attendance records.


## Sync DB / Data Consistency
- [ ] Find existing “sync db” implementation or UI call.
- [ ] Implement an idempotent backend endpoint for attendance sync + question bank sync (if missing).
- [ ] Wire frontend “sync db” button to the endpoint.

## Internal Server Errors (500)
- [ ] Add structured logging (request id + route name) around failing areas.
- [ ] Standardize response schema for frontend.

## Proctoring: Track face during exam
- [ ] Find where frontend sends face/camera/proctoring events.
- [ ] Implement missing backend endpoints/storage or correct the event logging.
- [ ] Ensure events are stored in ProctoringLog and show up in proctoring report UI.

## Teacher question pushing + AI generated questions
- [ ] Confirm AI question generation endpoint response schema.
- [ ] Implement persistence of generated questions into Question/Test question banks.
- [ ] Wire teacher UI actions to correct endpoints.

## RGAT option not working
- [ ] Search for “rgat” usage and fix broken UI/backend logic.

## Verification
- [ ] Run local tests / start server and validate:
  - [ ] Admin/teacher attendance report loads
  - [ ] Teacher attendance verification approve/reject works
  - [ ] Attendance sync works and does not create duplicates
  - [ ] AI generated question push works end-to-end
  - [ ] Proctoring face tracking events appear during exam
  - [ ] No unhandled 500 errors

