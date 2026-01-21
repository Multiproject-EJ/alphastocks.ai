# MIGRATIONS_LOG.md

## SQL migrations / patches (append-only)
> Add every migration here so EJ knows exactly what to run or rerun.

### Template
- `YYYYMMDDHHMM__name.sql`
  - Purpose:
  - Depends on:
  - Safe rerun: Yes/No
  - Rollback:
  - Verify:
    - `SELECT 1;`
  - Required for prod: Yes/No
