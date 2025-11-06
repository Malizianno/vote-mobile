import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { HttpResponse } from '@capacitor/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import * as faceapi from 'face-api.js';
import { addIcons } from 'ionicons';
import { arrowForward, camera, checkmark, refresh } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import {
  FaceLoginRequestDTO,
  FaceLoginResponseDTO,
} from '../@shared/model/login.dto';
import { CredentialsService } from '../@shared/service/credentials.service';
import { LoginService } from '../@shared/service/login.service';
import { ParseAndFormatUtil } from '../@shared/util/parse-and-format.util';

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
    IonFabButton,
    IonFab,
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
    CommonModule,
    IonGrid,
    TranslateModule,
  ],
})
export class FaceIDLoginComponent implements AfterViewInit, OnInit {
  appVersion: string;
  imageBase64: string = '';

  isFaceValid = false;
  isPhotoTaken = false;

  constructor(
    private platform: Platform,
    private service: LoginService,
    private credentials: CredentialsService,
    private router: Router,
    private ngZone: NgZone
  ) {
    addIcons({ camera, refresh, checkmark, arrowForward });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.close();
      });
    });

    this.appVersion = environment.version;
  }

  async ngOnInit(): Promise<void> {
    await this.loadModels();
    console.log('Loaded face-api models...');
  }

  ngAfterViewInit(): void {
    this.startCamera();
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
  }

  async stopCamera() {
    CameraPreview.stop().catch(() => {});
  }

  async captureImage() {
    this.ngZone.run(() => {
      this.isPhotoTaken = false;
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
        this.isPhotoTaken = true;
      });
    }

    await this.validateFace(rotated);
  }

  async loadModels() {
    const MODEL_URL = '/assets/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  }

  async retakeImage() {
    try {
      await this.stopCamera();

      this.ngZone.run(() => {
        this.isPhotoTaken = false;
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
    request.imageBase64 = this.imageBase64;
    this.service.loginWithFace(request).then(
      (res: HttpResponse) => {
        this.handleLoginResponse(res);
      },
      (err) => {
        this.handleLoginError(err);
      }
    );
  }

  handleLoginResponse(response: HttpResponse) {
    console.log('got data: ', response);

    if (response.status === 200) {
      const responseData: FaceLoginResponseDTO = response.data;

      if (responseData?.id && responseData?.token && responseData?.role) {
        this.credentials.setCredentials(responseData);
      }

      this.router.navigate(['/tabs/home']);
    }
  }

  handleLoginError(err: string) {
    console.log('got err: ', err);
  }

  // using Face API to recognize face and control the status of buttons ;)
  async validateFace(base64Image: string) {
    // crop faceImage using canvas
    const faceImg = new Image();
    faceImg.src = ParseAndFormatUtil.BASE64_PREFIX + base64Image;
    faceImg.id = 'found-face-preview';
    faceImg.width = window.innerWidth;
    faceImg.height = window.innerHeight;
    document.body.appendChild(faceImg); // creates the effect of taken photo on the screen

    console.log('finding face image: ', faceImg);

    faceImg.onload = async () => {
      const detection = await faceapi
        .detectSingleFace(faceImg)
        .withFaceLandmarks();

      if (detection) {
        const { box } = detection.detection;

        const canvas = document.createElement('canvas');
        canvas.width = box.width;
        canvas.height = box.height;

        const ctx = canvas.getContext('2d');
        ctx!.drawImage(
          faceImg,
          box.x,
          box.y,
          box.width,
          box.height,
          0,
          0,
          box.width,
          box.height
        );
        const faceImageDataUrl = canvas.toDataURL('image/jpeg');

        // log the photo:
        canvas.toBlob(async (faceBlob) => {
          const base64Image = URL.createObjectURL(faceBlob!);
          const faceCroppedImage = new Image();
          faceCroppedImage.src = base64Image;
          faceCroppedImage.id = 'cropped-face-image';
          document.body.appendChild(faceCroppedImage);
          // console.log('Cropped Face Blob:', faceCroppedImage);

          if (faceCroppedImage) {
            this.ngZone.run(() => {
              this.isFaceValid = true;
            });
          }
        });

        this.imageBase64 = canvas.toDataURL('image/jpeg');
        // console.log(`image as base64? : ${this.imageBase64}`);

        return faceImageDataUrl;
      }

      return null;
    };

    return null;
  }

  cleanTheDocumentBody() {
    document.getElementById('face-preview')?.remove();
    document.getElementById('found-face-preview')?.remove();
    document.getElementById('cropped-face-image')?.remove();
  }

  close() {
    this.cleanTheDocumentBody();
    this.router.navigate(['/landing'], { replaceUrl: true });
  }
}
