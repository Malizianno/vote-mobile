import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  IonInput,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  arrowForward,
  checkmarkCircleOutline,
  closeOutline,
  refresh,
} from 'ionicons/icons';
import { LoginResponseDTO } from '../@shared/model/login.dto';
import {
  User,
  UserGender,
  UserNationality,
  UserProfile,
} from '../@shared/model/user.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { UserService } from '../@shared/service/user.service';
import { UserUpdateActionEnum } from '../@shared/util/user-update-action.enum';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { DomSanitizer } from '@angular/platform-browser';

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
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      closeOutline,
      add,
      arrowForward,
      refresh,
      checkmarkCircleOutline,
    });

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

    this.getProfile(this.memmoryUser.id);
  }

  close() {
    // go to tab1 when back button/close is pressed
    this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
  }

  get loadedData(): boolean {
    return this.user && this.user.id > 0;
  }

  getProfile(id: number) {
    this.users.getProfile(id).subscribe({
      next: (res: UserProfile) => {
        this.user = res;
        console.log('user profile: ', this.user);
        this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(this.user.idImage) as string;
        console.log('user avatar', this.userAvatar);
      },
      error: (err: HttpErrorResponse) => {
        this.users.handleHTTPErrors(err);
      },
    });
  }

  saveProfile() {
    // this.user.hasVoted = !!this.user.hasVoted; // to trigger change detection
    this.user.password = this.memmoryUser.token; // keep the same password if not changed

    this.users.saveProfile(this.user).subscribe({
      next: (res: User) => {
        // this.user = res;
        console.log('user profile updated: ', this.user);
        this.credentials.setCredentials(this.memmoryUser);
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.users.handleHTTPErrors(err);
      },
    });
  }

  private createImageFromBlob(blob: Blob) {
    const reader = new FileReader();

    reader.onload = () => {
      this.userAvatar = reader.result as string;
      console.log('user avatar', this.userAvatar);
    };
    
    reader.readAsDataURL(blob);
  }
}
