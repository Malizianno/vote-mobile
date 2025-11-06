import { Component } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import {
  FaceLoginRequestDTO,
  FaceLoginResponseDTO,
} from '../@shared/model/login.dto';
import { CredentialsService } from '../@shared/service/credentials.service';
import { LoginService } from '../@shared/service/login.service';

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
export class FaceIDLoginComponent {
  appVersion: string;
  imageBase64: string = '';

  constructor(
    private service: LoginService,
    private credentials: CredentialsService,
    private router: Router
  ) {
    addIcons({ arrowForward });

    this.appVersion = environment.version;
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
    const result = await CameraPreview.capture({ quality: 90 });
    this.imageBase64 = result.value;
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
}
