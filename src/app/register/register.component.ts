import { CommonModule, Location } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Platform } from '@ionic/angular';
import { IonIcon } from '@ionic/angular/standalone';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { TranslateService } from '@ngx-translate/core';
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
import { ToastService } from '../@shared/service/toast.service';
import { ParseAndFormatUtil } from '../@shared/util/parse-and-format.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterComponent implements OnInit {

  isPhotoTaken = false;
  isIDValid = false;
  isOCRDone = false;

  faceDetector: FaceDetector | null = null;

  idImageDataUrl: string | undefined;
  faceImageDataUrl: string | undefined;
  extractedText: string;
  profile: UserProfile;

  constructor(
    private router: Router,
    private shared: SharedService,
    private ngZone: NgZone,
    private toast: ToastService,
    private translate: TranslateService,
    private platform: Platform,
    private location: Location
  ) {
    addIcons({
      checkmark,
      camera,
      home,
      arrowForward,
      refresh,
      checkmarkCircleOutline,
    });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.goBack();
      });
    });
  }

  async ngOnInit(): Promise<void> {
    console.log('[ngOnInit]: Initializing FaceDetector...');
    await this.initFaceDetector();
    console.log('[ngOnInit]: Loaded FaceDetector...');
  }

  async ionViewWillEnter() {
    console.log('[ionViewWillEnter] Starting registration process...');
    this.isPhotoTaken = false;
    this.isIDValid = false;
    this.isOCRDone = false;

    console.log('[ionViewWillEnter] End: Registration process initialized....');
  }

  async ionViewDidEnter() {
    console.log('[ionViewDidEnter] Landscape...');
    await ScreenOrientation.lock({ orientation: 'landscape' });
    await this.delay(300);

    // toast info about how to position ID
    console.log('[ionViewDidEnter] Toast shown with instructions.');
    this.toast.show(this.translate.instant('register.info'), 5000);

    console.log('[ionViewDidEnter] Starting camera...');
    await this.startCamera();
    this.cleanDocumentImages();
    console.log('[ionViewDidEnter] Camera started.');
  }

  async ionViewDidLeave() {
    console.log('[ionViewDidLeave] stopping camera...');

    await this.stopCamera();
    console.log('[ionViewDidLeave] unlocked and stopped.');

    await ScreenOrientation.lock({ orientation: 'portrait' });
    this.delay(50);
  }

  shouldRetakePhoto(): boolean {
    return this.isPhotoTaken && !this.isIDValid && this.isOCRDone;
  }

  shouldWaitScanning(): boolean {
    return this.isPhotoTaken && !this.isOCRDone;
  }

  shouldSavePhoto(): boolean {
    return this.isPhotoTaken && this.isIDValid && this.isOCRDone;
  }

  async initFaceDetector() {
    console.log('[initFaceDetector]: Checking Model Face Detector support...');
    fetch('/assets/mediapipe/blaze_face_short_range.tflite')
      .then((r) =>
        console.log('[initFaceDetector]: model fetch status:', r.status)
      )
      .catch((e) => console.error('[initFaceDetector]: model fetch error:', e));

    console.log('[initFaceDetector]: Initializing MediaPipe Face Detector...');

    const vision = await FilesetResolver.forVisionTasks(
      '/assets/mediapipe/wasm'
    );

    console.log('[initFaceDetector]: Loading MediaPipe Face Detector model...');

    this.faceDetector = await FaceDetector.createFromModelPath(
      vision,
      '/assets/mediapipe/blaze_face_short_range.tflite'
    );

    console.log('MediaPipe Face Detector loaded.');
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
    const result = await CameraPreview.capture({
      width: window.innerWidth,
      height: window.innerHeight,
      quality: 90,
    });
    const base64 = result.value;
    this.runOCR(ParseAndFormatUtil.BASE64_PREFIX + base64);
  }

  async runOCR(imageDataUrl: string | null) {
    console.log('Starting OCR process...');
    this.isOCRDone = false;

    const rect = document
      .querySelector('.scan-rectangle')!
      .getBoundingClientRect();

    // console.log('Scan rectangle dimensions:', rect);

    if (!imageDataUrl || !rect) {
      this.extractedText = 'No image data available.';
      return;
    }

    // processing image to crop to rectangle area could be added here
    // console.log('image base64: ', imageDataUrl);
    const blob = ParseAndFormatUtil.base64ToBlob(imageDataUrl);
    // console.log('Converted Blob:', blob);

    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.id = 'ocr-preview';
    document.body.appendChild(img); // creates the effect of taken photo on the screen

    this.ngZone.run(() => {
      this.isPhotoTaken = true;
    });

    console.log('Image created for cropping:', img);
    console.log('Image dimensions before load:', {
      width: img.naturalWidth,
      height: img.naturalHeight,
    });

    img.onload = () => {
      // match pixels between displayed image and actual image
      const scaleX = img.naturalWidth / window.innerWidth;
      const scaleY = img.naturalHeight / window.innerHeight;
      console.log('Window dimensions:', {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      console.log('Image dimensions:', {
        width: img.width,
        height: img.height,
      });
      console.log('Scale factors:', { scaleX, scaleY });

      const cropX = rect.left * scaleX;
      const cropY = rect.top * scaleY;
      const cropWidth = rect.width * scaleX;
      const cropHeight = rect.height * scaleY;

      console.log('Cropping parameters:', {
        cropX,
        cropY,
        cropWidth,
        cropHeight,
      });

      // Now crop ID using canvas
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      console.log('Canvas created with dimensions:', {
        width: canvas.width,
        height: canvas.height,
      });

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
      this.idImageDataUrl = base64;

      // crop faceImage using canvas
      const faceImg = new Image();
      faceImg.src = this.idImageDataUrl;

      faceImg.onload = async () => {
        if (!this.faceDetector) {
          console.error('FaceDetector not initialized');
          return;
        }

        console.log('[FACE]: before detection');
        const detections = this.faceDetector.detect(faceImg);
        console.log('[FACE]: after detection: ', detections);

        const face = detections.detections[0].boundingBox;

        console.log('face from bounding box: ', face);

        const canvas = document.createElement('canvas');
        canvas.width = face!.width;
        canvas.height = face!.height;

        const ctx = canvas.getContext('2d');
        ctx!.drawImage(
          faceImg,
          face!.originX,
          face!.originY,
          face!.width,
          face!.height,
          0,
          0,
          face!.width,
          face!.height
        );
        const faceImageDataUrl = canvas.toDataURL('image/jpeg');

        // log the photo:
        canvas.toBlob(async (faceBlob) => {
          const faceCroppedImage = new Image();
          faceCroppedImage.src = URL.createObjectURL(faceBlob!);
          faceCroppedImage.id = 'cropped-face-image';
          document.body.appendChild(faceCroppedImage);
          console.log('Cropped Face Blob:', faceCroppedImage);
        });

        // save globally to put it to DTO after OCR
        this.faceImageDataUrl = faceImageDataUrl;
      };

      // transform cropped canvas back to blob and pass to Tesseract
      canvas.toBlob(
        async (croppedBlob) => {
          const result = await Tesseract.recognize(croppedBlob!, 'ron', {
            langPath: '/assets/tesseract/ron.traineddata.gz',
            // logger: (m) => console.log(m),
          });
          console.log('OCR result (result.data.text):', result.data.text);
          console.log('OCR result (full):', result);
          this.extractedText = result.data.text;

          this.parseExtractedText(this.extractedText);

          console.log('OCR process completed.');
          this.ngZone.run(() => {
            this.isOCRDone = true;
          });

          console.log(
            `isOCRDone: ${this.isOCRDone}, isIDValid: ${this.isIDValid}, isPhotoTaken: ${this.isPhotoTaken}`
          );
          console.log(
            `shouldRetakePhoto(): ${this.shouldRetakePhoto()}\n shouldWaitScanning(): ${this.shouldWaitScanning()}\n shouldSavePhoto(): ${this.shouldSavePhoto()}`
          );
        },
        'image/jpeg',
        0.9
      );
    };
  }

  parseExtractedText(text: string) {
    try {
      let lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      lines = this.trimTrailingShortLines(lines);

      const filteredLength = lines.filter((line) => line.length > 35);
      const lastFilteredLine = filteredLength[filteredLength.length - 1]
        .trim()
        .replace(/\s/g, '');
      const secondToLastLine = filteredLength[filteredLength.length - 2]
        .trim()
        .replace(/\s/g, '');
      const thirdToLastLine = filteredLength[filteredLength.length - 3].trim();

      const lastTextLineRight = lastFilteredLine.split('<')[1];
      var cnp = '';

      if (lastTextLineRight.length == 27) {
        const firstPart = lastTextLineRight.substring(19, 20);
        const secondPart = lastTextLineRight.substring(4, 10);
        const thirdPart = lastTextLineRight.substring(20, 26);

        cnp = firstPart + secondPart + thirdPart;
      }

      // console.log('Extracted CNP:', cnp);

      const nume = secondToLastLine.split('<<')[0].replace('IDROU', '');
      // console.log('Extracted Nume:', nume);
      const prenume = secondToLastLine.split('<<')[1].replace('<', '-');
      // console.log('Extracted Prenume:', prenume);

      const lastTextLineLeft = lastFilteredLine.split('<')[0];
      const serie = lastTextLineLeft.substring(0, 2);
      const numar = lastTextLineLeft.substring(2, 8);

      // console.log('Extracted Serie + Numar:', serie + ' ' + numar);

      const validitate = thirdToLastLine
        .split(' ')
        .find((part) => /\d{2}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{4}/.test(part))!;
      const validityArray = validitate.split('-');
      const isValid =
        new Date().getTime() <
        this.parseDate_ddMMyy(validityArray[1])!.getTime();
      // console.log(
      //   'Extracted Validity:',
      //   validityArray,
      //   'is currently valid:',
      //   isValid
      // );

      const cetatenie = this.parseCetatenie(lines);
      // console.log('Extracted Cetatenie:', cetatenie);

      const matchLine = lines.find((line) => /\/.*\b[MF]\b\s*$/.test(line));

      const sexMatch = matchLine?.match(/\/.*\b([MF])\b\s*$/);
      const sex = sexMatch?.[1];
      // console.log('Sex matched: ', sex);

      const addressStart = lines.findIndex((line) =>
        /Domiciliu|Adresse|Address/i.test(line)
      );
      const address = lines.slice(addressStart + 1, addressStart + 3).join(' ');
      // console.log('Extracted Address:', address);

      const isCNPValid = this.validateCNP(cnp);

      this.ngZone.run(() => {
        this.isIDValid =
          !!nume &&
          !!prenume &&
          !!cnp &&
          !!isCNPValid &&
          !!serie &&
          !!numar &&
          isValid &&
          address.length > 10;
      });

      if (!isCNPValid) {
        console.log(`CNP is not valid: ${cnp}`);
        return;
      }

      if (this.isIDValid) {
        console.log(`ID is valid: ${this.isIDValid}\nsex = ${sex}`);

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
        this.profile.idImage = this.idImageDataUrl!;
        this.profile.faceImage = this.faceImageDataUrl!;
      } else {
        this.toast.show(this.translate.instant('register.retake-photo'), 5000);
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
        validCNP: !!isCNPValid,
        isValid,
        overallValid: this.isIDValid,
      });
    } catch (err) {
      console.error('OCR failed with:', err);

      this.ngZone.run(() => {
        this.isIDValid = false;

        this.toast.show(this.translate.instant('register.retake-photo'), 5000);
      });
    }
  }

  // validate against control digit and 18+
  validateCNP(cnp: string): boolean {
    console.log('Validating CNP:', cnp);
    if (!/^\d{13}$/.test(cnp)) return false;

    const isValidControlDigit = this.isCNPValidAgainstControlDigit(cnp);
    const is18Plus = this.isCNP18Plus(cnp);

    if (!isValidControlDigit) {
      this.toast.show(this.translate.instant('register.invalid-cnp'), 5000);
    }

    if (isValidControlDigit && !is18Plus) {
      this.toast.show(this.translate.instant('register.under-18'), 5000);
    }

    console.log('isCNP18Plus:', is18Plus);
    console.log('isCNPValidAgainstControlDigit:', isValidControlDigit);
    return isValidControlDigit && is18Plus;
  }

  isCNPValidAgainstControlDigit(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) return false;

    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    const digits = cnp.split('').map(Number);

    const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
    const control = sum % 11 === 10 ? 1 : sum % 11;

    return digits[12] === control;
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

  parseCetatenie(lines: string[]) {
    const index = lines.findIndex((line) =>
      /nationalitate|nationality/i.test(line.normalize('NFD'))
    );

    if (index !== -1 && index + 1 < lines.length) {
      const nextLine = lines[index + 1];

      // old: /.*[A-ZĂÂÎȘȚa-zăâîșț]+.*\s\/\s[A-Z]{3}/
      const match = nextLine.match(/([A-Za-zăâîșțĂÂÎȘȚ]{4,})(?=[^/\r\n]*\/)/);
      const foundCetatenie = match?.[1];

      return foundCetatenie;
    } else {
      // looking for '/' and 'XYZ' and match the word of at least 4 chars before '/'
      const matchLine = lines.find(
        (line) =>
          /\/.*[A-Z]{3}/.test(line) &&
          /\b[A-Za-zăâîșțĂÂÎȘȚ]{4,}\b(?=\s*\/)/i.test(line)
      );

      const match = matchLine?.match(/\b([A-Za-zăâîșțĂÂÎȘȚ]{4,})\b(?=\s*\/)/i);
      const word = match?.[1];

      return word;
    }

    return null;
  }

  trimTrailingShortLines(lines: string[]): string[] {
    let i = lines.length;
    while (i > 0 && lines[i - 1].length < 15) {
      i--;
    }
    return lines.slice(0, i);
  }

  async goToProfile() {
    this.shared.setImage(this.profile.idImage);
    // this.profile.idImage = undefined!; // clear image data before navigation

    // cleanup before you go ;)
    // await this.stopCamera();
    // await this.delay(300);

    this.isPhotoTaken = false;
    this.isIDValid = false;
    this.isOCRDone = false;

    // await ScreenOrientation.unlock();
    // (window as any).NativeOrientation?.resetOrientation();
    // this.delay(50);
    // await ScreenOrientation.lock({ orientation: 'portrait' });
    console.log('register orientation: ', (await ScreenOrientation.orientation()).type);

    this.router.navigate(['/profile'], {
      replaceUrl: true,
      state: { profile: this.profile },
    });
  }

  async retakePhoto() {
    try {
      await this.stopCamera();

      this.ngZone.run(() => {
        this.isPhotoTaken = false;
        this.isIDValid = false;
        this.extractedText = '';
      });

      this.cleanDocumentImages();

      await this.startCamera();
    } catch (err) {
      console.error('Camera restart failed:', err);
    }
  }

  cleanDocumentImages() {
    document.getElementById('ocr-preview')?.remove();
    document.getElementById('cropped-greyscale-ocr-image')?.remove();
    document.getElementById('cropped-face-image')?.remove();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  goBack() {
    this.location.back();
  }
}
