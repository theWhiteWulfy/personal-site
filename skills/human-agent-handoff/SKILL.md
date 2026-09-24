---
name: human-agent-handoff
description: >-
  Runbook for designing, structuring, and maintaining asynchronous human-agent
  milestone backlogs and HUMAN_TASKS.md documents with zero-restart continuity.
---

# Human-Agent Milestone Handoff Runbook

Use this skill when organizing multi-phase projects into milestone backlogs and human-agent handoff documents.

## Directory Structure Pattern
Organize project backlogs under `docs/backlog/`:
```text
docs/backlog/
├── README.md                          # Milestone overview & branch mapping
├── HUMAN_TASKS.md                     # Single source of truth for handoffs
├── audits/                            # Baseline audit reports
├── decisions/                         # Architecture Decision Records (ADRs)
└── tasks/
    ├── milestone-1-<name>.md          # Atomic sub-tasks for milestone 1
    └── milestone-2-<name>.md          # Atomic sub-tasks for milestone 2
```

## Mandatory `HUMAN_TASKS.md` Anatomy
Every milestone block in `HUMAN_TASKS.md` must follow this structure:

1. **Header & Context**:
   - Milestone name, branch name, and priority.
   - **Dependency banner**: Specify if the agent must complete prior tasks first or if the human blocks the agent.

2. **Task Sections**:
   - `TASK-<N><Letter> — <Title>` with status `PENDING 🔲` or `DONE ✅`.
   - Clear description and exact CLI commands needed (e.g. `wrangler secret put`).
   - `Yes / No` completion table.
   - Dedicated placeholders (`____` or designated code blocks) for values.
   - Generous spacing (`&nbsp;`) between sections.

3. **Resume Prompt Box**:
   - Exact copy-paste prompt formatted in a blockquote for the user:
     `> "Continue milestone <N> — task <X> and task <Y> are resolved"`

4. **Agent State Tracker Table**:
   - Placed at the bottom of `HUMAN_TASKS.md` to persist session progress:
     | Field | Value |
     |---|---|
     | **Last active milestone** | Milestone N |
     | **Last completed sub-task** | Sub-task N.M |
     | **Branch name** | `<branch>` |
     | **Last git commit hash** | `<hash>` |
     | **Stopped reason** | Waiting for TASK-X |
     | **Next action when resumed** | `<action>` |
