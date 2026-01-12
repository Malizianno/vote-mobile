import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { interval, map, Subscription } from 'rxjs';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Candidate } from '../@shared/model/candidate.model';
import { Election } from '../@shared/model/election.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';
import { SharedService } from '../@shared/service/shared.service';
import { ToastService } from '../@shared/service/toast.service';
import { AppConstants } from '../@shared/util/app-constants.util';
import { ModalConfirmVoteComponent } from './modal-confirm-vote/modal-confirm-vote.component';

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
    IonContent,
    CommonModule,
    IonIcon,
    IonButton,
    IonRow,
    IonCol,
    IonThumbnail,
    TranslateModule,
    NoResultsComponent,
    LanguageSwitcherComponent,
  ],
})
export class VotePage implements OnInit, OnDestroy {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  selected = 0;

  selectedCandidate: Candidate;
  selectedElection: Election | null = null;

  hasVoted = false;
  isModalOpen = false;

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
    private modalCtrl: ModalController,
    private shared: SharedService,
    private platform: Platform,
    private location: Location
  ) {
    addIcons({ checkmarkCircleOutline });

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

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  reloadPage() {
    this.hasVoted = this.credentials.hasVoted;

    this.getAllForElection(this.selectedElection?.id).subscribe({
      next: (res) => res,
      error: (err) => this.candidatesService.handleHTTPErrors(err),
    });
  }

  goBack() {
    this.location.back();
  }

  getAllForElection(id: number | undefined) {
    return this.candidatesService.getAllForElection(id).pipe(
      map((res) => {
        if (res && this.candidates != res) {
          this.candidates = Candidate.fromArray(res);
          this.totalCandidates = res.length;
        }
      })
    );
  }

  setCandidateSelection(idToSelect: number) {
    if (this.selected === idToSelect) {
      this.selected = -1; // unselect
      return;
    }

    this.selected = idToSelect;
  }

  async openConfirmModal(candidate: Candidate) {
    const modal = await this.modalCtrl.create({
      component: ModalConfirmVoteComponent,
      componentProps: { candidate: candidate },
      cssClass: 'modal-vote-confirm',
      breakpoints: [0, 0.75],
      initialBreakpoint: 0.75,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.vote(data);
    }
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
