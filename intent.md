# Intent: recreate laju as volt on remix 3 rc baseline
Author: qisthidev. Status: draft.

## Problem
Current stack and conventions are tied to the existing implementation, which makes long-term evolution harder across architecture, onboarding, and consistency.
If the framework baseline is not pinned, implementation may default to Remix stable v2 and diverge from the intended direction.

## Proposed outcome
Recreate the existing project capabilities as **Volt** on **Remix `3.0.0-rc.1`** baseline, preserving critical behavior while improving maintainability and architectural clarity.
Release target (must-follow): https://github.com/remix-run/remix/releases/tag/remix%403.0.0-rc.1

## Affected users and systems
Framework maintainers, application developers using Volt, CI/CD pipelines, SQLite-backed data layer, session/auth subsystem, migrated route modules.

## Constraints
Use Remix `3.0.0-rc.1` explicitly (do not fallback to stable v2).
No architecture rule violations: Handler → Service → Repository → DB.
No SQL outside repositories.
No ad-hoc users-table query in auth middleware when session cache is sufficient.
Use existing authentication model and avoid introducing unnecessary sensitive data into session payloads.
CSRF validation required for all state-changing routes.

## Open questions
Will Volt keep SQLite as default-only for v1, or define an official expansion path early?
How much UI parity is required in first release vs phased migration?
Do we enforce architecture rules via lint/AST checks from day one?
Should real-time features ship in v1 scope or after baseline stabilization?
