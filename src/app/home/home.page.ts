import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HomeElementComponent } from '../@shared/components/home-element/home-element.component';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { Election } from '../@shared/model/election.model';
import { SharedService } from '../@shared/service/shared.service';
import { NewsfeedPost } from '../@shared/model/newsfeed-post.model';
import { NewsfeedService } from '../@shared/service/newsfeed.service';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Paging } from '../@shared/model/paging.model';

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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CommonModule,
    TranslateModule,
    LanguageSwitcherComponent,
    NoResultsComponent,
    HomeElementComponent,
  ],
})
export class HomePage implements OnInit {
  selectedElection: Election | null = null;

  newsfeed: NewsfeedPost[] = [];

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
        this.reloadPage();
      }
    });
  }

  goBack() {
    this.location.back();
  }

  reloadPage() {
    this.paging = new Paging();
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
