import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
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
import { Election } from '../@shared/model/election.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';
import { SharedService } from '../@shared/service/shared.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonFabList,
    IonFabButton,
    IonFab,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    TranslateModule,
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  selectedElection: Election | null = null;

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

  ngOnInit(): void {
    this.shared.selectedElection$.subscribe((election) => {
      this.selectedElection = election;
    });
  }

  reloadPage() {
    if (!this.selectedElection) {
      this.getLastElectionActive().subscribe({
        next: (res) => res,
        error: (err) => this.handleNullLastElection(err),
      });
    }
  }

  goToCandidatesPage() {
    this.router.navigate(['/tabs/candidates'], { replaceUrl: true });
  }

  getLastElectionActive() {
    return this.electionService.getLast().pipe(
      map((res: Election) => {
        this.selectedElection = res;
        console.log('(tabs) last election active: ', res);

        this.shared.setSelectedElection(res);
      })
    );
  }

  handleNullLastElection(err: any) {
    console.log('No active election found: ', err);
    this.selectedElection = null;
    this.shared.setSelectedElection(null);
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
