# Contribution Guidelines

Thank you for contributing to UniLoot! This repository follows a lightweight process to keep project status clear and up-to-date.

## How to contribute

1. Fork the repository (or branch from main if you have write access).
2. Create a descriptive branch for your work (e.g. `feature/browse-page`, `fix/db-connection`).
3. Make your changes and run the app locally (see `README.md` for setup). Add tests if applicable.
4. Update documentation where relevant.

## Project Status Tracking (IMPORTANT)

We use `PROJECT_STATUS.md` as the canonical human-readable snapshot of the repository health and major changes. To keep the project status accurate for all contributors, please follow these rules:

- Every time you merge or push a change that affects configuration, scripts, runtime behavior, CI, or major features (for example: adding routes, changing server scripts, updating TypeScript config, adding/removing hooks, etc.), update `PROJECT_STATUS.md` with:
  - A one-line summary of the change (who, when, what)
  - Any local run/start instructions that changed
  - New dependencies added or removed
  - Any manual steps required for running the app (for example, set `MONGO_URI` in `backend/.env`)

- Keep the **Last updated** line current with the date and include the commit hash or PR reference if possible.

- Use clear headings and the same top-level structure as the existing `PROJECT_STATUS.md` so the file remains easy to scan (Summary → Changes → Health checks → Next steps).

## Commit message style

We recommend conventional commits. A good commit message format is:

```
<type>(<scope>): <short summary>

<body> (optional)

<footer> (optional)
```

Examples:
```
feat(ui): add product card component
fix(backend): guard mongoose connect when MONGO_URI missing
chore(dev): update dev script to src/server.ts
```

If you are unable to use commit hooks locally, explain why in the PR description and we can address the hook configuration centrally.

## Making a Pull Request

- Open a PR against `main` with a descriptive title and summary of changes.
- Link any related issues.
- In the PR description, include any manual steps required to run/test the change (for reviewers).
- Update `PROJECT_STATUS.md` in the same PR if the change affects project state.

## Questions

If you're unsure whether a change requires a `PROJECT_STATUS.md` update, please add it — better to be explicit. If you have questions, open an issue and tag a maintainer.

Thanks for improving UniLoot — your contributions make the project better!

## Keep your branch up-to-date with `main`

To avoid merge conflicts and keep development smooth, please regularly sync your feature branches with `main` while you work. Recommended cadence:

- Pull from `main` at least once a day for long-lived branches.
- Pull before opening a PR or immediately before merging.

Suggested workflow (from your feature branch):

```powershell
# fetch latest
git fetch origin

# update your local main branch
git checkout main
git pull origin main

# switch back to your feature branch and rebase or merge
git checkout feature/your-branch
# Option A: rebase (clean history)
git rebase main
# OR Option B: merge (preserve history)
git merge main
```

If you frequently encounter conflicts or diverging histories, consider creating smaller PRs or rebasing frequently to keep your work current.