# React Audio Sync Example

Timeline synchronization with HTML5 audio demonstrating real-time annotation animations.

## Features

- All features from react-basic example
- HTML5 audio player with standard controls
- Real-time timeline synchronization
- Progressive annotation animations based on audio time
- Visual timeline position display
- Automatic annotation filtering by page and time

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:3001`

## Usage

- Click **Play** on the audio player to start
- Watch annotations appear and animate in sync with audio
- Use the audio scrubber to jump to different times
- Navigate pages to see annotations on different slides
- Zoom controls work during playback

## Code Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx               # Main component with state orchestration
└── components/
    ├── PdfDisplay.jsx    # PDF renderer with controls
    └── AudioPlayer.jsx   # HTML5 audio with timeline callbacks
```

## Key Concepts

- **Timeline Synchronization**: Audio currentTime → React state → AnnotPdf prop
- **Progressive Animation**: Annotations animate between start and end times
- **Event-Driven Updates**: HTML5 timeupdate event drives synchronization
- **State Lifting**: currentTime managed in App, passed down to components

## Timeline Synchronization Pattern

```javascript
// Audio player fires timeupdate event
<audio onTimeUpdate={() => setCurrentTime(audio.currentTime)} />

// Current time passed to renderer
<AnnotPdf currentTime={currentTime} ... />

// Renderer updates annotations based on time
```

## Related Examples

- [react-basic](../react-basic/) - Simpler version without timeline
- [react-ai-generation](../react-ai-generation/) - AI-generated annotations with simulation

## Troubleshooting

### Annotations not syncing
- Verify currentTime prop is passed to AnnotPdf
- Check annotation start/end times are correct
- Console.log currentTime to debug

### Audio not loading
- Verify `lecture.mp3` exists in `../shared/assets/`
- Check browser console for 404 errors

## Note About Audio File

This example requires an audio file (`lecture.mp3`) to demonstrate synchronization. Since we're using a test PDF, the audio narration won't match the PDF content. For a real implementation:

1. Create a narration script based on PDF content
2. Record or generate audio (30-60 seconds)
3. Adjust annotation timings to match the narration
4. Place audio file in `examples/shared/assets/lecture.mp3`

For testing without audio, you can:
- Use any MP3 file (the timings won't match but synchronization will work)
- Or implement the vanilla-js or react-basic examples which don't require audio

## Documentation

- [Main API Documentation](../../docs/API.md)
- [Annotation Format](../../docs/ANNOTATION_FORMAT.md)
- [Examples Overview](../README.md)
