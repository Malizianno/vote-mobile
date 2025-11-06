export class ParseAndFormatUtil {
  static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeType });
  }
}
