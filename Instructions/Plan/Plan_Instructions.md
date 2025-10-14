# Plan Document Instructions

---

## What This Document Is

This document provides instructions for writing Plan documents. Plan documents describe HOW a feature should be approached at a functional level.

---

## Purpose

Describe HOW the feature should be approached at a functional level.

---

## File Naming

`Plan_[Outline name]_[Plan name].md`

**Example:** `Plan_SystemPipeline_Refactor.md` when Outline file name is Outine_SystemPipeline.md

---

## Content Guidelines

- Explain the functional approach to implementing the feature.
- Break down the feature into logical steps or components.
- Describe data flow and interactions between parts.
- Explain architectural decisions and patterns to use.
- Provide enough detail for consistent implementation.
- Do not include specific code syntax or file-level details.
- Focus on the functional design and approach.

---

## For Existing Projects

- Prioritize working with existing architectural patterns and structures.
- Adapt the approach to fit the current project's architecture.
- Identify existing modules, services, or components to leverage or extend.
- Do not propose complete rewrites of existing functional areas.
- Design the plan to minimize disruption to existing functionality.
- Ensure the approach maintains backward compatibility.

---

## Coding Standards for Plan Level

**For general coding standards, refer to:** `Instructions/Guidelines/CodeGuide/Code_GeneralGuideline.md`

**Plan-specific standards:**

### Modular Design

When planning feature implementation:

- Design modular, reusable components and functions.
- Plan for separation of concerns (business logic, UI, data handling).
- Avoid planning monolithic or tightly coupled solutions.
- Design components that can be tested independently.

### Functional Structure Planning

- Plan clear directory and file structure for the feature.
- Identify which files need to be created or modified.
- Plan for one primary responsibility per module or component.
- Specify where shared/common code should be placed.

### Data Flow and Dependencies

- Clearly define how data flows through the system.
- Identify dependencies between components.
- Plan for proper state management.
- Avoid unnecessary coupling between modules.
- Design clear interfaces between components.

---

## Notes

- Mark document as "DRAFT" in the title if not finalized.
- Remove "DRAFT" marker when finalized and approved.
- Write in clear, imperative language following GeneralGuideline.md writing standards.
- This document should be written after the Outline is approved.

---
