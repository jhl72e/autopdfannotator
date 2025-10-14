# Examples Directory

This directory contains 4 complete example applications demonstrating the Dynamic PDF Annotation Renderer System.

## 🚀 Quick Start

All examples are **ready to run locally** with the PDF.js worker included:

```bash
# Choose any example and run:
cd react-basic          # or react-audio-sync, vanilla-js, react-ai-generation
npm install
npm run dev
```

## 📚 Examples Overview

### 1. [react-basic](./react-basic/) - Port 3000
**Simplest React integration**
- Static annotations
- Page navigation & zoom
- Declarative API
- Best for: Learning the basics

### 2. [react-audio-sync](./react-audio-sync/) - Port 3001
**Timeline synchronization**
- HTML5 audio player
- Real-time sync with annotations
- Progressive animations
- Best for: Educational content with narration

### 3. [vanilla-js](./vanilla-js/) - Port 3002
**Framework-agnostic**
- Pure JavaScript (no React)
- Imperative API
- Manual state management
- Best for: Legacy apps or non-React projects

### 4. [react-ai-generation](./react-ai-generation/) - Port 3003
**AI-powered generation**
- OpenAI GPT-4 integration
- Dynamic annotation generation
- PDF text extraction
- Best for: AI-powered educational tools

## 🔧 Local Worker System

All examples use a **local PDF.js worker** for offline development:

```
shared/assets/pdf.worker.min.mjs (1.0MB)
```

✅ **No CDN required** - Everything works offline!

## 📁 Shared Resources

All examples share common resources:

- **Assets** (`shared/assets/`)
  - `sample.pdf` - Test PDF (194KB)
  - `lecture.pdf` - Lecture PDF (194KB)
  - `pdf.worker.min.mjs` - PDF.js worker (1.0MB)

- **Fixtures** (`shared/fixtures/`)
  - `annotations-sample.js` - Static annotations
  - `annotations-lecture.js` - Timed annotations

## 🎯 Which Example Should I Start With?

| If you want to... | Start with |
|-------------------|------------|
| Learn the basics | **react-basic** |
| Add timeline sync | **react-audio-sync** |
| Use without React | **vanilla-js** |
| Generate with AI | **react-ai-generation** |

## 📖 Documentation

- [**SETUP.md**](./SETUP.md) - Detailed setup guide & troubleshooting
- [Main API Documentation](../docs/API.md)
- [Annotation Format](../docs/ANNOTATION_FORMAT.md)

## 🏃 Running Multiple Examples

All examples use different ports and can run simultaneously:

```bash
# Terminal 1
cd react-basic && npm run dev          # → localhost:3000

# Terminal 2
cd react-audio-sync && npm run dev     # → localhost:3001

# Terminal 3
cd vanilla-js && npm run dev           # → localhost:3002

# Terminal 4
cd react-ai-generation && npm run dev  # → localhost:3003
```

## ✨ Key Features

- ✅ **Fully local** - No external dependencies required
- ✅ **Hot reload** - Instant updates during development
- ✅ **Multiple frameworks** - React and Vanilla JS examples
- ✅ **Production ready** - Build commands included
- ✅ **Well documented** - README in each example

## 🐛 Troubleshooting

**PDF not loading?**
```bash
# Verify shared assets exist
ls shared/assets/
```

**Worker errors?**
```bash
# Worker should be accessible at /pdf.worker.min.mjs
# Check browser Network tab
```

**Module errors?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 🏗️ Project Structure

```
examples/
├── README.md              # This file
├── SETUP.md              # Detailed setup guide
├── react-basic/          # Example 1
├── react-audio-sync/     # Example 2
├── vanilla-js/           # Example 3
├── react-ai-generation/  # Example 4
└── shared/               # Shared resources
    ├── assets/           # PDFs & worker
    └── fixtures/         # Annotation data
```

## 🎓 Learning Path

1. **Start:** [react-basic](./react-basic/) - Understand core concepts
2. **Explore:** [vanilla-js](./vanilla-js/) - See imperative API
3. **Advance:** [react-audio-sync](./react-audio-sync/) - Add timeline sync
4. **Expert:** [react-ai-generation](./react-ai-generation/) - AI integration

## 📝 License

Same as parent project

---

**Ready to start?** Pick an example above and run `npm install && npm run dev`! 🚀
