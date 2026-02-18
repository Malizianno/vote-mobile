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
import { NewsfeedPost } from '../@shared/model/newsfeed-post.model';
import { NewsfeedService } from '../@shared/service/newsfeed.service';

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
  newsfeed: NewsfeedPost[] = [];

  constructor(
    private shared: SharedService,
    private location: Location,
    private platform: Platform,
    private service: NewsfeedService,
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

    this.reloadPage();
  }

  goBack() {
    this.location.back();
  }

  reloadPage() {
    this.updateNewsfeed();
  }

  updateNewsfeed() {
    this.service.getNewsfeedAll().subscribe((news) => {
      console.log("loaded news:", news);

      if (news) {
        this.newsfeed = NewsfeedPost.fromArray(news);
      }
    });
  }
}
