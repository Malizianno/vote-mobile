import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonChip,
} from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { PartyTypeEnum } from '../@shared/util/party-type.enum';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AppConstants } from '../@shared/util/app-constants.util';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonCol,
    IonRow,
    IonGrid,
    IonButton,
    IonCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    CommonModule,
    IonButton,
    IonNote,
    FormsModule,
    NoResultsComponent,
    IonChip,
  ],
})
export class Tab2Page implements OnDestroy {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  parties = Object.keys(PartyTypeEnum).filter((v) => isNaN(Number(v)));

  @ViewChild(IonContent) content: IonContent;

  private refreshSub: Subscription;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - tab2');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every <AppCOnstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - tab2');
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // stop refreshing when tab is left
    }
  }

  constructor(private candidatesService: CandidateService) {
    this.reloadPage();
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  reloadPage() {
    this.getFiltered().subscribe({
      next: (res) => res,
      error: (err) => this.candidatesService.handleHTTPErrors(err),
    });
  }

  getFiltered() {
    return this.candidatesService.getFiltered(this.filter, this.paging).pipe(
      map((res) => {
        if (res && this.candidates != res.candidates) {
          this.candidates = Candidate.fromArray(res.candidates);
          this.totalCandidates = res.total;
          console.log('candidates: ', this.candidates);
        }
      })
    );
  }

  openMoreAbout() {
    // WIP: open new page with more about the candidate
    console.log('clicked on more...');
  }

  scrollToTop() {
    // Passing a duration to the method makes it so the scroll slowly
    // goes to the top instead of instantly
    this.content.scrollToTop(500);
  }

  parseParty(party: string) {
    if ('ALL' === party) {
      return 'Toate';
    }
    return party;
  }
}
