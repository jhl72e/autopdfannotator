# React AI Generation Example

AI-powered annotation generation demonstrating the separation between annotation generation (AI services) and annotation rendering (core system).

## Features

- PDF text extraction with normalized positions
- Educational script generation using OpenAI GPT-4
- Position-accurate annotation generation
- Timeline simulation for playback
- Secure client-side API key handling
- Comprehensive error handling

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:3003`

## Usage

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Ensure you have GPT-4 access (required)

### Generating Annotations

1. Enter your OpenAI API key in the input field
2. Click "애노테이션 생성" (Generate Annotations)
3. Wait for generation process (3 steps)
4. Review generated script and annotations
5. Use timeline controls to see animations

## Code Structure

```
src/
├── App.jsx                      # Main orchestration
├── components/
│   ├── PdfDisplay.jsx          # PDF renderer wrapper
│   ├── GenerationPanel.jsx     # AI generation controls
│   └── TimelineControls.jsx    # Playback simulation
└── services/
    ├── OpenAIService.js        # OpenAI API integration
    └── PDFTextExtractor.js     # PDF text extraction
```

## Key Concepts

### Separation of Concerns

- **Generation (Out of scope)**: AI services create annotation data
- **Rendering (Core system)**: Renderer displays annotation data
- Services can be swapped (OpenAI → Claude → Gemini)

### AI Integration Pattern

```javascript
// 1. Extract PDF text with positions
const extractor = new PDFTextExtractor();
const textData = await extractor.extractPageTextWithPositions(page);

// 2. Generate script
const openai = new OpenAIService(apiKey);
const script = await openai.generateScript(textData, page);

// 3. Generate annotations
const annotations = await openai.generateAnnotations(textData, script, page);

// 4. Render with core system
<AnnotPdf annotations={annotations} currentTime={currentTime} />
```

## Security Notes

⚠️ **Important:**
- API key stored only in memory (component state)
- Not persisted to localStorage or cookies
- Sent directly to OpenAI API only
- For production apps, use server-side API proxy

## Error Handling

| Error | Message |
|-------|---------|
| Invalid API key | "올바른 OpenAI API 키 형식이 아닙니다" |
| Authentication failed | "인증 실패: API 키를 확인해주세요" |
| Rate limit | "요청 한도 초과: 잠시 후 다시 시도해주세요" |
| Model access | "모델을 찾을 수 없습니다" |
| No text | "PDF에서 텍스트를 추출할 수 없습니다" |

## Fallback Mechanism

If AI generates fewer than 3 annotations, default annotations are added automatically to ensure minimum viable demo.

## Related Examples

- [react-basic](../react-basic/) - Simplest integration
- [react-audio-sync](../react-audio-sync/) - Real audio synchronization

## Troubleshooting

### Generation fails
- Verify API key is correct and has GPT-4 access
- Check network connection
- Review browser console for specific errors

### No text extracted
- PDF may be image-based (not supported)
- Try a different PDF with selectable text

## Documentation

- [Main API Documentation](../../docs/API.md)
- [Examples Overview](../README.md)
