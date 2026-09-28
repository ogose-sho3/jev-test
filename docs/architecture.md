# Architecture

This document is the system-wide architecture placeholder. Fill it in when the project's requirements make system-level architecture decisions necessary.

## Baseline

- Next.js App Router + TypeScript.
- Server Components are the default.
- Server Component -> serverService -> data sources.
- Client Component -> clientService -> API -> data sources.
- Client and server service entry points are separate.
- UI does not directly access APIs or databases.
- Repository/DAL is optional and responsibility-driven.
