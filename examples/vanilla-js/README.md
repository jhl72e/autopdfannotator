# Vanilla JavaScript Example

Framework-agnostic imperative API usage demonstrating the core renderer without React.

## Features

- Same functional capabilities as react-basic
- Pure JavaScript (no React dependency)
- Manual DOM manipulation
- Imperative API calls
- Manual lifecycle management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:3002`

## Usage

- Use **Previous/Next** buttons to navigate pages
- Use **Zoom In/Out** buttons to adjust scale
- Annotations loaded from `shared/fixtures/annotations-sample.js`
- PDF loaded from `shared/assets/sample.pdf`

## Code Structure

```
src/
├── main.js      # Imperative JavaScript with manual state management
└── style.css    # Styling for layout and controls
```

## Key Concepts

- **Imperative API**: Direct method calls (loadPDF, setPage, setScale)
- **Manual State**: Variables for page, scale, pageCount
- **DOM Manipulation**: Direct updates to textContent and disabled
- **Lifecycle**: Manual initialization and cleanup

## Imperative API Pattern

```javascript
// Create renderer
const renderer = new AnnotationRenderer({
  canvasElement: canvas,
  container: layerContainer
});

// Load PDF
const result = await renderer.loadPDF('/sample.pdf');

// Render page
await renderer.setPage(1);
await renderer.setScale(1.5);
renderer.setAnnotations(annotations);

// Clean up
renderer.destroy();
```

## Comparison with React

| Aspect | Vanilla JS | React |
|--------|-----------|-------|
| State | Manual variables | useState hooks |
| Updates | Explicit calls | Automatic re-render |
| API | Imperative | Declarative |
| Cleanup | Manual destroy() | Automatic unmount |

## Related Examples

- [react-basic](../react-basic/) - Same features using React
- [react-audio-sync](../react-audio-sync/) - Timeline synchronization

## Troubleshooting

### Renderer not working
- Check canvas and container elements exist in DOM
- Verify correct import path

### State not updating UI
- Ensure update functions called after state changes
- Check element references are valid

## Documentation

- [Main API Documentation](../../docs/API.md)
- [Examples Overview](../README.md)
