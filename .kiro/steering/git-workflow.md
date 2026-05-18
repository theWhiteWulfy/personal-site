# Git Workflow Constraints

These rules govern how task lists are executed against the Git repository. They apply whenever a spec's `tasks.md` is being implemented (or any equivalent multi-milestone task list).

## Branching Strategy

- Execute the task list in **sequential blocks (milestones)**. One milestone = one branch.
- At the **start of every milestone**, explicitly create and switch to a **brand new Git branch**.
- The base for the new branch is determined as follows:
  - **Independent task** → derive the branch from the current base branch (HEAD of `main`/`master`, or whatever the repo's default base is).
  - **Task that builds on previous work** → derive the branch from the branch of the previous (dependent) task, not from the base branch.
- Each task in the task list has its own branch. **Never combine multiple milestones into a single branch.**

### Branch Naming

Use the pattern: `task/<task-number>-<short-kebab-name>`

Examples:
- `task/1-setup-content-collection`
- `task/2.1-add-zod-schema`
- `task/3-api-endpoint`

## Commit Workflow

Once a milestone's code changes are validated (build passes, tests pass where applicable):

1. Stage all changes:
   ```cmd
   git add .
   ```
2. Commit using the exact format below:
   ```cmd
   git commit -m "[Task Number] TASK name"
   ```
   Where:
   - `Task Number` is the task identifier from `tasks.md` (e.g., `1`, `2.1`, `3.4`)
   - `TASK name` is the task title as written in `tasks.md`

   Example:
   ```cmd
   git commit -m "[2.1] Add Zod schema for offers collection"
   ```

## Continuation Behavior

- **Do NOT pause and ask the user for verification** after a milestone commit.
- Immediately switch to (or create) the branch for the next task and continue execution.
- Stop only when:
  - The full task list is complete, or
  - A build/test failure blocks progress, or
  - A task is explicitly marked as requiring user input.

## Deriving the Correct Base Branch

Before creating each task branch, determine its base:

| Scenario | Base branch |
|---|---|
| First task in the list | Repo default (e.g., `main`) |
| Task with no dependency on prior tasks | Repo default (e.g., `main`) |
| Task that builds on a previous task's output | The previous task's branch |
| Task explicitly listing a dependency in `tasks.md` | The branch of the listed dependency |

When in doubt, prefer deriving from the previous task's branch if the file/code surface overlaps.

## Quick Command Reference (cmd shell)

```cmd
:: Start a new milestone (independent task)
git checkout main
git pull
git checkout -b task/<n>-<name>

:: Start a new milestone (depends on previous task)
git checkout task/<previous-n>-<previous-name>
git checkout -b task/<n>-<name>

:: After validating the milestone
git add .
git commit -m "[<n>] <Task name>"

:: Move on to the next milestone immediately — do not wait for user
```

## Non-Negotiables

- Never commit directly to `main` (or the repo's default base branch) during task execution.
- Never amend or force-push during task execution unless the user explicitly asks.
- Never skip the per-task branch even for trivial tasks.
- Never wait for user verification between consecutive milestones.
