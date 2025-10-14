# General Guidelines

## What This Document Is

This document defines cross-project standards and guidelines that apply to all development work. All agents working on any project must follow these rules strictly. These guidelines ensure consistency, maintainability, and quality across all projects.

---

## How to Use This Document

**All agents must follow these rules strictly:**

1. Read this document completely before starting any work on the project.
2. Apply these guidelines to all code you write unless explicitly instructed otherwise.
3. When project-specific instructions conflict with these guidelines, project-specific instructions take priority.
4. If you are unsure about a guideline, ask for clarification before proceeding.
5. Treat these guidelines as mandatory requirements, not suggestions.

### Working with Existing Projects

**When working on pre-existing projects with established codebases:**

- **Prioritize the current project structure and implementation methods.**
- Adapt these guidelines to fit the existing project patterns.
- Do not refactor or restructure existing code to comply with these guidelines unless explicitly requested.
- Maintain consistency with the existing codebase over strict guideline compliance.
- Follow the established naming conventions, file organization, and coding patterns already in use.
- Make minimal changes that integrate seamlessly with existing implementations.
- Do not break or replace working implementations just because they differ from these guidelines.
- When adding new features, match the style and structure of existing code.
- Preserve backward compatibility and existing functionality at all costs.

**The goal is to enhance existing projects, not to rebuild them according to these guidelines.**

---

## How to Write Instruction Documents

**When creating or updating instruction documents, follow these principles:**

### Writing Style

- Use clear, simple, and concise sentences.
- Avoid ambiguity. Be specific and explicit.
- Write in active voice, not passive voice.
- Use imperative mood for instructions (e.g., "Create a file" not "A file should be created").
- The instructions are used for AI agents to understand and implement features. Therfore, it should be written in an AI focused manner, not human focused.

### Structure

- Start with a clear statement of what the document is.
- Organize content hierarchically with clear headings.
- Group related information together.
- Use numbered lists for sequential steps.
- Use bulleted lists for non-sequential items.

### Content Guidelines

- State requirements as rules, not suggestions.
- Include examples when clarification is needed.
- Explain the "why" when the reasoning is not obvious.
- Keep each section focused on one topic.
- Remove redundant information.

### Maintenance

- Update documents immediately when standards change.
- Remove outdated information promptly.

**Files:**

- Use clear, descriptive file names.
- Match file name to the main export (e.g., `UserProfile.jsx` exports `UserProfile`).
- Use consistent naming convention within the project.
- Group related files together in directories.
- Keep one primary component or module per file.

**CRITICAL: Prohibited Action when writing documents:**

- Writing ANY documentation files (.md) should always be done after confirmation from the user.
- This includes: instruction files, summary files, progress tracking files, reports, and any other documentation.
- Do not write directly to documentation files. Instead, provide an explanation about how the file will be written and write after the user confirms.
- Only create/update documentation files when the user explicitly confirms.

---

## Project Management

### Instructions Folder Structure

**All projects use a standardized instruction hierarchy:**

```
Instructions/
├── Guidelines/          # Cross-project standards and guidelines
├── Outline/            # High-level feature descriptions (WHAT)
├── Plan/               # Detailed feature approaches (HOW)
├── Implementation/     # Code-level implementation details (CODE)
└── Summary/
    ├── General/        # Project structure and purpose
    └── Tracker/        # Feature implementation progress
```

### How to Use Instructions

**Document Hierarchy:**

1. **Guidelines** - Read GeneralGuideline.md first. Apply these rules to all work.
2. **Outline** - Understand what features need to be implemented (semantic level).
3. **Plan** - Understand how features should be approached (functional level).
4. **Implementation** - Follow technical specifications for coding (methodological level).
5. **Summary** - Check General for project context, Tracker for current status.

**General rules when adding features:**

- Start by reading the Outline document to understand the feature's purpose.
- Read the Plan document to understand the approach.
- Read the Implementation document for specific technical requirements.
- Follow the three-level hierarchy strictly.
- Use consistent feature naming across all three documents.
- Each document should be complete and stand-alone within its level.
- Write in clear, imperative language following the "How to Write Instruction Documents" section.

**Document progression:**

1. Write Outline first (define WHAT).
2. Write Plan after Outline is approved (define HOW).
3. Write Implementation after Plan is approved (define CODE).
4. All three must be finalized before code writing begins.

---

## Agent Action Restrictions

### Code Writing Restrictions

**CRITICAL: Do not write any code until explicitly authorized by the user.**

**Prerequisites before writing any code:**

1. **Implementation guidelines must be finalized:**

   - The Implementation document must be complete and reviewed.
   - All implementation details must be documented.
   - Do not write code if the Implementation document is incomplete or being drafted.

2. **User authorization must be explicit:**
   - Wait for the user to explicitly say "Start writing the code" or equivalent clear instruction.
   - Do not write code after only reading instructions.
   - Do not write code after only planning or discussing the approach.
   - Do not write code preemptively or proactively.
   - When in doubt, ask the user: "Should I start writing the code now?"

**Unauthorized code writing is strictly prohibited.**

### Environment Restrictions

**Work only in the local project environment unless explicitly ordered otherwise.**

- Do not deploy to cloud services (AWS, Azure, GCP, etc.).
- Do not push to remote git repositories.
- Do not publish packages to npm, PyPI, or other registries.
- Do not create or modify cloud resources.
- Do not modify production environments.
- Do not make any external API calls for deployment purposes.
- Do not configure CI/CD pipelines without permission.
- Do not modify DNS, domain settings, or hosting configurations.

**If deployment is needed:**

- Ask the user explicitly: "You want me to deploy this to [service]?"
- Wait for clear confirmation before proceeding.
- Confirm the target environment (staging, production, etc.).

## Prohibited Actions

- Never write code without explicit user authorization.
- Never create documentation files (.md) without explicit user confirmation.
- Never deploy to cloud or remote services without permission.
- Never modify production systems.
- Never delete files or directories without confirmation.
- Never make irreversible changes without warning.
- Never commit and push to remote repositories without permission.
- Never expose sensitive information (API keys, passwords, tokens).
- Never bypass security measures or authentication.

## Notes

- These guidelines apply to all projects unless explicitly overridden by project-specific instructions
- When guidelines conflict, defer to project-specific documentation
- Update this document when establishing new cross-project patterns
