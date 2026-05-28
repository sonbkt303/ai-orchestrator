---
description: "Use when implementing or refactoring AI orchestration, streaming APIs, SSE handlers, prompt/context construction, and AI gateway integrations in this repository. Enforces controller-service boundaries and streaming safety checks."
name: "AI Orchestrator Architecture"
applyTo: "**/*.{ts,js}"
---
# AI Orchestrator PoC Instructions

## Project Goal

This project is an AI orchestration PoC used to explore:

- AI streaming
- SSE architecture
- AI gateway integration
- Conversation flow
- Prompt orchestration
- Context injection

The goal is to understand AI backend architecture before migrating to NestJS.

## Architecture Principles

- Keep controllers thin.
- Put orchestration logic inside services.
- Separate responsibilities clearly:
  - Prompt building
  - Context building
  - Gateway communication
  - Streaming logic
- Never call AI providers directly from controllers.

## Streaming Rules

This project is streaming-first.

Prefer:

- SSE
- async/await
- Incremental response streaming

Always handle:

- Client disconnect
- Timeout
- Stream cleanup

## Folder Responsibilities

- controllers: HTTP/SSE handling
- services: Business orchestration
- gateway: AI gateway communication
- prompts: System prompts/templates

## Coding Guidelines

Prefer:

- Modular structure
- Readable code
- Small services
- Explicit naming

Avoid:

- Business logic in controllers
- Hardcoded prompts
- Over-engineering
- Premature abstractions

## Future Direction

This PoC may later evolve into:

- NestJS architecture
- RAG
- File processing
- AI tools/workflows
- Async workers
