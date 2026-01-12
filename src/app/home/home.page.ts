import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HomeElementComponent } from '../@shared/components/home-element/home-element.component';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { Election } from '../@shared/model/election.model';
import { SharedService } from '../@shared/service/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
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
  ],
})
export class HomePage implements OnInit {
  selectedElection: Election | null = null;

  constructor(
    private shared: SharedService,
    private location: Location,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.goBack();
      });
    });
  }

  ngOnInit(): void {
    this.shared.selectedElection$.subscribe((election) => {
      this.selectedElection = election;
    });
  }

  goBack() {
    this.location.back();
  }
}
