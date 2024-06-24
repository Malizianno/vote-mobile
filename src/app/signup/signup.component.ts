import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { arrowForward } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [IonGrid, IonInput, IonButtons, IonCardContent, IonCardHeader, IonRow, IonCard, IonCol,
    IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent,
    ElectionActiveComponent, IonButton, IonItem, IonIcon, FormsModule, IonGrid
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupComponent {
  appVersion: string;

  constructor(private router: Router, private credentials: CredentialsService,) {
    addIcons({ arrowForward });

    this.appVersion = environment.version;
  }

  swiperSlideChanged($event: any) {
    console.log('changed:', $event);
  }

  openSignupDetails() {
    // TODO: this should redirect to a signup screen where user loads his ID and it is recognised by facial recognition and saves esential data
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
