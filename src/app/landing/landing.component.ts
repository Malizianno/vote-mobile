import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, FormsModule, TranslateModule],
})
export class LandingComponent implements OnInit {
  appVersion: string;
  startAnimation = false;

  constructor(private router: Router) {
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

  loginWithFaceID() {
    this.router.navigate(['/face-id-login'], { replaceUrl: true });
  }

  register() {
    this.router.navigate(['/register'], { replaceUrl: true });
  }
}
