# React Basic Example

Simplest React integration demonstrating basic PDF rendering with static annotations.

## Features

- Load and display PDF documents
- Render pre-structured annotations from fixtures
- Basic page navigation (previous/next buttons)
- Basic zoom controls (zoom in/out buttons)
- Display current page number and total pages

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:3000`

## Usage

- Use **Previous/Next** buttons to navigate pages
- Use **Zoom In/Out** buttons to adjust scale
- Annotations are loaded from `shared/fixtures/annotations-sample.js`
- PDF loaded from `shared/assets/sample.pdf`

## Code Structure

```
src/
├── main.jsx          # React entry point
├── App.jsx           # Main component with state management
└── components/
    └── Controls.jsx  # Page and zoom control buttons
```

## Key Concepts

- **Declarative API**: AnnotPdf component with props (pdfUrl, page, scale, annotations)
- **State Management**: React useState for page, scale, pageCount
- **Event Handling**: Callbacks for navigation and zoom controls
- **Shared Resources**: Fixtures and assets from `../shared/`

## Related Examples

- [react-audio-sync](../react-audio-sync/) - Adds timeline synchronization with audio
- [vanilla-js](../vanilla-js/) - Same features using imperative API

## Troubleshooting

### PDF not loading
- Verify `sample.pdf` exists in `../shared/assets/`
- Check browser console for errors

### Annotations not visible
- Verify `annotations-sample.js` exists in `../shared/fixtures/`
- Check annotations have correct page numbers

## Documentation

- [Main API Documentation](../../docs/API.md)
- [Annotation Format](../../docs/ANNOTATION_FORMAT.md)
- [Examples Overview](../README.md)
