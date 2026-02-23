import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HomeElementComponent } from '../@shared/components/home-element/home-element.component';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Election } from '../@shared/model/election.model';
import { NewsfeedPost } from '../@shared/model/newsfeed-post.model';
import { Paging } from '../@shared/model/paging.model';
import { NewsfeedService } from '../@shared/service/newsfeed.service';
import { SharedService } from '../@shared/service/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonText,
    IonContent,
    CommonModule,
    TranslateModule,
    LanguageSwitcherComponent,
    NoResultsComponent,
    HomeElementComponent,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  selectedElection: Election | null = null;

  newsfeed: NewsfeedPost[] = [];

  intervalId: any;

  filter: NewsfeedPost = new NewsfeedPost();
  paging: Paging = new Paging();

  constructor(
    private shared: SharedService,
    private location: Location,
    private platform: Platform,
    private service: NewsfeedService
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

      if (this.selectedElection!.id) {
        this.intervalId = setInterval(() => {
          if (this.newsfeed.length < 1) {
            this.reloadPage();
          }
        }, 3000);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  goBack() {
    this.location.back();
  }

  async reload(event: any) {
    await this.reloadPage();

    setTimeout(() => {
      event.target.complete(); // stop the spinner
    }, 1000);
  }

  reloadPage() {
    this.paging = new Paging();
    this.paging.size = 50; // XXX: hardcoded to be big enough
    this.filter = new NewsfeedPost();
    this.filter.electionId = this.selectedElection?.id!;
    this.updateNewsfeed();
  }

  updateNewsfeed() {
    console.log('filter: ', this.filter);
    this.service
      .getNewsfeedFiltered(this.filter, this.paging)
      .subscribe((news) => {
        console.log('loaded news:', news);

        if (news && news.posts && news.posts.length > 0) {
          this.newsfeed = NewsfeedPost.fromArray(news.posts);
        }
      });
  }

  loadMore(event: any) {
    this.paging.page++;

    var retryCount = 3;
    while (retryCount > 0) {
      setInterval(() => {
        this.updateNewsfeed();
      }, 5000); // 5 seconds

      retryCount--;
    }
  }
}
