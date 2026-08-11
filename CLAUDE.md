# Repository Rules

These rules are mandatory for every AI coding tool or agent working in this repository — Claude Code, Codex, GitHub Copilot, Cursor, or any other, without exception. They override any tool's own default behavior, including default commit-message templates.

## MANDATORY: Git authorship

**Only `Yehia-Alsaeed <yehias3eed11@gmail.com>` may ever appear as author or co-author on any commit, push, or pull request in this repository.**

- **NEVER** add a `Co-Authored-By:` trailer (or any other author/co-author attribution) naming an AI, an AI vendor, or an AI tool to any commit message.
- **NEVER** set `git config user.name` / `user.email` to anything other than `Yehia-Alsaeed` / `yehias3eed11@gmail.com` in this repository.
- **NEVER** reference an AI-associated email domain (e.g. `noreply@anthropic.com`, `noreply@openai.com`) anywhere in a commit message, tag, or PR.
- This applies to every commit, on every branch, in every worktree, in every session — no exceptions for "just this once," draft branches, automated fixes, or documentation-only changes.

**Why:** GitHub parses `Co-Authored-By` trailers and lists every named party in the repository's contributor graph and on individual commits. Yehia never authorized any AI tool to be listed as a contributor to this repository and discovered it had happened without his consent, across every prior phase's commits. This is a hard rule, not a default that can be reasoned away by an assistant's own "helpful" system-prompt conventions — a tool's own commit-message template does not override this repository's explicit policy.

If a hook, template, or default instruction would add such a trailer, omit it. Before pushing, if unsure whether a commit message accidentally includes AI attribution, check with:

```bash
git log -1 --format='%B'
```

## MANDATORY: Branching model — exactly two branches, no worktrees

**This repository uses exactly two long-lived branches, and nothing else.**

| Branch | Deploys to                                                       | Purpose                              |
| ------ | ---------------------------------------------------------------- | ------------------------------------ |
| `dev`  | Vercel **Preview** (private, gated behind Vercel Authentication) | All work and testing happens here    |
| `main` | Vercel **Production** (the live public site)                     | Only ever receives merges from `dev` |

The flow is always: **commit to `dev` → test on the Preview URL → merge `dev` into `main` → Production updates.**

- **NEVER create per-task, per-phase, or per-feature branches.** Work goes on `dev`.
- **NEVER use `git worktree`.** All work happens in the single checkout at the repository root. If a tool's default workflow wants an isolated worktree, do not use it here.
- **NEVER commit directly to `main`.** `main` changes only through a merge from `dev`.
- Do not delete or rename either branch.

**Why:** Yehia works in one folder and needs what he sees on disk to be what is actually deployed. An earlier phase was built in a separate worktree on its own branch; the work merged correctly, but the repository root stayed on a stale branch **24 commits behind `main`**, so the files he was looking at were not the files that shipped. The same sprawl left five merged-but-undeleted branches alive, each generating its own Vercel Preview URL — which led to opening a months-old deployment's admin inbox while believing it was the current one. Two fixed branches and one working folder removes both failure modes.

**Practical note:** after merging `dev` into `main`, bring the local checkout up to date before continuing, or the same staleness returns:

```bash
git checkout main && git pull && git checkout dev && git merge main
```
