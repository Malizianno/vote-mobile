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
import { ElectionService } from '../@shared/service/election.service';
import { AppConstants } from '../@shared/util/app-constants.util';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    ElectionActiveComponent,
    CommonModule,
    TranslateModule,
  ],
})
export class Tab1Page implements OnDestroy {
  electionEnabled = false;

  private refreshSub: Subscription;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - tab1');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every every <AppCOnstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - tab1');
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
      map((res) => {
        this.electionEnabled = res;
        console.log('(tab1) electionEnabled: ', this.electionEnabled);
      })
    );
  }
}
