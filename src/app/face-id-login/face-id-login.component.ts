import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import * as faceapi from 'face-api.js';
import { addIcons } from 'ionicons';
import { arrowForward, refresh, camera } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import {
  FaceLoginRequestDTO,
  FaceLoginResponseDTO,
} from '../@shared/model/login.dto';
import { CredentialsService } from '../@shared/service/credentials.service';
import { LoginService } from '../@shared/service/login.service';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { ParseAndFormatUtil } from '../@shared/util/parse-and-format.util';

// XXX: TESTING: Ensure camera stops when navigating away (livereload issue)
window.addEventListener('beforeunload', () => {
  CameraPreview.stop().catch(() => {});
  // ScreenOrientation.unlock();
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
    IonGrid,
    TranslateModule,
  ],
})
export class FaceIDLoginComponent implements AfterViewInit, OnInit {
  private BASE64_PREFIX = 'data:image/jpeg;base64,';

  appVersion: string;
  imageBase64: string = '';

  constructor(
    private service: LoginService,
    private credentials: CredentialsService,
    private router: Router
  ) {
    addIcons({ camera, refresh, arrowForward });

    this.appVersion = environment.version;
  }

  async ngOnInit(): Promise<void> {
    await this.loadModels();
    console.log('Loaded face-api models...');
  }

  ngAfterViewInit(): void {
    this.startCamera();
  }

  // ionViewWillEnter() {
  //   ScreenOrientation.lock({ orientation: 'portrait' });
  // }

  // ionViewWillLeave() {
  //   ScreenOrientation.unlock(); // or reset to default
  // }

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
    const result = await CameraPreview.capture({
      width: window.innerWidth,
      height: window.innerHeight,
      quality: 90,
    });
    const base64 = result.value; // without prefix
    const rotated = await this.rotateBase64Left(base64);

    const img = new Image();
    img.src = this.BASE64_PREFIX + rotated;
    img.id = 'face-preview';
    img.width = window.innerWidth;
    img.height = window.innerHeight;
    document.body.appendChild(img); // creates the effect of taken photo on the screen

    const croppedFace = this.faceCrop(base64);

    // console.log('captured image: ', base64);
    // console.log('cropped image: ', croppedFace);
  }

  async loadModels() {
    const MODEL_URL = '/assets/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
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
  private faceCrop(base64Image: string): string {
    return base64Image;
  }

  private rotateBase64Left(base64: string): Promise<string> {
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
}
