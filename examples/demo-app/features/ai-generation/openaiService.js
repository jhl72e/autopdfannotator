/*--------------------------------------AI Annotation System - OpenAI Service--------------------------------------*/

/**
 * OpenAI Service Module
 * Handles all API calls to OpenAI for script and annotation generation
 * This module is completely detachable from the core PDF viewer
 */

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Generate educational script from PDF content
   */
  async generateScript(pdfTextData, pageNumber = 1) {
    // Use fullText for script generation (positions not needed for script)
    const pdfText = typeof pdfTextData === 'string' ? pdfTextData : pdfTextData.fullText;

    const prompt = `You are an educational content creator. Based on the following PDF slide content, create a short, engaging script that explains this information to students. The script should be:
- Clear and educational
- 30-60 seconds when read aloud
- Focused on key concepts
- Easy to understand

PDF Content (Page ${pageNumber}):
${pdfText}

Generate a natural, flowing script that a teacher would use to explain this content:`;

    try {
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating script:', error);
      throw error;
    }
  }

  /**
   * Generate annotations based on script and PDF content with positions
   */
  async generateAnnotations(pdfTextData, script, pageNumber = 1) {
    // Extract position data if available
    const hasPositions = pdfTextData && typeof pdfTextData === 'object';
    const pdfText = hasPositions ? pdfTextData.fullText : pdfTextData;
    const textWithPositions = hasPositions ? pdfTextData.textWithPositions : '';

    const prompt = `Based on the following educational script and PDF content WITH EXACT POSITIONS, generate annotations that will appear synchronized with the narration.

IMPORTANT: Generate EXACTLY 3 or more annotations in the specified JSON format.

Script to be narrated (duration approximately 30-60 seconds):
${script}

PDF Content:
${pdfText}

${textWithPositions ? `TEXT WITH EXACT POSITIONS (use these coordinates for accurate highlights):
${textWithPositions}` : ''}

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

        // For ink (drawing):
        "strokes": [{"color": "#color", "size": 1-5, "points": [{"t": 0-1, "x": 0-1, "y": 0-1}]}]
      }
    }
  ]
}

Guidelines:
1. Coordinates are normalized (0-1) where (0,0) is top-left and (1,1) is bottom-right
2. USE THE EXACT POSITIONS PROVIDED for highlights - match the [x, y, w, h] values from the text positions above
3. For highlights, use the exact x, y, width, and height from the matching text
4. Timing should match when concepts are mentioned in the script
5. Create at least 3 meaningful annotations
6. Highlights for important terms (use exact positions from the text above)
7. Text annotations should be placed in empty areas (avoid overlapping with existing text)
8. Simple drawings like arrows or circles for emphasis (optional)
9. Ensure timings don't overlap too much

EXAMPLE: If text "Machine Learning" is at [x:0.1, y:0.2, w:0.3, h:0.04],
the highlight should use: {"x": 0.1, "y": 0.2, "w": 0.3, "h": 0.04}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations, no additional text:`;

    try {
      const response = await this.callOpenAI(prompt, true);
      return this.parseAnnotations(response);
    } catch (error) {
      console.error('Error generating annotations:', error);
      throw error;
    }
  }

  /**
   * Make API call to OpenAI
   */
  async callOpenAI(prompt, jsonMode = false) {
    // Validate API key
    if (!this.apiKey || !this.apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. Please ensure your API key starts with "sk-"');
    }

    const requestBody = {
      model: "gpt-4o", // Using GPT-4o (optimized) model
      messages: [
        {
          role: "system",
          content: jsonMode
            ? "You are a helpful assistant that generates structured annotation data in JSON format."
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

    // Only add response_format for models that support it
    if (jsonMode) {
      // Note: json_object mode requires gpt-4-1106-preview or gpt-3.5-turbo-1106 or later
      // For compatibility, we'll use regular mode and parse JSON from text
      requestBody.messages[0].content += " Always respond with valid JSON only, no other text.";
    }

    try {
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
          throw new Error('Authentication failed. Please check your API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 404) {
          throw new Error('Model not found. Please ensure you have access to the specified model.');
        } else {
          throw new Error(`OpenAI API error: ${errorMessage}`);
        }
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Parse annotation response and format for application use
   */
  parseAnnotations(response) {
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response;

      // Remove ```json and ``` markers
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
      }

      // Also remove any leading/trailing whitespace
      cleanedResponse = cleanedResponse.trim();

      // Try to extract JSON if there's additional text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);;
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedResponse);
      const annotations = [];

      parsed.annotations.forEach((anno, index) => {
        const baseAnnotation = {
          id: `ai_${Date.now()}_${index}`,
          page: 1,
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
        }
      });

      return annotations;
    } catch (error) {
      console.error('Error parsing annotations:', error);
      return [];
    }
  }
}

export default OpenAIService;

/*--------------------------------------AI Annotation System - OpenAI Service End--------------------------------------*/