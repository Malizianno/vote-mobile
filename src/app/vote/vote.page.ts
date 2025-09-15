import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
  IonIcon,
  IonNote,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { interval, map, Subscription } from 'rxjs';
import { ExploreContainerComponent } from '../@shared/components/explore-container/explore-container.component';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';
import { AppConstants } from '../@shared/util/app-constants.util';
import { ToastService } from '../@shared/service/toast.service';

@Component({
  selector: 'app-vote',
  templateUrl: 'vote.page.html',
  styleUrls: ['vote.page.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonGrid,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
    IonIcon,
    IonButton,
    IonRow,
    IonCol,
    IonNote,
    TranslateModule,
  ],
})
export class VotePage implements OnDestroy {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  selected = 0;

  hasVoted = false;

  private refreshSub: Subscription;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - vote');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every <AppCOnstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - vote');
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // stop refreshing when tab is left
    }
  }

  constructor(
    private candidatesService: CandidateService,
    private election: ElectionService,
    private credentials: CredentialsService,
    private toast: ToastService,
    private translate: TranslateService,
  ) {
    addIcons({ checkmarkCircleOutline });
    // this.reloadPage();
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  reloadPage() {
    this.hasVoted = this.credentials.hasVoted;

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
        }
      })
    );
  }

  setCandidateSelection(idToSelect: number) {
    this.selected = idToSelect;
  }

  vote(candidate: Candidate) {
    this.election
      .vote(candidate, this.credentials.userID)
      .subscribe((res: boolean) => {
        this.toast.show(this.translate.instant('vote.confirm-vote'));

        this.hasVoted = true;
        this.selected = 0;
        this.credentials.setHasVoted(true);
      });
  }
}
