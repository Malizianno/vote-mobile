import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { HttpResponse } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowForward, camera, checkmark, refresh } from 'ionicons/icons';
import {
  FaceLoginRequestDTO,
  FaceLoginResponseDTO,
} from '../@shared/model/login.dto';
import { CredentialsService } from '../@shared/service/credentials.service';
import { LoginService } from '../@shared/service/login.service';
import { ToastService } from '../@shared/service/toast.service';
import { ParseAndFormatUtil } from '../@shared/util/parse-and-format.util';

import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// XXX: TESTING: Ensure camera stops when navigating away (livereload issue)
window.addEventListener('beforeunload', () => {
  CameraPreview.stop().catch(() => {});
});

@Component({
  selector: 'app-face-id-login',
  templateUrl: './face-id-login.component.html',
  styleUrls: ['./face-id-login.component.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonFabButton,
    IonFab,
    IonIcon,
    FormsModule,
    CommonModule,
    IonSpinner,
    TranslateModule,
  ],
})
export class FaceIDLoginComponent implements OnInit {
  imageBase64: string = '';

  isFaceValid = false;

  faceDetector: FaceDetector | null = null;
  photoProcessing = false;
  photoTaken = false;

  constructor(
    private platform: Platform,
    private service: LoginService,
    private credentials: CredentialsService,
    private router: Router,
    private ngZone: NgZone,
    private toast: ToastService,
    private translate: TranslateService
  ) {
    console.log('[constructor]: Initializing FaceIDLoginComponent...');
    addIcons({ camera, refresh, checkmark, arrowForward });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        this.goBack();
      });
    });
  }
  async ngOnInit(): Promise<void> {
    console.log('[ngOnInit]: Initializing FaceIDLoginComponent...');
    await this.initFaceDetector();

    // await this.loadModels();
    // console.log('Loaded face-api models...');
  }

  async ionViewWillEnter() {
    console.log('[ionViewWillEnter]: Initializing FaceIDLoginComponent...');
    this.isFaceValid = false;
    this.photoProcessing = false;
    this.photoTaken = false;

    console.log(
      `ionViewWillEnter:\nfaceValid: ${this.isFaceValid}\nphotoTaken: ${this.photoTaken}\nphotoProcessing: ${this.photoProcessing}`
    );

    this.cleanTheDocumentBody();
    console.log('Cleaned document body, ready for camera preview');
  }

  async ionViewDidLeave() {
    console.log('[ionViewDidLeave]: Stopping camera preview...');
    await this.stopCamera();
    console.log('Camera stopped');
  }

  async ionViewDidEnter() {
    console.log('[ionViewDidEnter]: Starting camera preview...');
    this.toast.show(this.translate.instant('login.info'), 5000);
    console.log('toast sent');

    await this.startCamera();
    console.log('Camera started');
  }

  async initFaceDetector() {
    // console.log(
    //   '[initFaceDetector]: Checking MediaPipe Face Detector support...'
    // );
    // fetch(
    //   'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm'
    // )
    //   .then((r) =>
    //     console.log('[initFaceDetector]: WASM fetch status:', r.status)
    //   )
    //   .catch((e) => console.error('[initFaceDetector]: WASM fetch error:', e));

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
      position: 'front',
      parent: 'camera-preview',
      className: 'camera-feed',
      toBack: true, // Pushes native camera behind webview
      width: window.innerWidth,
      height: window.innerHeight,
    };

    CameraPreview.start(options);

    this.ngZone.run(() => {
      this.photoTaken = false;
      this.photoProcessing = false;
    });
  }

  async stopCamera() {
    CameraPreview.stop().catch(() => {});
  }

  async captureImage() {
    this.ngZone.run(() => {
      this.photoTaken = false;
      this.photoProcessing = true;
    });

    const result = await CameraPreview.capture({
      width: window.innerWidth,
      height: window.innerHeight,
      quality: 90,
    });
    const base64 = result.value; // without prefix
    const rotated = await ParseAndFormatUtil.rotateBase64LeftAndFlipVertically(
      base64
    );

    const img = new Image();
    img.src = ParseAndFormatUtil.BASE64_PREFIX + rotated;
    img.id = 'face-preview';
    img.width = window.innerWidth;
    img.height = window.innerHeight;
    document.body.appendChild(img); // creates the effect of taken photo on the screen

    // if longer
    if (img.src.length > ParseAndFormatUtil.BASE64_PREFIX.length) {
      this.ngZone.run(() => {
        this.photoTaken = true;
      });
    }

    console.log('image captured, validating face...');

    await this.validateFace(rotated);
  }

  async retakeImage() {
    try {
      await this.stopCamera();

      this.ngZone.run(() => {
        this.photoTaken = false;
        this.isFaceValid = false;
        this.imageBase64 = '';
      });

      this.cleanTheDocumentBody();

      await this.startCamera();
    } catch (err) {
      console.error('Camera restart failed:', err);
    }
  }

  async login() {
    const request = new FaceLoginRequestDTO();

    this.ngZone.run(() => {
      this.photoProcessing = true;
    });

    request.imageBase64 = ParseAndFormatUtil.cleanBase64FromPrefix(
      this.imageBase64
    );

    this.service.loginWithFace(request).then(
      (res: HttpResponse) => {
        this.handleLoginResponse(res);
      },
      (err) => {
        this.handleLoginError(err);
      }
    );
  }

  async handleLoginResponse(response: HttpResponse) {
    console.log('got data: ', response);

    if (response.status === 200) {
      const responseData: FaceLoginResponseDTO = response.data;

      if (responseData?.id && responseData?.token && responseData?.role) {
        this.credentials.setCredentials(responseData);
      }

      this.cleanTheDocumentBody();
      await this.stopCamera();

      this.router.navigate(['/tabs/home']);

      this.ngZone.run(() => {
        this.photoProcessing = false;
      });
    }

    // custom bad request from backend
    if (response.status === 400) {
      this.ngZone.run(() => {
        this.isFaceValid = false;
        this.photoProcessing = false;
        this.toast.show(this.translate.instant('login.login-failed'), 7000);
      });
    }
  }

  handleLoginError(err: string) {
    console.log('got err: ', err);
    this.cleanTheDocumentBody();

    this.ngZone.run(() => {
      this.isFaceValid = false;
      this.photoProcessing = false;

      this.toast.show(this.translate.instant('login.login-failed'), 7000);
    });
  }

  // using Face API to recognize face and control the status of buttons ;)
  async validateFace(base64Image: string) {
    this.ngZone.run(() => {
      this.photoProcessing = true;
      this.photoTaken = true;
      console.log('photoTaken = ', this.photoTaken);
    });

    if (!this.faceDetector) {
      console.error('Face detector not initialized');
      return;
    }

    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64Image;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    console.log('[FACE]: before detection');
    const detections = this.faceDetector.detect(canvas);
    console.log('[FACE]: after detection: ', detections);

    this.ngZone.run(() => {
      if (!detections || detections.detections.length === 0) {
        this.isFaceValid = false;
        this.photoProcessing = false;
        this.toast.show('Nu am găsit nicio față.');
        return;
      }
    });

    const face = detections.detections[0].boundingBox;

    console.log('face from bounding box: ', face);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = face!.width;
    cropCanvas.height = face!.height;

    const cropCtx = cropCanvas.getContext('2d')!;
    cropCtx.drawImage(
      img,
      face!.originX,
      face!.originY,
      face!.width,
      face!.height,
      0,
      0,
      face!.width,
      face!.height
    );

    this.imageBase64 = cropCanvas.toDataURL('image/jpeg');
    console.log('this.imageBase64: ', this.imageBase64);

    var croppedImg = new Image();
    croppedImg.src = this.imageBase64;
    croppedImg.id = 'cropped-face-image';
    // document.body.appendChild(croppedImg);
    console.log('cropped img: ', croppedImg);

    // Afișează poza decupată în <div id="image-preview-layer">
    // const previewLayer = document.getElementById('image-preview-layer');
    // previewLayer!.innerHTML = '';
    // const previewImg = document.createElement('img');
    // previewImg.src = this.imageBase64;
    // previewImg.classList.add('preview-face');
    // previewLayer!.appendChild(previewImg);

    this.ngZone.run(() => {
      this.isFaceValid = true;
      this.photoProcessing = false;
      console.log('isFaceValid = ', this.isFaceValid);
      console.log('photoProcessing = ', this.photoProcessing);
    });
  }

  cleanTheDocumentBody() {
    document.getElementById('face-preview')?.remove();
    document.getElementById('found-face-preview')?.remove();
    document.getElementById('cropped-face-image')?.remove();
  }

  goBack() {
    this.router.navigate(['/landing'], { replaceUrl: true });
  }

  isReadyToTakePhoto(): boolean {
    // camera
    return !this.photoTaken && !this.isFaceValid && !this.photoProcessing;
  }

  isReadyToRetakePhoto(): boolean {
    // refresh
    return this.photoTaken && !this.isFaceValid && !this.photoProcessing;
  }

  isReadyToLogin(): boolean {
    // checkmark
    return this.photoTaken && this.isFaceValid && !this.photoProcessing;
  }
}
