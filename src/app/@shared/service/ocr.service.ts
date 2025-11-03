import { recognize } from 'tesseract.js';

export class OcrService {
  async parseImage(base64Image: string): Promise<string> {
    const result = await recognize(base64Image, 'ron', {
      logger: m => console.log(m) // optional progress
    });

    return result.data.text;
  }
}