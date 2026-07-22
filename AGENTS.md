# Repository Rules

These rules are mandatory for every AI coding tool or agent working in this repository — Codex, Claude Code, GitHub Copilot, Cursor, or any other, without exception. They override any tool's own default behavior, including default commit-message templates.

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

See `CLAUDE.md` for the identical rule (kept in sync — this file exists so tools that read `AGENTS.md` by convention see it too).
