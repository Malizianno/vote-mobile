import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { HomeElementComponent } from '../@shared/components/home-element/home-element.component';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { Election } from '../@shared/model/election.model';
import { SharedService } from '../@shared/service/shared.service';
import { AppConstants } from '../@shared/util/app-constants.util';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonText,
        IonContent,
        CommonModule,
        TranslateModule,
        LanguageSwitcherComponent,
        HomeElementComponent,
    ]
})
export class HomePage implements OnDestroy {
  election: Election | null = null;

  private refreshSub: Subscription;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - home');
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

  constructor(private shared: SharedService) {
    this.reloadPage();
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  reloadPage() {
    this.election = this.shared.getSelectedElection();
  }
}
