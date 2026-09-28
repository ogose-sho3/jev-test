# Security Policy

This document is the project security-policy placeholder. Add project-specific security requirements here.

## Baseline

- Never trust client-controlled input.
- Validate external input server-side.
- Enforce authentication and authorization at each relevant server entry path.
- Protect sensitive data with appropriate database/data-layer controls.
- Do not expose secrets, stack traces, or unnecessary internal details to clients.
- Do not log passwords, tokens, secrets, or unnecessary personal information.
