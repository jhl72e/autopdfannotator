# Examples Setup Guide

This guide explains how to run all the example applications locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Local Worker Configuration

All examples are configured to use a **local PDF.js worker** for offline development. The worker file is located at:

```
examples/shared/assets/pdf.worker.min.mjs
```

This file is automatically served by Vite's `publicDir` configuration and accessible at `/pdf.worker.min.mjs` in all examples.

## Quick Start - Individual Examples

### 1. React Basic (Port 3000)

Simplest React integration with static annotations.

```bash
cd examples/react-basic
npm install
npm run dev
```

Opens at: `http://localhost:3000`

**Features:**
- Static annotations
- Page navigation
- Zoom controls
- No timeline synchronization

---

### 2. React Audio Sync (Port 3001)

Timeline synchronization with HTML5 audio.

```bash
cd examples/react-audio-sync
npm install
npm run dev
```

Opens at: `http://localhost:3001`

**Features:**
- All react-basic features
- HTML5 audio player
- Real-time timeline sync
- Progressive animations

**Note:** Requires `lecture.mp3` file in `examples/shared/assets/` for audio playback. The example will work without it but won't have audio.

---

### 3. Vanilla JS (Port 3002)

Framework-agnostic imperative API usage.

```bash
cd examples/vanilla-js
npm install
npm run dev
```

Opens at: `http://localhost:3002`

**Features:**
- Same functionality as react-basic
- Pure JavaScript (no React)
- Manual state management
- Imperative API demonstration

---

### 4. React AI Generation (Port 3003)

AI-powered annotation generation with OpenAI GPT-4.

```bash
cd examples/react-ai-generation
npm install
npm run dev
```

Opens at: `http://localhost:3003`

**Features:**
- PDF text extraction with positions
- OpenAI GPT-4 script generation
- Position-accurate annotation generation
- Timeline simulation

**Requirements:**
- OpenAI API key (entered in UI)
- GPT-4 access on your OpenAI account

---

## Running Multiple Examples Simultaneously

Since each example uses a different port, you can run all of them at once:

```bash
# Terminal 1
cd examples/react-basic && npm run dev

# Terminal 2
cd examples/react-audio-sync && npm run dev

# Terminal 3
cd examples/vanilla-js && npm run dev

# Terminal 4
cd examples/react-ai-generation && npm run dev
```

Access them at:
- React Basic: `http://localhost:3000`
- React Audio Sync: `http://localhost:3001`
- Vanilla JS: `http://localhost:3002`
- React AI Generation: `http://localhost:3003`

---

## Shared Resources

All examples share common resources located in `examples/shared/`:

### Assets (`examples/shared/assets/`)
- `sample.pdf` - Test PDF for react-basic and vanilla-js
- `lecture.pdf` - Test PDF for react-audio-sync
- `pdf.worker.min.mjs` - PDF.js worker (1.0MB)
- `lecture.mp3` - Audio file for react-audio-sync (optional, not included)

### Fixtures (`examples/shared/fixtures/`)
- `annotations-sample.js` - Static annotations for basic examples
- `annotations-lecture.js` - Timed annotations for audio-sync example

---

## Building for Production

Each example can be built for production:

```bash
cd examples/<example-name>
npm run build
```

Output will be in `dist/` directory. Preview the build:

```bash
npm run preview
```

---

## Troubleshooting

### PDF.js Worker Errors

**Error:** `pdf.worker.min.mjs not found (404)`

**Solutions:**
1. Verify worker file exists: `ls examples/shared/assets/pdf.worker.min.mjs`
2. Check Vite `publicDir` config points to `../shared/assets`
3. Clear browser cache and reload
4. Restart dev server

If worker file is missing, copy from node_modules:
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs examples/shared/assets/
```

### PDF Not Loading

**Error:** PDF fails to load or 404 error

**Solutions:**
1. Verify PDF files exist in `examples/shared/assets/`
2. Check Vite dev server is running
3. Check browser console for specific error messages

### Module Resolution Errors

**Error:** `Cannot find module '@ai-annotator/renderer'`

**Solutions:**
1. Run `npm install` in the example directory
2. Verify root `package.json` has correct name: `"@ai-annotator/renderer"`
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### React Examples Not Working

**Error:** React errors or white screen

**Solutions:**
1. Verify React version matches (19.1.1)
2. Check browser console for errors
3. Ensure Vite React plugin is installed
4. Clear node_modules and reinstall

### Vanilla JS Not Working

**Error:** Renderer not initializing

**Solutions:**
1. Check browser console for error messages
2. Verify canvas and layer-container elements exist in DOM
3. Ensure correct import path for AnnotationRenderer
4. Open browser dev tools to debug

---

## Development Tips

### Hot Module Replacement (HMR)

All examples support Vite's HMR. Changes to source files will automatically reload in the browser.

### Console Logging

Examples include console logging for debugging:
- `[React Basic]`, `[Vanilla JS]`, etc. prefixes
- Initialization steps
- State changes
- Error messages

Enable verbose logging in browser dev tools.

### Browser DevTools

Recommended tools for debugging:
- **React DevTools** (for React examples)
- **Network tab** - Check PDF and worker file loading
- **Console** - View logs and errors
- **Application tab** - Verify no unwanted caching

### Testing in Different Browsers

Test examples in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

Some features may behave differently across browsers (especially audio timeupdate frequency).

---

## Example Comparison Table

| Feature | react-basic | react-audio-sync | vanilla-js | react-ai-generation |
|---------|-------------|------------------|------------|---------------------|
| Framework | React | React | None | React |
| PDF Rendering | ✅ | ✅ | ✅ | ✅ |
| Annotations | Static | Timed | Static | AI-Generated |
| Timeline Sync | ❌ | ✅ Audio | ❌ | ✅ Simulated |
| API Style | Declarative | Declarative | Imperative | Declarative |
| Complexity | Simple | Medium | Simple | Advanced |
| External Deps | None | Audio file | None | OpenAI API |

---

## Additional Resources

- [Main API Documentation](../docs/API.md)
- [Annotation Format](../docs/ANNOTATION_FORMAT.md)
- [React Adapter](../src/adapters/AnnotPdf.jsx)
- [Core Renderer](../src/core/AnnotationRenderer.js)

---

## Getting Help

If you encounter issues not covered here:

1. Check the README in each example directory
2. Review browser console errors
3. Verify all dependencies are installed
4. Check that worker file is accessible
5. Test with a different browser

---

## Version Information

- PDF.js: 5.4.149
- React: 19.1.1
- Vite: 7.1.7
- Node: 18+ required

---

Last updated: 2025-10-14
