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
import { arrowForward, checkmarkCircleOutline, refresh } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { User, UserProfile, UserRole } from '../@shared/model/user.model';
import { UserService } from '../@shared/service/user.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { UserUpdateActionEnum } from '../@shared/util/user-update-action.enum';

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

  constructor(private router: Router, private userService: UserService,) {
    addIcons({ arrowForward, refresh, checkmarkCircleOutline });

    this.appVersion = environment.version;
  }

  swiperSlideChanged($event: any) {
    // console.log('changed:', $event);
  }

  updateCnpManually(newValue: string) {
    this.cnp = newValue;

    this.formatCanVote();
  }

  formatRelevantData() {
    if (this.readText.length < 1) {
      return;
    }

    this.formatName();
    this.fromatCNP();
    this.formatCanVote();
    this.formatIsValid();
  }

  // name (firstName + lastName)
  formatName() {
    const nameIdx = this.readText.findIndex(value => value.text.trim().startsWith("IDROU"));
    let nameUnformatted: string = this.readText[nameIdx].text;
    let nameFormatted = nameUnformatted.trim().substring(5).split("<");

    this.lastName = nameFormatted[0].trim();
    this.firstName = '';

    for (let i = 1; i < nameFormatted.length - 1; i++) {
      this.firstName = this.firstName + ' ' + nameFormatted[i].trim();
    }
  }

  // CNP
  fromatCNP() {
    let cnpIdx = this.readText.findIndex(value => value.text.startsWith("CNP") || value.text.startsWith("CHP"));
    this.cnp = this.readText[cnpIdx].text.substring(cnpIdx).trim();
  }

  // canVote
  formatCanVote() {
    if (this.cnp.substring(0, 1) === '1' || this.cnp.substring(0, 1) === '2') {
      if (1900 + +this.cnp.substring(1, 3) + 17 < +new Date().getFullYear()) {
        this.canVote = true;
      }
    }

    if (this.cnp.substring(0, 1) === '5' || this.cnp.substring(0, 1) === '6') {
      if (+this.cnp.substring(1, 3) + 17 < +new Date().getFullYear().toString().substring(2, 4)) {
        this.canVote = true;
      }
    }
  }

  // isValid
  formatIsValid() {
    const validIdx = this.readText.findIndex(value => value.text.trim().startsWith("Valabilitate"));
    let dates: string[] = this.readText[validIdx + 1].text.split('-');

    if (+dates[1].substring(6) > new Date().getFullYear()) {
      this.idValid = true;
    }
  }

  canSaveUser(): boolean {
    return !!this.cnp && this.cnp.length === 13 &&
      !!this.lastName && this.lastName.length > 0 &&
      !!this.firstName && this.firstName.length > 0;
  }

  saveUser() {
    const user = new UserProfile();

    user.username = this.generateUsername().toLowerCase();
    user.password = this.cnp.substring(this.cnp.length - 6);
    user.role = UserRole.VOTANT;
    user.hasVoted = false;

    // XXX: complete all data to OCR and save to DB now ;)

    console.log('created user: ', user);

    this.userService.saveProfile(user).subscribe((res: User) => {
      if (res && res.id) {
        console.log('user saved successfully!', res);
        this.router.navigate(['/login'], { replaceUrl: true });
      } else {
        console.log('error from BE: ', res);
      }
    });
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

  // lastName + .[firstName]. birthday from CNP
  private generateUsername(): string {
    // add lastName
    let username = this.lastName;
    console.log(this.firstName.split(' '));

    // add all firstNames
    const allFirstNames: string[] = this.firstName.split(' ');
    for (let idx in allFirstNames) {
      console.log('name: ', allFirstNames[idx]);

      if (!!allFirstNames[idx] && allFirstNames[idx].length > 0) {
        username = username + '.' + allFirstNames[idx];
      }
    }

    // add birthday
    username = username + '.' + this.cnp.substring(1, 7);

    return username;
  }
}
