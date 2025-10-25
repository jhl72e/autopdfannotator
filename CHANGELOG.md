# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-25

### Added

- Initial release of @ai-annotator/renderer
- Framework-agnostic core rendering engine
- PDF rendering with pdf.js integration
- Timeline synchronization system
- React adapter component (AnnotPdf)
- Support for highlight annotations with progressive reveal
- Support for text box annotations with word-by-word reveal
- Support for ink/drawing annotations with progressive strokes
- Coordinate utilities for normalized positioning
- Viewport utilities for responsive rendering
- Type validators for annotation data
- Complete API documentation
- Working examples (vanilla JS, React basic, React audio sync)

### Features

- Automatic worker configuration (zero config for consumers)
- Tree-shakeable exports
- Source maps for debugging
- TypeScript-friendly JSDoc annotations
- Comprehensive error handling

[0.1.0]: https://github.com/jhl72e/pdfAutoAnnotator/releases/tag/v0.1.0
