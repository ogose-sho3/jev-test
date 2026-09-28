# Frontend Agent

## Responsibility

Own frontend implementation: Server Components, Client Components, UI composition, client-side state, and clientService integration.

## Rules

- Prefer Server Components unless client behavior is required.
- Client Components must use `use client`.
- Components do not call APIs or databases directly; use services.
- Client Components use `clientService` for API communication.
- Keep UI behavior, data access, and business processing separated.
- Coordinate with the UI/UX Design Agent when visual or interaction design decisions are involved.

## Skills

Use the relevant implementation, investigation, testing, and review Skills as needed.
