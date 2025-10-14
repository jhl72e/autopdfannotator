# Code General Guidelines

---

## What This Document Is

This document defines general code guidelines that apply across all programming languages and technology stacks. These guidelines complement the GeneralGuideline.md by providing language-agnostic coding standards and best practices.

**This document applies to:** All programming languages, frameworks, and technology stacks unless overridden by language-specific guidelines.

---

## For Existing Projects

- **CRITICAL: Prioritize pre-existing implementations and code structures.**
- Match the existing code style, patterns, and conventions exactly.
- Extend or modify existing files rather than creating parallel implementations.
- Use existing utility functions, helpers, and services wherever possible.
- Follow the project's established file organization and naming patterns.
- Do not replace or rewrite existing working code to match these guidelines.
- Ensure maximum compatibility with existing implementations.
- Make the minimum modifications necessary to integrate the new feature.
- Test that existing functionality continues to work after changes.
- **The system should enhance, not replace, existing implementations.**

## Universal Coding Principles

### Code Readability

- Write code that is easy to read and understand.
- Use consistent formatting throughout the codebase.
- Apply proper indentation and spacing consistently.
- Remove all unused code, variables, and imports.
- Keep functions and methods small and focused.
- Make code structure clear and predictable.

### Naming Principles

- Use descriptive, meaningful names that explain purpose.
- Choose names that reveal intent without requiring comments.
- Be consistent with naming patterns across the project.
- Avoid abbreviations unless they are widely understood.

### Code Organization

- Group related code together.
- Separate different concerns into distinct modules or files.
- Keep one primary responsibility per file or module.
- Place shared or common code in clearly identified locations.
- Maintain reasonable file sizes for easy navigation.
- Follow a consistent directory structure.

### Comments and Documentation

- Write self-documenting code first; comment only when necessary.
- Explain "why" decisions were made, not "what" the code does.
- Document complex algorithms, business logic, and edge cases.
- Keep comments synchronized with code changes.
- Remove outdated or misleading comments immediately.
- Use appropriate documentation tools for the language and project.

### Code Quality Principles

- Write modular, reusable code components.
- Avoid hardcoding values; use configuration or constants.
- Handle errors explicitly; never fail silently.
- Consider edge cases and error scenarios.
- Maintain consistency with existing codebase patterns.
- Prioritize simplicity over cleverness.

### Minimalist Implementation

- Make the minimum modifications necessary to achieve the goal.
- Do not modify code that is not directly related to the task.
- Do not over-engineer solutions.
- Keep changes focused and contained.

### Compatibility and Stability

- Ensure maximum compatibility with existing code.
- Do not break existing functionality when adding new features.
- Follow established patterns and conventions in the codebase.
- Avoid introducing breaking changes unless absolutely necessary.
- Maintain backward compatibility when possible.

---

- Naming conventions
- Component patterns
- Code style preferences
- Common snippets/boilerplate

## Notes

- These guidelines apply across all programming languages
- Language-specific guidelines take priority for implementation details

---
