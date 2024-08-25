import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ocr } from '@capacitor-community/image-to-text';
import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
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
import { arrowForward, refresh } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-signup-info',
  templateUrl: './signup-info.component.html',
  styleUrls: ['./signup-info.component.scss'],
  standalone: true,
  imports: [IonGrid, IonInput, IonButtons, IonCardContent, IonCardHeader, IonRow, IonCard, IonCol,
    IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent,
    ElectionActiveComponent, IonButton, IonItem, IonIcon, FormsModule, IonGrid, CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupInfoComponent {
  appVersion: string;
  infoActive = true;

  image: any; //Base64 to save
  imagePreview: any; //For displaying on screen

  readText: any[] = [];

  firstName: string;
  lastName: string;
  cnp: string;
  idValid: boolean = false;
  canVote: boolean = false;

  constructor(private router: Router, private credentials: CredentialsService,) {
    addIcons({ arrowForward, refresh });

    this.appVersion = environment.version;
  }

  swiperSlideChanged($event: any) {
    // console.log('changed:', $event);
  }

  formatRelevantData() {
    if (this.readText.length < 1) {
      return;
    }

    // name (firstName + lastName)

    const nameIdx = this.readText.findIndex(value => value.text.trim().startsWith("IDROU"));
    let nameUnformatted: string = this.readText[nameIdx].text;
    let nameFormatted = nameUnformatted.trim().substring(5).split("<");

    this.lastName = nameFormatted[0];
    this.firstName = '';

    for (let i = 1; i < nameFormatted.length - 1; i++) {
      this.firstName = this.firstName + ' ' + nameFormatted[i].trim();
    }

    // CNP
    const cnpIdx = this.readText.findIndex(value => value.text.trim().startsWith("CNP"));
    this.cnp = this.readText[cnpIdx].text.substring(cnpIdx).trim();
    
    // canVote
    if (this.cnp.substring(0, 1) === '1' || this.cnp.substring(0, 1) === '2') {
      if (1900 + +this.cnp.substring(1, 3) + 17 < +new Date().getFullYear()) {
        this.canVote = true;
      }
    }

    if (this.cnp.substring(0, 1) === '5' || this.cnp.substring(0, 1) === '6') {
      if (+this.cnp.substring(1 ,3) + 17 < +new Date().getFullYear().toString().substring(2 ,4)) {
        this.canVote = true;
      }
    }
    
    // isValid
    const validIdx = this.readText.findIndex(value => value.text.trim().startsWith("Valabilitate"));
    let dates: string[] =  this.readText[validIdx + 1].text.split('-');
    
    if (+dates[1].substring(6) > new Date().getFullYear()) {
      this.idValid = true;
    }
  }

  async captureImage() {
    const options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    };

    await Camera.getPhoto(options).then(photo => {
      // console.log('photo: ', photo);
      this.imagePreview = photo.webPath;
      this.image = photo.path;

      this.infoActive = false;
      this.processImage();
    });
  }

  async processImage() {
    // console.log('image to process: \n', this.image);

    await Ocr.detectText({ filename: this.image }).then(data => {
      this.readText = data.textDetections;

      this.formatRelevantData();
    });
  }
}
