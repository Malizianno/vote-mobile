import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { interval, map, Subscription } from 'rxjs';
import { HomeElementComponent } from '../@shared/components/home-element/home-element.component';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { ElectionCampaignDTO } from '../@shared/model/campaign.model';
import { ElectionService } from '../@shared/service/election.service';
import { AppConstants } from '../@shared/util/app-constants.util';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    TranslateModule,
    LanguageSwitcherComponent,
    HomeElementComponent,
  ],
})
export class HomePage implements OnDestroy {
  electionEnabled = false;

  private refreshSub: Subscription;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - home');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every every <AppCOnstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - home');
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // stop refreshing when tab is left
    }
  }

  constructor(private election: ElectionService) {
    // this.reloadPage();
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  reloadPage() {
    this.getElectionStatus().subscribe({
      next: (res) => res,
      error: (err) => this.election.handleHTTPErrors(err),
    });
  }

  getElectionStatus() {
    return this.election.getStatus().pipe(
      map((res: ElectionCampaignDTO) => {
        this.electionEnabled = res.enabled;
        console.log('(home) electionEnabled: ', res);
      })
    );
  }
}
