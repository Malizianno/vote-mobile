import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
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
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { ToastService } from '../@shared/service/toast.service';
import { AppConstants } from '../@shared/util/app-constants.util';
import { PartyTypeEnum } from '../@shared/util/party-type.enum';
import { CandidateElementComponent } from '../@shared/components/candidate-element/candidate-element.component';
import { Swiper } from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

Swiper.use([Pagination]);

@Component({
  selector: 'app-candidates',
  templateUrl: 'candidates.page.html',
  styleUrls: ['candidates.page.scss'],
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
    TranslateModule,
    LanguageSwitcherComponent,
    CandidateElementComponent,
  ],
})
export class CandidatesPage implements OnDestroy, AfterViewInit, OnChanges {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('swiperRef') swiperRef!: ElementRef;

  candidates: Candidate[] = [];

  selected = 0;

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  parties = Object.keys(PartyTypeEnum).filter((v) => isNaN(Number(v)));
  private refreshSub: Subscription;

  swiper!: Swiper;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - candidates');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every <AppCOnstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - candidates');
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // stop refreshing when tab is left
    }
  }

  constructor(
    private candidatesService: CandidateService,
    private toast: ToastService
  ) {
    this.reloadPage();
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.swiper = new Swiper(this.swiperRef.nativeElement, {
      slidesPerView: 1,
      pagination: { el: '.swiper-pagination', clickable: true },
      on: {
        slideChange: () => {
          this.selected = this.swiper.activeIndex;
          console.log('swiper data got ', this.swiper);
        },
      },
    });
  }

  ngOnChanges() {
    this.reloadSwiper();
  }

  reloadSwiper() {
    if (this.swiper && this.swiper.enabled) {
      this.swiper.update();
    }
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

          this.reloadSwiper();
          // this.toast.show('Candidates loaded successfully!');
          // console.log('candidates: ', this.candidates);
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
