/**
 * OCR Service for extracting text from schedule images
 * Uses Google Cloud Vision API for text recognition
 */

interface OCRResult {
  text: string;
  confidence?: number;
}

/**
 * Extract text from image using Google Cloud Vision API
 * @param imageUri - Local URI of the image to process
 * @param apiKey - Google Cloud Vision API key (should be stored securely)
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(
  imageUri: string,
  apiKey: string
): Promise<OCRResult> {
  try {
    // Convert local URI to base64
    const base64Image = await uriToBase64(imageUri);

    // Call Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || 'Failed to process image with OCR'
      );
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return { text: '' };
    }

    // The first annotation contains the entire detected text
    const fullText = textAnnotations[0].description || '';

    return {
      text: fullText,
      confidence: textAnnotations[0].confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}

/**
 * Convert local image URI to base64 string
 * @param uri - Local file URI
 * @returns Base64 encoded string
 */
async function uriToBase64(uri: string): Promise<string> {
  try {
    // Try to use expo-file-system first (better for React Native)
    try {
      const { readAsStringAsync, EncodingType } = await import('expo-file-system');
      const base64 = await readAsStringAsync(uri, {
        encoding: EncodingType.Base64,
      });
      return base64;
    } catch (expoError) {
      // Fallback to fetch if expo-file-system is not available
      console.log('expo-file-system not available, using fetch fallback');
    }

    // Fallback: Use fetch for web/alternative platforms
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      // For local files, we'll use fetch in React Native
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // If it's already a data URI or HTTP URL, handle accordingly
      if (uri.startsWith('data:')) {
        return uri.split(',')[1];
      }
      // For HTTP URLs, fetch and convert
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error('Error converting URI to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
}

/**
 * Alternative: Client-side OCR using Tesseract.js (for offline use)
 * Note: This requires additional setup and may have lower accuracy
 */
export async function extractTextWithTesseract(
  imageUri: string
): Promise<OCRResult> {
  // This would require installing @tesseract.js/tesseract
  // For now, this is a placeholder for future implementation
  throw new Error('Tesseract OCR not yet implemented. Use Google Cloud Vision API instead.');
}

