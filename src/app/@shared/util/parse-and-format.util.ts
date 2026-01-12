export class ParseAndFormatUtil {
  public static BASE64_PREFIX = 'data:image/jpeg;base64,';

  static addMissingPrefixToBase64(base64: string): string {
    // sanitize
    base64 = String(base64 ?? '').trim();

    if (!base64.includes(this.BASE64_PREFIX)) {
      base64 = this.BASE64_PREFIX + base64;
    }

    return base64;
  }

  static cleanBase64FromPrefix(base64: string): string {
    // sanitize
    base64 = String(base64 ?? '').trim();

    if (base64.includes(this.BASE64_PREFIX)) {
      base64 = base64.split(',')[1];
    }

    return base64;
  }

  static base64ToBlob(base64: string): Blob {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)![1];
    const byteString = atob(data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([intArray], { type: mime });
  }

  static rotateBase64LeftAndFlipVertically(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = this.BASE64_PREFIX + base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-90 * Math.PI) / 180); // rotate left
        ctx.scale(1, -1); // flip vertically
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const rotatedBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        resolve(rotatedBase64);
      };

      img.onerror = (err) => reject('Image load error: ' + err);
    });
  }

  static parseShortDateFromDB(date: number): number {
    const magicLength = 8; // 20240101 - 1st january 2024
    const raw = date.toString();

    if (raw.length == magicLength) {
      const year = parseInt(raw.substring(0, 4), 10);
      const month = parseInt(raw.substring(4, 6), 10) - 1; // Months are 0-indexed
      const day = parseInt(raw.substring(6, 8), 10);

      date = new Date(year, month, day).getTime();
    }

    return date;
  }
}
