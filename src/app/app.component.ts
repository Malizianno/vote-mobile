import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonContent,],
})
export class AppComponent {
  constructor() {}
}
