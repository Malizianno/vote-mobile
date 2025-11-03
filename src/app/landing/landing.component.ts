import { Component, OnInit } from '@angular/core';
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
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../@shared/service/credentials.service';

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
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    TranslateModule,
  ],
})
export class LandingComponent implements OnInit {
  appVersion: string;
  startAnimation = false;

  constructor(private router: Router, private credentials: CredentialsService) {
    this.appVersion = environment.version;
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.startAnimation = true;
    }, 500); // Delay before animation starts

  }

  login() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  signup() {
    this.router.navigate(['/signup-info'], { replaceUrl: true });
  }
}
