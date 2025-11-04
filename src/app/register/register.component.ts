import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  camera,
  checkmarkCircleOutline,
  home,
  refresh,
} from 'ionicons/icons';
import Tesseract from 'tesseract.js';
import { __values } from 'tslib';

// XXX: TESTING: Ensure camera stops when navigating away (livereload issue)
window.addEventListener('beforeunload', () => {
  CameraPreview.stop().catch(() => {});
});
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonInput,
    IonButtons,
    IonCardContent,
    IonCardHeader,
    IonRow,
    IonCard,
    IonCol,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterComponent {
  private BASE64_PREFIX = 'data:image/jpeg;base64,';
  imageDataUrl: string | undefined;
  extractedText: string;

  constructor() {
    addIcons({ home, camera, arrowForward, refresh, checkmarkCircleOutline });
  }

  ngAfterViewInit() {
    this.startCamera();
  }

  ionViewWillEnter() {
    ScreenOrientation.lock({ orientation: 'landscape' });
  }

  ionViewWillLeave() {
    ScreenOrientation.unlock(); // or reset to default
  }

  startCamera() {
    const options: CameraPreviewOptions = {
      position: 'rear',
      parent: 'camera-preview',
      className: 'camera-feed',
      toBack: true, // Pushes native camera behind webview
      width: window.innerWidth,
      height: window.innerHeight,
    };
    CameraPreview.start(options);
  }

  async captureImage() {
    const result = await CameraPreview.capture({ quality: 90 });
    const base64 = result.value;
    this.runOCR(this.BASE64_PREFIX + base64);
  }

  async runOCR(imageDataUrl: string | null) {
    console.log('Starting OCR process...');
    const rect = document
      .querySelector('.scan-rectangle')!
      .getBoundingClientRect();

    console.log('Scan rectangle dimensions:', rect);

    if (!imageDataUrl || !rect) {
      this.extractedText = 'No image data available.';
      return;
    }

    // processing image to crop to rectangle area could be added here
    console.log('image base64: ', imageDataUrl);
    const blob = this.base64ToBlob(imageDataUrl);
    console.log('Converted Blob:', blob);

    const img = new Image();
    img.src = URL.createObjectURL(blob);
    document.body.appendChild(img); // creates the effect of taken photo on the screen

    console.log('Image created for cropping:', img);
    // console.log('Image dimensions before load:', { width: img.naturalWidth, height: img.naturalHeight });

    img.onload = () => {
      // metch pixels between displayed image and actual image
      const scaleX = img.naturalWidth / window.innerWidth;
      const scaleY = img.naturalHeight / window.innerHeight;
      // console.log('Window dimensions:', {
      //   width: window.innerWidth,
      //   height: window.innerHeight,
      // });
      // console.log('Image dimensions:', {
      //   width: img.width,
      //   height: img.height,
      // });
      // console.log('Scale factors:', { scaleX, scaleY });

      const cropX = rect.left * scaleX;
      const cropY = rect.top * scaleY;
      const cropWidth = rect.width * scaleX;
      const cropHeight = rect.height * scaleY;

      // console.log('Cropping parameters:', {
      //   cropX,
      //   cropY,
      //   cropWidth,
      //   cropHeight,
      // });

      // Now crop using canvas
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // console.log('Canvas created with dimensions:', {
      //   width: canvas.width,
      //   height: canvas.height,
      // });

      const ctx = canvas.getContext('2d');
      ctx!.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight, // source
        0,
        0,
        cropWidth,
        cropHeight // destination
      );

      // convert to grayscale
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg; // R, G, B = avg
      }

      ctx!.putImageData(imageData, 0, 0);

      // transform cropped canvas back to blob and pass to Tesseract
      canvas.toBlob(
        async (croppedBlob) => {
          //logging
          const croppedImg = new Image();
          croppedImg.src = URL.createObjectURL(croppedBlob!);
          document.body.appendChild(croppedImg);
          console.log('Cropped Blob:', croppedImg);

          const result = await Tesseract.recognize(croppedBlob!, 'ron', {
            langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
            logger: (m) => console.log(m),
          });
          console.log('OCR result (result.data.text):', result.data.text);
          this.extractedText = result.data.text;

          this.parseExtractedText(this.extractedText);
          console.log('OCR process completed.');
        },
        'image/jpeg',
        0.9
      );
    };
  }

  parseExtractedText(text: string) {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const cnp = lines
      .find((line) => /\b\d{13}\b/.test(line))
      ?.match(/\d{13}/)?.[0];

    const nume = lines[lines.length - 2].split('<<')[0].replace('IDROU', '');
    const prenume = lines[lines.length - 2].split('<<')[1].replace('<', '-');

    const serie = lines[lines.length - 1].split('<')[0].substring(0, 2);
    const numar = lines[lines.length - 1].split('<')[0].substring(2, 8);

    const validitate = lines[lines.length - 3].substring(
      lines[lines.length - 3].length - 19
    );
    const validityArray = validitate.split('-');
    const isValid = // WIP: currently NOT USED
      new Date().getTime() < this.parseDate_ddMMyy(validityArray[1])!.getTime();

    const cetatenie = lines
      .find((line) => /.*[A-ZĂÂÎȘȚa-zăâîșț]+.*\s\/\s[A-Z]{3}/i.test(line))
      ?.split(' / ')[0];

    const sexLine = lines.find((line) => /Sex|Saxe/i);
    const sex = /M/.test(sexLine!) ? 'M' : /F/.test(sexLine!) ? 'F' : null;

    const addressStart = lines.findIndex((line) =>
      /Domiciliu|Adresse|Address/i.test(line)
    );
    const address = lines.slice(addressStart + 1, addressStart + 3).join(' ');

    console.log('Parsed Data:', {
      cnp,
      serie,
      numar,
      nume,
      prenume,
      sex,
      cetatenie,
      address,
      validitate,
    });
  }

  // Helper to parse date in dd.MM.yy format
  parseDate_ddMMyy(dateStr: string): Date | null {
    const [day, month, year] = dateStr.split('.').map(Number);
    if (!day || !month || !year) return null;

    const fullYear = year + (year >= 50 ? 1900 : 2000); // handles 2-digit year
    return new Date(fullYear, month - 1, day); // month is 0-indexed
  }

  base64ToBlob(base64: string): Blob {
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
}
