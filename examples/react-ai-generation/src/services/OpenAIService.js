/**
 * OpenAI Service for generating educational scripts and annotations
 *
 * This service demonstrates how AI can GENERATE annotation data
 * that is then RENDERED by the core system (separation of concerns).
 */
class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Generate educational script from PDF content
   * @param {Object} pdfTextData - Extracted PDF text with positions
   * @param {number} pageNumber - Current page number
   * @returns {Promise<string>} - Generated script text
   */
  async generateScript(pdfTextData, pageNumber = 1) {
    const pdfText = typeof pdfTextData === 'string'
      ? pdfTextData
      : pdfTextData.fullText;

    const prompt = `You are an educational content creator. Based on the following PDF slide content, create a short, engaging script that explains this information to students. The script should be:
- Clear and educational
- 30-60 seconds when read aloud
- Focused on key concepts
- Easy to understand

PDF Content (Page ${pageNumber}):
${pdfText}

Generate a natural, flowing script that a teacher would use to explain this content:`;

    return await this.callOpenAI(prompt);
  }

  /**
   * Generate annotations with exact positions
   * @param {Object} pdfTextData - Extracted PDF text with positions
   * @param {string} script - Generated educational script
   * @param {number} pageNumber - Current page number
   * @returns {Promise<Array>} - Array of annotation objects
   */
  async generateAnnotations(pdfTextData, script, pageNumber = 1) {
    const pdfText = pdfTextData.fullText;
    const textWithPositions = pdfTextData.textWithPositions;

    const prompt = `Based on the following educational script and PDF content WITH EXACT POSITIONS, generate annotations that will appear synchronized with the narration.

IMPORTANT: Generate EXACTLY 3 or more annotations in the specified JSON format.

Script to be narrated (duration approximately 30-60 seconds):
${script}

PDF Content:
${pdfText}

TEXT WITH EXACT POSITIONS (use these coordinates for accurate highlights):
${textWithPositions}

Generate annotations as pure JSON (no markdown, no code blocks, no additional text) in this EXACT format:
{
  "annotations": [
    {
      "type": "highlight|text|ink",
      "start": <number in seconds>,
      "end": <number in seconds>,
      "data": {
        // For highlight:
        "quads": [{"x": 0-1, "y": 0-1, "w": 0-1, "h": 0-1}],
        "color": "rgba(255,230,100,0.35)",

        // For text:
        "content": "text content",
        "x": 0-1, "y": 0-1, "w": 0-1, "h": 0-1,
        "bg": "rgba(255,255,255,0.9)",
        "color": "#1f2937",

        // For ink (drawing):
        "strokes": [{"color": "#color", "size": 1-5, "points": [{"t": 0-1, "x": 0-1, "y": 0-1}]}]
      }
    }
  ]
}

Guidelines:
1. Coordinates are normalized (0-1) where (0,0) is top-left and (1,1) is bottom-right
2. USE THE EXACT POSITIONS PROVIDED for highlights
3. Timing should match when concepts are mentioned in the script
4. Create at least 3 meaningful annotations
5. Mix highlights and text annotations
6. Ensure timings don't overlap too much

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations:`;

    const response = await this.callOpenAI(prompt, true);
    return this.parseAnnotations(response, pageNumber);
  }

  /**
   * Call OpenAI API with error handling
   * @param {string} prompt - Prompt text
   * @param {boolean} jsonMode - Whether to request JSON response
   * @returns {Promise<string>} - API response content
   */
  async callOpenAI(prompt, jsonMode = false) {
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: jsonMode
            ? "You are a helpful assistant that generates structured annotation data in JSON format. Always respond with valid JSON only, no other text."
            : "You are a helpful educational content creator."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: jsonMode ? 2000 : 500
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;

      if (response.status === 401) {
        throw new Error('인증 실패: API 키를 확인해주세요.');
      } else if (response.status === 429) {
        throw new Error('요청 한도 초과: 잠시 후 다시 시도해주세요.');
      } else if (response.status === 404) {
        throw new Error('모델을 찾을 수 없습니다. API 키가 GPT-4 접근 권한이 있는지 확인하세요.');
      } else {
        throw new Error(`OpenAI API 오류: ${errorMessage}`);
      }
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Parse annotation response from OpenAI
   * @param {string} response - Raw API response
   * @param {number} pageNumber - Current page number
   * @returns {Array} - Parsed annotation objects
   */
  parseAnnotations(response, pageNumber = 1) {
    // Clean response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');

    // Extract JSON if there's additional text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanedResponse);
    const annotations = [];

    parsed.annotations.forEach((anno, index) => {
      const baseAnnotation = {
        id: `ai_${Date.now()}_${index}`,
        page: pageNumber,
        start: anno.start,
        end: anno.end
      };

      switch (anno.type) {
        case 'highlight':
          annotations.push({
            ...baseAnnotation,
            type: 'highlight',
            mode: 'quads',
            quads: anno.data.quads,
            style: { color: anno.data.color || "rgba(255,230,100,0.35)" }
          });
          break;

        case 'text':
          annotations.push({
            ...baseAnnotation,
            type: 'text',
            content: anno.data.content,
            x: anno.data.x,
            y: anno.data.y,
            w: anno.data.w || 0.25,
            h: anno.data.h || 0.1,
            style: {
              bg: anno.data.bg || "rgba(255,255,255,0.9)",
              color: anno.data.color || "#1f2937"
            }
          });
          break;

        case 'ink':
          annotations.push({
            ...baseAnnotation,
            type: 'ink',
            strokes: anno.data.strokes
          });
          break;

        default:
          console.warn(`Unknown annotation type: ${anno.type}`);
      }
    });

    return annotations;
  }
}

export default OpenAIService;
