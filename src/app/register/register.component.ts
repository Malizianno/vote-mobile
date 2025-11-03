import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
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
  refresh,
  home,
} from 'ionicons/icons';
import Tesseract from 'tesseract.js';
import { ScreenOrientation } from '@capacitor/screen-orientation';

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
  imageDataUrl: string | undefined;
  extractedText: string;
  isCapturing = false;

  constructor(private router: Router) {
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
    this.runOCR(base64);
  }

  async runOCR(imageDataUrl: string | null) {
    if (!imageDataUrl) {
      this.extractedText = 'No image data available.';
      return;
    }

    const result = await Tesseract.recognize(imageDataUrl, 'ron', {
      logger: (m) => console.log(m),
    });
    this.extractedText = result.data.text;
  }
}
