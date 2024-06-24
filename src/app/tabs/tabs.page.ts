import { Component, EnvironmentInjector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar, IonButton, IonButtons, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { banOutline, ellipse, homeOutline, people, square, triangle, person, exit } from 'ionicons/icons';
import { ElectionService } from '../@shared/service/election.service';
import { map } from 'rxjs';
import { CredentialsService } from '../@shared/service/credentials.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonFabList, IonFabButton, IonFab, IonButtons, IonButton, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent,],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  electionEnabled: boolean;

  constructor(private router: Router, private election: ElectionService, private credentials: CredentialsService,) {
    addIcons({ triangle, ellipse, square, people, banOutline, homeOutline, person, exit, });
    this.reloadPage();
  }

  reloadPage() {
    this.getElectionStatus().subscribe({
      next: res => res,
      error: err => this.election.handleHTTPErrors(err)
    });
  }

  goToTab2() {
    this.router.navigate(['/tabs/tab2'], { replaceUrl: true });
  }

  getElectionStatus() {
    return this.election.getStatus().pipe(map((res) => {
      this.electionEnabled = res;
      console.log('(tabs) electionEnabled: ', this.electionEnabled);
    }));
  }

  logout() {
    this.credentials.setCredentials();
    this.router.navigate(['/landing'], { replaceUrl: true });
  }
}
