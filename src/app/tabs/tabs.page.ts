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
  layersOutline,
  people,
  person,
  square,
  today,
  triangle,
} from 'ionicons/icons';
import { map } from 'rxjs';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { Election } from '../@shared/model/election.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';
import { SharedService } from '../@shared/service/shared.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss'],
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
    ]
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  election: Election | null = null;

  constructor(
    private router: Router,
    private electionService: ElectionService,
    private credentials: CredentialsService,
    private shared: SharedService
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
      layersOutline,
    });
    this.reloadPage();
  }

  reloadPage() {
    const selectedElection = this.shared.getSelectedElection();

    if (!selectedElection) {
      this.getLastElectionActive().subscribe({
        next: (res) => res,
        error: (err) => this.electionService.handleHTTPErrors(err),
      });
    }
  }

  goToCandidatesPage() {
    this.router.navigate(['/tabs/candidates'], { replaceUrl: true });
  }

  getLastElectionActive() {
    return this.electionService.getLast().pipe(
      map((res: Election) => {
        this.election = res;
        console.log('(tabs) last election active: ', res);

        this.shared.setSelectedElection(res);
      })
    );
  }

  goToProfile() {
    this.router.navigate(['/profile'], { replaceUrl: true });
  }

  goToElectionSelector() {
    this.router.navigate(['/elections'], { replaceUrl: true });
  }

  logout() {
    this.credentials.setCredentials();
    this.router.navigate(['/landing'], { replaceUrl: true });
  }
}
