import { Component, EnvironmentInjector, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  banOutline,
  closeOutline,
  ellipse,
  exit,
  homeOutline,
  people,
  person,
  square,
  today,
  triangle,
} from 'ionicons/icons';
import { map } from 'rxjs';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { ElectionCampaignDTO } from '../@shared/model/campaign.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonFabList,
    IonFabButton,
    IonFab,
    IonButtons,
    IonButton,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslateModule,
    LanguageSwitcherComponent,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  electionEnabled: boolean;

  constructor(
    private router: Router,
    private election: ElectionService,
    private credentials: CredentialsService
  ) {
    addIcons({
      person,
      exit,
      homeOutline,
      people,
      today,
      closeOutline,
      banOutline,
      triangle,
      ellipse,
      square,
    });
    this.reloadPage();
  }

  reloadPage() {
    this.getElectionStatus().subscribe({
      next: (res) => res,
      error: (err) => this.election.handleHTTPErrors(err),
    });
  }

  goToCandidatesPage() {
    this.router.navigate(['/tabs/candidates'], { replaceUrl: true });
  }

  getElectionStatus() {
    return this.election.getStatus().pipe(
      map((res: ElectionCampaignDTO) => {
        this.electionEnabled = res.enabled;
        console.log('(tabs) electionEnabled: ', res);
      })
    );
  }

  goToProfile() {
    this.router.navigate(['/profile'], { replaceUrl: true });
  }

  logout() {
    this.credentials.setCredentials();
    this.router.navigate(['/landing'], { replaceUrl: true });
  }
}
