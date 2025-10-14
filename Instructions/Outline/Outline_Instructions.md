# Outline Document Instructions

---

## What This Document Is

This document provides instructions for writing Outline documents. Outline documents describe WHAT a feature is at a semantic level.

---

## Purpose

Describe WHAT the feature is at a semantic level.

---

## File Naming

`[FeatureName]_Outline.md`

**Example:** `UserAuthentication_Outline.md`, `PDFAnnotation_Outline.md`

---

## Content Guidelines

- Explain the feature's purpose and goals.
- Describe what the feature does from a user perspective.
- Define the scope and boundaries of the feature.
- Explain why the feature is needed.
- Do not include technical implementation details.
- Do not include specific code approaches.
- Focus on the "what" and "why," not the "how."

---

## Document Format

### File Descriptions

When describing features in Outline documents, include:

**File Inventory:**
- List all files involved in the feature implementation.
- Specify the complete file path for each file (e.g., `src/components/UserProfile.jsx`).
- Organize files by their role or directory structure.

**File Purpose:**
- Describe what each file does in the context of the feature.
- Explain the general function and role of the file within the project.
- Focus on the file's responsibility and its relationship to other files.

**Level of Detail:**
- Provide high-level descriptions of file functionality.
- Do NOT describe individual code lines or implementation details.
- Do NOT include specific function signatures or code syntax.
- Explain the general purpose and behavior, not the technical implementation.

### Format Example

```
FILES:

src/components/FeatureName.jsx
- Main component that handles user interactions and displays feature UI
- Integrates with existing component hierarchy

src/components/FeatureNameItem.jsx
- Sub-component for individual items, manages item-level state and rendering

src/services/featureService.js
- Business logic handler, communicates with backend APIs, manages data transformation and validation

src/utils/featureHelpers.js
- Helper functions and shared utility logic for feature components
```

**Writing Guidelines:**
- Use simple file path followed by functional description.
- Write concise, direct statements about what each file does.
- Focus on the file's primary responsibility and role.
- Make descriptions easy to reference without reading the entire document.
- Avoid nested structure or excessive formatting.
- Keep descriptions actionable and functional.

---

## For Existing Projects

- Prioritize compatibility with pre-existing implementations.
- Identify existing features that are similar or related.
- Design the feature to integrate with, not replace, existing functionality.
- Ensure maximum compatibility with the current system.

---

## Coding Standards for Outline Level

**For general coding standards, refer to:** `Instructions/Guidelines/CodeGuide/Code_GeneralGuideline.md`

**Outline-specific standards:**

### Scope Adherence

When defining features in Outline documents, ensure:

- Define only the features explicitly requested.
- Clearly establish feature boundaries and scope.
- Do not expand scope beyond what is necessary.
- Identify what is included and what is excluded from the feature.
- Be specific about the limits of the feature.
- Avoid feature creep by staying focused on the core purpose.

### Feature Definition Principles

- Define features that integrate with existing functionality, not replace it.
- Keep feature scope manageable and focused.
- Ensure the feature has clear, measurable goals.
- Define success criteria for the feature.

---

## Notes

- Mark document as "DRAFT" in the title if not finalized.
- Remove "DRAFT" marker when finalized and approved.
- Write in clear, imperative language following GeneralGuideline.md writing standards.

---
