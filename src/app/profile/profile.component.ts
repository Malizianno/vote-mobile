import { CommonModule } from '@angular/common';
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
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  checkmarkCircleOutline,
  refresh,
  add, closeOutline } from 'ionicons/icons';
import { LoginResponseDTO } from '../@shared/model/login.dto';
import { User } from '../@shared/model/user.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { UserService } from '../@shared/service/user.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { HttpErrorResponse } from '@angular/common/http';
import { UserUpdateActionEnum } from '../@shared/util/user-update-action.enum';

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
    ExploreContainerComponent,
    ElectionActiveComponent,
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent {
  user: User = new User();
  memmoryUser: LoginResponseDTO;

  constructor(
    private platform: Platform,
    private router: Router,
    private credentials: CredentialsService,
    private users: UserService
  ) {
    addIcons({closeOutline,add,arrowForward,refresh,checkmarkCircleOutline});

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

  getProfile(id: number) {
    this.users.get(id).subscribe({
      next: (res: User) => {
        this.user = res;
        console.log('user profile: ', this.user);
      },
      error: (err: HttpErrorResponse) => {
        this.users.handleHTTPErrors(err);
      },
    });
  }

  saveProfile() {
    this.user.hasVoted = !!this.user.hasVoted; // to trigger change detection
    this.user.password = this.memmoryUser.token; // keep the same password if not changed

    this.users.save(this.user, UserUpdateActionEnum[UserUpdateActionEnum.PROFILE_UPDATE].toString()).subscribe({
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
}
