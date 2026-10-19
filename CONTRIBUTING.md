# Contributing to Exameow

## How to Contribute

1. **Fork** the repository and create a branch from `main`.
2. Make your changes. Please follow the existing code style and conventions (see `AGENTS.md` for architecture notes).
3. Before submitting, verify your changes:
   - Frontend: `cd frontend && pnpm run type-check`
   - Workers: `cd workers && pnpm typecheck`
   - Rust: `cargo build`
4. Keep commits focused; use concise conventional-style messages (e.g. `fix(practice): ...`, `docs: ...`).
5. Open a **Pull Request** against `main` and describe what your change does and why.
6. If you change generation prompts, file parsing, or export formats, remember the Rust (`packages/core`) and TypeScript (`workers/src`) implementations must stay in sync.

## Contributor License Agreement

By submitting a pull request, opening an issue with a proposed contribution, or otherwise contributing to this project, you indicate your acceptance of the [Contributor License Agreement](CLA.md).
