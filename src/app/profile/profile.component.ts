import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
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
  IonImg,
  IonInput,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  add,
  exit,
  arrowForward,
  checkmarkCircleOutline,
  close,
  refresh,
  arrowForwardCircle,
} from 'ionicons/icons';
import { ElectionActiveComponent } from '../@shared/components/election-active/election-active.component';
import { ExploreContainerComponent } from '../@shared/components/explore-container/explore-container.component';
import { LoginResponseDTO } from '../@shared/model/login.dto';
import {
  User,
  UserGender,
  UserNationality,
  UserProfile,
} from '../@shared/model/user.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ToastService } from '../@shared/service/toast.service';
import { UserService } from '../@shared/service/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
    IonSelect,
    IonSelectOption,
    ExploreContainerComponent,
    ElectionActiveComponent,
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    IonImg,
    CommonModule,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent {
  user: UserProfile = new UserProfile();
  memmoryUser: LoginResponseDTO;

  userAvatar: string;

  nationalities = Object.values(UserNationality).filter(
    (value) => typeof value === 'string'
  );
  genders = Object.values(UserGender).filter(
    (value) => typeof value === 'string'
  );

  constructor(
    private platform: Platform,
    private router: Router,
    private credentials: CredentialsService,
    private users: UserService,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private translate: TranslateService
  ) {
    addIcons({ close, exit, arrowForward, arrowForwardCircle, refresh, add, checkmarkCircleOutline });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.close();
      });
    });

    this.init();
  }

  init() {
    this.memmoryUser = this.credentials.credentials!;

    if (this.memmoryUser) {
      this.getProfile(this.memmoryUser.id);
    } else {
      this.user = this.router.getCurrentNavigation()?.extras.state?.['user'];
      this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(
        this.user.idImage
      ) as string;
    }

    console.log('user opened: ', this.user);
  }

  // let the app choose what the screen is after closure
  close() {
    if (this.user && this.user.id > 0) {
      this.closeToDashboard();
    } else {
      this.closeToLogin();
    }
  }

  closeToDashboard() {
    // go to home tab when back button/close is pressed
    this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }

  closeToLogin() {
    // go to login page after OCRing the data from the ID card
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get loadedData(): boolean {
    return this.user && this.user.cnp > 0;
  }

  getProfile(id: number) {
    this.users.getProfile(id).subscribe({
      next: (res: UserProfile) => {
        this.user = res;
        console.log('user profile: ', this.user);
        this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(
          this.user.idImage
        ) as string;
        console.log('user avatar', this.userAvatar);
      },
      error: (err: HttpErrorResponse) => {
        this.users.handleHTTPErrors(err);
      },
    });
  }

  saveProfile() {
    this.users.saveProfile(this.user).subscribe({
      next: (res: User) => {
        this.toast.show(this.translate.instant('profile.saved'));
        console.log('user profile updated: ', res);

        this.credentials.setCredentials(this.memmoryUser);
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.users.handleHTTPErrors(err);
      },
    });
  }

  captureImage() {
    // WIP: should be implemented to take you to reshoot the photo
  }
}
