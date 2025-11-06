import { CommonModule } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  checkmark,
  checkmarkCircleOutline,
  home,
  refresh,
} from 'ionicons/icons';
import Tesseract from 'tesseract.js';
import {
  UserGender,
  UserNationality,
  UserProfile,
} from '../@shared/model/user.model';
import { SharedService } from '../@shared/service/shared.service';

// XXX: TESTING: Ensure camera stops when navigating away (livereload issue)
window.addEventListener('beforeunload', () => {
  CameraPreview.stop().catch(() => {});
  ScreenOrientation.unlock();
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
export class RegisterComponent implements AfterViewInit {
  private BASE64_PREFIX = 'data:image/jpeg;base64,';

  isPhotoTaken = false;
  isIDValid = false;
  isOCRDone = false;

  imageDataUrl: string | undefined;
  extractedText: string;
  profile: UserProfile;

  constructor(private router: Router, private shared: SharedService) {
    addIcons({
      checkmark,
      camera,
      home,
      arrowForward,
      refresh,
      checkmarkCircleOutline,
    });
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

  async startCamera() {
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

  async stopCamera() {
    CameraPreview.stop().catch(() => {});
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
    img.id = 'ocr-preview';
    document.body.appendChild(img); // creates the effect of taken photo on the screen
    this.isPhotoTaken = true;

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

      // add the cropped image to the global imageURL
      const base64 = canvas.toDataURL('image/jpeg');
      // .replace('data:image/jpeg;base64,', '');
      this.imageDataUrl = base64;

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
          croppedImg.id = 'cropped-greyscale-ocr-image';
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
    let lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    lines = this.trimTrailingShortLines(lines);

    const cnp = lines
      .find((line) => /\b\d{13}\b/.test(line))
      ?.match(/\d{13}/)?.[0];

    const nume = lines[lines.length - 2].split('<<')[0].replace('IDROU', '');
    const prenume = lines[lines.length - 2].split('<<')[1].replace('<', '-');

    const serie = lines[lines.length - 1].split('<')[0].substring(0, 2);
    const numar = lines[lines.length - 1].split('<')[0].substring(2, 8);

    const validitate = lines[lines.length - 3]
      .split(' ')
      .find((part) => /\d{2}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{4}/.test(part))!;
    const validityArray = validitate.split('-');
    const isValid =
      new Date().getTime() < this.parseDate_ddMMyy(validityArray[1])!.getTime();

    const cetatenie = lines
      .find((line) => /.*[A-ZĂÂÎȘȚa-zăâîșț]+.*\s\/\s[A-Z]{3}/i.test(line))
      ?.split(' / ')[0]
      .split(' ')[1];

    const sexLine = lines.find((line) => / [FM]( |$)/);
    const sex = /M/.test(sexLine!) ? 'M' : /F/.test(sexLine!) ? 'F' : null;

    const addressStart = lines.findIndex((line) =>
      /Domiciliu|Adresse|Address/i.test(line)
    );
    const address = lines.slice(addressStart + 1, addressStart + 3).join(' ');

    this.isIDValid =
      !!nume &&
      !!prenume &&
      !!cnp &&
      this.validateCNP(cnp) &&
      !!serie &&
      !!numar &&
      isValid &&
      address.length > 10;

    if (this.isIDValid) {
      this.isOCRDone = true;
      // create available profile object
      this.profile = new UserProfile();
      this.profile.cnp = +cnp!;
      this.profile.firstname = prenume;
      this.profile.lastname = nume;
      this.profile.gender =
        sex === 'M'
          ? UserGender.MALE
          : sex === 'F'
          ? UserGender.FEMALE
          : UserGender.OTHER;
      this.profile.idSeries = serie;
      this.profile.idNumber = +numar;
      this.profile.nationality = cetatenie?.match(/rom/i)
        ? UserNationality.ROMANIAN
        : UserNationality.FOREIGNER;
      this.profile.residenceAddress = address;
      this.profile.validityStartDate = this.parseDate_ddMMyy(
        validityArray[0]
      )!.getTime();
      this.profile.validityEndDate = this.parseDate_ddMMyy(
        validityArray[1]
      )!.getTime();
      // WIP: Images could be set here if needed
      this.profile.idImage = this.imageDataUrl!;
      // this.profile.faceImage = this.imageDataUrl!.replace(this.BASE64_PREFIX, '');
    }

    console.log('Parsed Data + validation:', {
      cnp,
      serie,
      numar,
      nume,
      prenume,
      sex,
      cetatenie,
      address,
      validitate,
      validCNP: this.validateCNP(cnp || ''),
      isValid,
      overallValid: this.isIDValid,
    });
  }

  // validate against control digit and 18+
  validateCNP(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) return false;

    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    const digits = cnp.split('').map(Number);

    const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
    const control = sum % 11 === 10 ? 1 : sum % 11;

    return digits[12] === control && this.isCNP18Plus(cnp);
  }

  isCNP18Plus(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) return false;

    const centuryCode = Number(cnp[0]);
    const year = Number(cnp.slice(1, 3));
    const month = Number(cnp.slice(3, 5));
    const day = Number(cnp.slice(5, 7));

    // Determine full year based on century code
    let fullYear = 1900 + year;
    if (centuryCode === 5 || centuryCode === 6) fullYear = 2000 + year;
    if (centuryCode === 3 || centuryCode === 4) fullYear = 1800 + year;

    const birthDate = new Date(fullYear, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Adjust if birthday hasn't occurred yet this year
    const hasHadBirthday =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    return age > 18 || (age === 18 && hasHadBirthday);
  }

  // Helper to parse date in dd.MM.yy format
  parseDate_ddMMyy(dateStr: string): Date | null {
    const [day, month, year] = dateStr.split('.').map(Number);
    if (!day || !month || !year) return null;

    let fullYear = 0;
    if (year < 100) {
      fullYear = year + (year >= 50 ? 1900 : 2000); // handles 2-digit year
    } else {
      fullYear = year;
    }
    return new Date(fullYear, month - 1, day); // month is 0-indexed
  }

  trimTrailingShortLines(lines: string[]): string[] {
    let i = lines.length;
    while (i > 0 && lines[i - 1].length < 15) {
      i--;
    }
    return lines.slice(0, i);
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

  goToProfile() {
    ScreenOrientation.unlock();

    this.shared.setImage(this.profile.idImage);
    this.profile.idImage = undefined!; // clear image data before navigation

    this.router.navigate(['/profile'], {
      replaceUrl: true,
      state: { profile: this.profile },
    });
  }

  async retakePhoto() {
    try {
      await this.stopCamera();

      this.isPhotoTaken = false;
      this.isIDValid = false;
      this.extractedText = '';

      document.getElementById('ocr-preview')?.remove();
      document.getElementById('cropped-greyscale-ocr-image')?.remove();

      await ScreenOrientation.unlock();
      await this.delay(300); // optional: give hardware time to release
      await ScreenOrientation.lock({ orientation: 'landscape' });

      await this.delay(300); // optional: give hardware time to release
      await this.startCamera();
    } catch (err) {
      console.error('Camera restart failed:', err);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
