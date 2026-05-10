# Documentation Index

Use these docs as the agent-facing source of truth while building this repo.

## Core Agent Docs

- `../AGENTS.md`: repo-wide agent workflow, safety rules, commands, and source-of-truth files.
- `../MCP_SERVER.md`: current local action server, endpoint examples, action names, and planned MCP adapter.
- `CLI.md`: direct command surface for agents and local PowerShell scripts.
- `../.agents/skills/lego-mindstorms-mcp/SKILL.md`: local skill for agents that support skill loading.
- `HUMAN_IN_THE_LOOP_BUILDER.md`: supervised builder/debug session workflow for agents and users.
- `KID_SAFE_DEBUGGING.md`: safety defaults and symptom checklist for child/user-facing debugging.

## Build Area Docs

- `ADAPTERS.md`: hardware adapter contract and per-family implementation notes.
- `ANDROID_APP.md`: Android app architecture, screens, transport interface, and data flow.
- `ANDROID_BUILDER_DESIGN.md`: current Android screen design for builder sessions and tests.
- `ANDROID_STUDIO_PROJECT.md`: Android project location conventions and environment variables.
- `OFFICIAL_LEGO_CLIENT.md`: how agents should use the official LEGO client as a status/handoff bridge.
- `DATA_AND_MODELS.md`: probe data, labels, model strategy, Edge Impulse path, and ExecuTorch path.
- `CODE_GENERATION.md`: generated-code targets, required safety blocks, and build delegation.
- `COMPATIBILITY_AND_LICENSING.md`: what the project is/is not, Pybricks/LEGO boundaries, and compatibility rules.
- `COMMUNITY_NETWORK.md`: profile bundles, trust model, licensing, and matching flow.
- `ROADMAP.md`: milestone order and acceptance criteria.

## Recommended Reading By Task

Adapter or hardware work:

1. `../AGENTS.md`
2. `ADAPTERS.md`
3. `DATA_AND_MODELS.md`

Android app work:

1. `../AGENTS.md`
2. `ANDROID_APP.md`
3. `ANDROID_BUILDER_DESIGN.md`
4. `DATA_AND_MODELS.md`

Classifier, dataset, or deployment work:

1. `../AGENTS.md`
2. `DATA_AND_MODELS.md`
3. `../MCP_SERVER.md`

Generated robot code:

1. `../AGENTS.md`
2. `HUMAN_IN_THE_LOOP_BUILDER.md`
3. `CODE_GENERATION.md`
4. `ADAPTERS.md`

Kid/user builder sessions:

1. `../AGENTS.md`
2. `CLI.md`
3. `HUMAN_IN_THE_LOOP_BUILDER.md`
4. `KID_SAFE_DEBUGGING.md`
5. `../MCP_SERVER.md`

Community/network features:

1. `../AGENTS.md`
2. `COMMUNITY_NETWORK.md`
3. `DATA_AND_MODELS.md`
