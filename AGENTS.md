# AI Development Rules

This file is the entry point for AI-assisted development in this project.

## Canonical sources

- `AGENTS.md`: common AI rules, workflow, and navigation
- `docs/architecture.md`: system-wide architecture when present
- `docs/features/`: current feature behavior, business rules, constraints, and decisions
- `docs/security.md`: security policy
- `docs/decisions/`: important architectural/product decisions (ADR)
- Code: implementation details
- Git: change history

Do not duplicate canonical information unnecessarily. When a relevant canonical document exists, use it instead of inferring from conversation history.

## Development start protocol

For every response/task:

1. Confirm the requirements and relevant specification.
2. Identify unknowns and constraints.
3. Inspect relevant existing design, code, and canonical documentation.
4. Decide unspecified implementation details autonomously within the established rules.
5. Implement the change.
6. Run appropriate tests.
7. Perform the fixed quality self-check below.
8. If an issue is found, fix it and repeat the relevant checks.
9. Update documentation/specification when the functional design or important decision changed.
10. Review the final diff and complete the response/task.
11. Create one Git commit for the completed response/task.

Do not assume implementation succeeds on the first attempt.

## Architecture rules

- Next.js App Router + TypeScript is the baseline.
- Server Components are the default unless a concrete client-side requirement exists.
- Client Components must explicitly use `use client`.
- UI components handle presentation, interaction, and UI state; they do not directly access databases or APIs.
- Server Components use `serverService` for server-side processing.
- Client Components use `clientService`, which communicates with APIs.
- `clientService` and `serverService` are separate entry points, not sequential layers.
- `serverService` is not a database infrastructure layer.
- Repository/DAL layers are introduced only when their responsibilities justify them.
- Keep server-only modules out of the client graph; use `server-only` where appropriate.
- Do not use runtime environment detection to switch between client/server service paths.

## API rules

- Treat all externally received values as untrusted.
- Validate request body, query, params, headers, cookies, and other relevant inputs on the server.
- Enforce authentication/authorization appropriate to the API boundary.
- API routes are HTTP boundaries; keep business logic in appropriate services.
- Return errors using RFC 9457 Problem Details for HTTP APIs.
- Never represent a dependency or processing failure as success.
- Do not expose stack traces, internal errors, secrets, or unnecessary implementation details to users.

## Security and data rules

- Server-side validation is the security boundary; client validation is not.
- Server Component entry paths must enforce the authentication/authorization rules appropriate to their use case.
- Database-level access controls should provide an independent data-level safety boundary where applicable.
- Never log passwords, tokens, secrets, or unnecessary personal information.
- Important data invariants must not be silently invented when they materially affect business meaning.

## External services

Handle external service success and failure explicitly. Use timeout, retry, fallback, caching, and similar mechanisms only when justified by the external contract, idempotency, data integrity, and user impact. Do not guess unknown external behavior.

## Logging and operations

- Do not swallow application errors.
- Logs must contain enough context to investigate important failures.
- Avoid noisy logs and alerts.
- Production application logs should remain server-side by default; do not leave secrets or internal diagnostics in browser logs.

## Testing and quality self-check

Keep tests with the project. AI chooses appropriate test types and granularity.

Before completion, check at minimum:

- No raw system errors, stack traces, database details, or external-service internals are shown to users.
- Unrelated data loading does not unnecessarily block initial display.
- Protected UI/data never appears before authentication/authorization passes.
- Stale, previous-user, or another-user data does not flash even temporarily.
- The UI has minimum responsive behavior.
- Loading, empty, and error states do not break the UI.

## Git rules

- Use Git Flow.
- Treat the response/task as the unit of change.
- Do not commit after every implementation step.
- Human corrections during the same response/task remain part of the same change.
- Inspect `git status` and `git diff` during work.
- Before committing, verify unrelated changes are not included.
- Create one commit when the response/task is complete.
- Never rewrite history, force-push, or perform other destructive Git operations without human confirmation.

## Documentation rules

Feature-level specifications belong in `docs/features/`.

Update documentation when implementation changes the current functional behavior, business rules, constraints, security policy, or important design decisions. Pure implementation-detail refactors do not require feature-spec updates.

## Autonomy and human confirmation

AI should decide normal implementation details without unnecessary confirmation.

Ask for human confirmation when a change would:

- break compatibility with existing data,
- perform an irreversible data change,
- materially change an existing specification or important design policy,
- change architectural responsibilities or boundaries, or
- require an important decision that cannot be made from the available requirements/specification.

Do not ask for confirmation merely for normal file organization, service splitting, refactoring, test selection, or implementation details.

## Agents and Skills

Use the role-specific Agent for the relevant area and invoke the appropriate Skill for repeatable work procedures.

Agents:
- `agents/frontend/`
- `agents/backend/`
- `agents/ui-ux-design/`

Skills:
- `skills/implement-feature/`
- `skills/implement-ui/`
- `skills/implement-api/`
- `skills/database-change/`
- `skills/architecture-change/`
- `skills/update-documentation/`
- `skills/review/`

Investigation is a Skill concern, not a dedicated Research Agent concern.
