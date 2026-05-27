# TODO - Day 13: Final Testing & Debugging

- [ ] Run frontend lint + build
- [ ] Run backend quick smoke checks (start server / lint if available)
- [ ] Verify API route alignment:
  - [ ] `/api/auth/register` + `/api/auth/login`
  - [ ] `/api/upload/transcribe` (multer field name `audio`)
  - [ ] `/api/upload/transcriptions`, `/api/upload/transcription/:id`
- [ ] Verify auth behavior (401 handling, token storage key `echoscriptai_token`)
- [ ] Verify transcription DB fields:
  - [ ] `userId`, `audioFile.*`, `transcription`, `status`, `provider`
- [ ] Fix any failures found by tests/smoke checks
- [ ] Re-run lint/build + smoke checks after fixes
- [ ] Commit with message: `Day 13: Final Testing & Debugging` (Day 13 completed)
