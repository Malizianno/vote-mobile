import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, PermissionStatus } from '@capacitor/camera';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import {
  IonButton, IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput, IonItem,
  IonRow,
  IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForward, camera, checkmarkOutline, refresh, stopOutline } from 'ionicons/icons';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-signup-details',
  templateUrl: './signup-details.component.html',
  styleUrls: ['./signup-details.component.scss'],
  standalone: true,
  imports: [IonGrid, IonInput, IonButtons, IonCardContent, IonCardHeader, IonRow, IonCard, IonCol,
    IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent,
    ElectionActiveComponent, IonButton, IonItem, IonIcon, FormsModule, IonGrid, CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupDetailsComponent {
  image: any; //Base64 to save
  imagePreview: any; //For displaying on screen
  cameraActive = false;

  constructor(private router: Router, private credentials: CredentialsService,) {
    addIcons({ arrowForward, camera, checkmarkOutline, stopOutline, refresh });

    this.checkPermissions();
  }

  checkPermissions() {
    Camera.checkPermissions().then((permission: PermissionStatus) => {
      // console.log('permission: ', permission);

      if (permission.camera !== 'granted') {
        Camera.requestPermissions({ permissions: ['camera'] })
          .then(permission => console.log('camera permission requested: ', permission),
            error => console.log('error: ', error));
      }

      if (permission.photos !== 'granted') {
        Camera.requestPermissions({ permissions: ['photos'] })
          .then(permission => console.log('photos permission requested: ', permission),
            error => console.log('error: ', error));
      }
    }, error => console.log('error: ', error)).then(() => {
      this.startCameraPreview();
    })
  }

  startCameraPreview() {
    console.log('started camera preview... ');
    this.imagePreview = null;
    this.image = null;

    const options: CameraPreviewOptions = {
      parent: 'cameraPreview',
      className: 'cameraPreview',
      width: window.screen.width,
      height: window.screen.height * 0.8,
      toBack: false,
      position: 'rear',
      enableOpacity: true,
    }

    CameraPreview.start(options).then(() => {
      CameraPreview.setOpacity({ opacity: 0.4 });
    });

    this.cameraActive = true;
  }

  async stopCamera() {
    console.log('Stopping camera');

    await CameraPreview.stop();

    this.cameraActive = false;
  }

  async captureImage() {
    const CameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90
    }

    await CameraPreview.capture(CameraPreviewPictureOptions).then(result => {
      this.imagePreview = 'data:image/jpeg;base64,' + result.value;
      this.image = result.value;
  
      console.log('imagePreview: ', this.imagePreview);
      console.log('image: ', this.image);
  
      this.stopCamera();
    });
  }

  processImage() {
    console.log('image to process: \n', this.image);

    // WIP: OCR the data
  }
}
