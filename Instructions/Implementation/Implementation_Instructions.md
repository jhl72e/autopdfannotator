# Implementation Document Instructions

---

## What This Document Is

This document provides instructions for writing Implementation documents. Implementation documents describe the CODE-level implementation at a technical and methodological level.

---

## Purpose

Describe the CODE-level implementation at a technical and methodological level.

---

## File Naming

`[Outline name]_[Plan Name]_[FeatureName]_Implementation.md`

**Example:** `SystemPipeline_Refactoring_Step1_Implementation.md` when Outline file name is "Outline_SystemPipeline.md", Plan name is "Plan_Refactoring.md"

---

## Content Guidelines

- Specify exact technical implementation details.
- Define file structure and naming conventions for this feature.
- Specify function signatures, data structures, and interfaces.
- Provide code patterns and examples for this feature.
- Define import statements, dependencies, and configurations.
- Include specific technical requirements (validation, error handling, etc.).
- Be detailed enough that any agent produces identical code structure.
- This is the most detailed level of specification.

---

## Coding Standards for Implementation Level

**For general coding standards, refer to:** `Instructions/Guidelines/CodeGuide/Code_GeneralGuideline.md`

**Implementation-specific standards:**

### Implementation Specification Requirements

**When writing Implementation documents, be highly specific about:**

- Exact function signatures and parameters with types.
- Precise data structures and their properties.
- Exact import statements and dependencies.
- Specific configuration values and environment variables.
- Detailed validation requirements and rules.
- Explicit error handling approaches and messages.
- Exact return values and types.
- Specific state management patterns to use.

### Technical Detail Level

**Implementation documents must specify:**

- Exact file paths for new or modified files.
- Specific file names for all new files.
- Precise naming patterns for the project (e.g., camelCase, PascalCase).
- Exact code patterns and examples to follow.
- Specific utility functions or helpers to use or create.
- Exact styling approach and class/style naming conventions.
- Specific testing requirements for the feature.

### Code Examples and Patterns

**Provide in Implementation documents:**

- Code snippets showing the exact pattern to follow.
- Example function signatures with parameter names and types.
- Sample data structure definitions.
- Example error handling patterns.
- Template code that agents should adapt for the feature.

### Reuse and Integration

**Always specify:**

- Which existing code to reuse (exact file paths and function names).
- How to extend existing components or modules.
- Which existing patterns to follow exactly.
- Where to integrate the new code within existing files.

---

## Writing a summary about updated information after finishing implementing

**After finishing the implementation, a summary about the implementation should be written to the Summary folder:**
**Do not generate a summary file before user confirmation. :**

- A summary about the implementations made in the current step should be summarized.
- The summary file naming should be `[Outline name]_[Plan Name]_[FeatureName]_Summary.md`

**Always specify:**

- What the current step was under the big picture of outline_plan_implementation flow
- What modifications were made
- All deletes, adds, and changes made to the project

---

## Notes

- Mark document as "DRAFT" in the title if not finalized.
- Remove "DRAFT" marker when finalized and approved.
- Write in clear, imperative language following GeneralGuideline.md writing standards.
- This document should be written after the Plan is approved.
- All three documents (Outline, Plan, Implementation) must be finalized before code writing begins.

---
