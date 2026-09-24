# Human-Agent Milestone Handoff SOP

Use this guide for designing, structuring, and maintaining asynchronous human-agent milestone backlogs and `HUMAN_TASKS.md` documents with zero-restart continuity.

> **Related Agent Skill**: See [.agents/skills/human-agent-handoff/SKILL.md](../.agents/skills/human-agent-handoff/SKILL.md) for agent runbook and slash command details.

## Scope

- Milestone planning and task breakdowns under `docs/backlog/`.
- Creating and updating `docs/backlog/HUMAN_TASKS.md` for human-blocking dependencies (API secrets, tokens, third-party accounts, manual verifications).
- Maintaining the agent state tracker table across pause and resume cycles.

## Directory Structure Invariant

Organize project backlogs strictly under `docs/backlog/`:
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
   - **Dependency banner**: Explicitly annotate if the agent must complete prior tasks first or if human action blocks the agent.

2. **Task Sections**:
   - `TASK-<N><Letter> — <Title>` with status `PENDING 🔲` or `DONE ✅`.
   - Clear description and exact CLI commands needed (e.g. `wrangler secret put`).
   - Quick-scan `Yes / No` completion table.
   - Dedicated placeholders (`____` or designated code blocks) for every required secret, key, or path.
   - Generous vertical spacing (`&nbsp;` or double blank lines) between tasks for readability.

3. **Resume Prompt Box**:
   - Exact copy-paste prompt formatted in a blockquote for the user:
     `> "Continue milestone <N> — task <X> and task <Y> are resolved"`

4. **Agent State Tracker Table**:
   - Maintained at the bottom of `HUMAN_TASKS.md` recording:
     | Field | Value |
     |---|---|
     | **Last active milestone** | Milestone N |
     | **Last completed sub-task** | Sub-task N.M |
     | **Branch name** | `<branch>` |
     | **Last git commit hash** | `<hash>` |
     | **Stopped reason** | Waiting for TASK-X |
     | **Next action when resumed** | `<action>` |

## Required Practices

- Always update the Agent State Tracker before stopping to wait for human action.
- Ensure every secret or path has a visible `____` placeholder.
- Provide direct copy-pasteable resume prompts to ensure seamless agent wakeup.

## Out Of Scope

- Do not commit secrets, tokens, or credentials into `HUMAN_TASKS.md`.
- Do not remove past milestone records from `HUMAN_TASKS.md`; mark them `DONE ✅` to preserve audit history.
