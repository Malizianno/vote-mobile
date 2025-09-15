import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionActiveComponent } from '../@shared/components/election-active/election-active.component';
import { ExploreContainerComponent } from '../@shared/components/explore-container/explore-container.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
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
    TranslateModule,
  ],
})
export class LandingComponent {
  appVersion: string;

  constructor(private router: Router, private credentials: CredentialsService) {
    addIcons({ arrowForward });

    this.appVersion = environment.version;
  }

  login() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  signup() {
    this.router.navigate(['/signup-info'], { replaceUrl: true });
  }
}
