# CalendarHero

Standalone calendar app — Functionality Block #1: local workspace isolation.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Block #1 — Local Workspace Isolation

`src/LocalWorkspaceIsolation.tsx` manages:

- **workspaces** — `{ id, name, joinCode }[]`
- **activeWorkspaceId** — currently selected workspace
- **events** — `{ id, workspaceId, title, date }[]` (every event is scoped to a workspace)

Create workspaces, switch between them, add events to the active workspace, and verify the event list filters by `activeWorkspaceId`.
