import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ocr } from '@capacitor-community/image-to-text';
import {
  Camera,
  CameraResultType,
  CameraSource,
  ImageOptions,
} from '@capacitor/camera';
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
import { arrowForward, checkmarkCircleOutline, refresh } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import {
  UserGender,
  UserNationality,
  UserProfile,
} from '../@shared/model/user.model';
import { UserService } from '../@shared/service/user.service';

@Component({
  selector: 'app-signup-info',
  templateUrl: './signup-info.component.html',
  styleUrls: ['./signup-info.component.scss'],
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
export class SignupInfoComponent {
  appVersion: string;

  image: any; // URI to OCR
  imagePreview: any; //For displaying on screen ??
  imageBase64: any; // For sending to backend

  readText: any[] = [];

  canVote: boolean = false;

  constructor(private router: Router, private userService: UserService) {
    addIcons({ arrowForward, refresh, checkmarkCircleOutline });

    this.appVersion = environment.version;
  }

  swiperSlideChanged($event: any) {
    // console.log('changed:', $event);
  }

  formatRelevantData(): UserProfile {
    if (this.readText.length < 1) {
      return new UserProfile();
    }

    let userProfile = new UserProfile();

    userProfile.idImage = this.imageBase64;
    userProfile.cnp = this.getFormattedCNP();
    userProfile.firstname = this.getFormattedFirstname();
    userProfile.lastname = this.getFormattedLastname();
    userProfile.idSeries = this.getFormattedIDSeries();
    userProfile.idNumber = +this.getFormattedIDNumber();
    userProfile.nationality = this.getFormattedNationality();
    userProfile.gender = this.getFormattedGender();
    userProfile.birthAddress = this.getFormattedBirthAddress();
    userProfile.residenceAddress = this.getFormattedResidenceAddress();
    userProfile.validityStartDate = this.getFormattedStartValidityDate();
    userProfile.validityEndDate = this.getFormattedEndValidityDate();

    this.formatCanVote(userProfile.cnp.toString());

    return userProfile;
  }

  // firstName
  getFormattedFirstname() {
    const nameIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('Prenume')
    );
    let nameUnformatted: string = this.readText[nameIdx + 1].text;

    return nameUnformatted.trim();
  }

  getFormattedLastname() {
    const nameIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('Nume')
    );
    let nameUnformatted: string = this.readText[nameIdx + 1].text;

    return nameUnformatted.trim();
  }

  // CNP
  getFormattedCNP(): number {
    let cnpIdx = this.readText.findIndex(
      (value) => value.text.startsWith('CNP') || value.text.startsWith('CHP')
    );
    return +this.readText[cnpIdx].text.substring(cnpIdx - 1).trim();
  }

  // ID series
  getFormattedIDSeries(): string {
    const seriesIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('SERIA')
    );
    let seriesUnformatted: string = this.readText[seriesIdx].text;
    return seriesUnformatted.trim().substring(5, 8).trim();
  }

  // ID number
  getFormattedIDNumber(): string {
    const numberIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('SERIA')
    );
    let numberUnformatted: string = this.readText[numberIdx].text;
    return numberUnformatted
      .trim()
      .substring(11, numberUnformatted.length)
      .trim();
  }

  // nationality
  getFormattedNationality(): UserNationality {
    const natIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('Cetatenie')
    );
    let natUnformatted: string = this.readText[natIdx + 1].text;

    return natUnformatted.trim().includes('Română')
      ? UserNationality.ROMANIAN
      : UserNationality.FOREIGNER;
  }

  // birth address
  getFormattedBirthAddress(): string {
    const addrIdx = this.readText.findIndex((value) =>
      value.text.trim().includes('nastere')
    );
    let addrUnformatted: string = this.readText[addrIdx + 1].text;
    return addrUnformatted.trim();
  }

  // residence address
  getFormattedResidenceAddress(): string {
    const addrIdx = this.readText.findIndex((value) =>
      value.text.trim().includes('addres')
    );
    let addrUnformatted: string = this.readText[addrIdx + 1].text;
    return addrUnformatted.trim();
  }

  // gender
  getFormattedGender(): UserGender {
    const genderIdx = this.readText.findIndex((value) =>
      value.text.trim().startsWith('Sex')
    );
    let genderUnformatted: string = this.readText[genderIdx + 1].text;
    return genderUnformatted.trim() === 'M'
      ? UserGender.MALE
      : genderUnformatted.trim() === 'F'
      ? UserGender.FEMALE
      : UserGender.OTHER;
  }

  // validity dates
  getFormattedValidityDates(): string[] {
    const valIdx = this.readText.findIndex(
      (value) =>
        value.text.trim().startsWith('Valabilitate') ||
        value.text.trim().includes('Validity')
    );
    let valUnformatted: string = this.readText[valIdx + 1].text;
    return valUnformatted.trim().split('-');
  }

  getFormattedStartValidityDate(): number {
    return +new Date(this.getFormattedValidityDates()[0].trim());
  }

  getFormattedEndValidityDate(): number {
    return +new Date(this.getFormattedValidityDates()[1].trim());
  }

  // canVote
  formatCanVote(cnp: string) {
    if (cnp.substring(0, 1) === '1' || cnp.substring(0, 1) === '2') {
      if (1900 + +cnp.substring(1, 3) + 17 < +new Date().getFullYear()) {
        this.canVote = true;
      }
    }

    if (cnp.substring(0, 1) === '5' || cnp.substring(0, 1) === '6') {
      if (
        +cnp.substring(1, 3) + 17 <
        +new Date().getFullYear().toString().substring(2, 4)
      ) {
        this.canVote = true;
      }
    }
  }

  async captureImage() {
    const options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    };

    const photo = await Camera.getPhoto(options).then((photo) => {
      // console.log('photo: ', photo);
      this.imagePreview = photo.webPath;
      this.image = photo.path;

      // Get JPEG file from URI
      const response = fetch(photo.webPath!);
      response.then((response) => {
        response.blob().then((blob) => {
          const jpegFile = new File([blob], 'photo.jpg', {
            type: 'image/jpeg',
          });

          // Convert JPEG Blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            this.imageBase64 = base64String;
            // console.log('Base64:', base64String);
          };
          reader.readAsDataURL(jpegFile);

          this.processImage();
        });
      });
    });
  }

  async processImage() {
    // console.log('image to process: \n', this.image);

    await Ocr.detectText({ filename: this.image }).then((data) => {
      this.readText = data.textDetections;

      // console.log('readText: \n', this.readText);

      const user = this.formatRelevantData();

      // redirect to profile page
      this.router.navigate(['/profile'], {
        replaceUrl: true,
        state: {
          user: user,
        },
      });
    });
  }
}
