import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar, IonSpinner } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { Swiper } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { LanguageSwitcherComponent } from '../@shared/components/language-switcher/language-switcher.component';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { SharedService } from '../@shared/service/shared.service';
import { AppConstants } from '../@shared/util/app-constants.util';
import { PartyTypeEnum } from '../@shared/util/party-type.enum';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Election } from '../@shared/model/election.model';

Swiper.use([Pagination]);

@Component({
  selector: 'app-candidates',
  templateUrl: 'candidates.page.html',
  styleUrls: ['candidates.page.scss'],
  standalone: true,
  imports: [IonSpinner, 
    IonCol,
    IonRow,
    IonGrid,
    IonCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCardContent,
    CommonModule,
    FormsModule,
    NoResultsComponent,
    TranslateModule,
    LanguageSwitcherComponent,
  ],
})
export class CandidatesPage implements OnDestroy, AfterViewInit, OnChanges, OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('swiperRef') swiperRef!: ElementRef;

  candidates: Candidate[] = [];

  selected: Candidate;
  selectedElection: Election | null = null;

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  parties = Object.keys(PartyTypeEnum).filter((v) => isNaN(Number(v)));
  private refreshSub: Subscription;

  swiper!: Swiper;
  loadedData: boolean = false;

  ionViewWillEnter() {
    // console.log('ionViewWillEnter - candidates');
    this.reloadPage();
    this.refreshSub = interval(AppConstants.REFRESH_TIME_MS).subscribe(() =>
      this.reloadPage()
    ); // every <AppConstants.REFRESH_TIME_MS> s
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave - candidates');
    if (this.refreshSub) {
      this.refreshSub.unsubscribe(); // stop refreshing when tab is left
    }
  }

  constructor(
    private candidatesService: CandidateService,
    private shared: SharedService,
    private platform: Platform,
    private location: Location
  ) {
    console.log('constructor - candidates');
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.goBack();
      });
    });
  }
  
  ngOnInit(): void {
    console.log('ngOnInit - candidates');
    this.shared.selectedElection$.subscribe((election) => {
      this.selectedElection = election;
    });

    setTimeout(() => {
    this.loadedData = true;
  }, 2000);

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
          console.log('swiper data got ', this.swiper);
          this.setSelected(this.swiper.activeIndex);
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
    if (!this.selectedElection) {
      return;
    }
    
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
        console.log('candidates got res: ', res);
        if (res && this.candidates != res) {
          this.candidates = Candidate.fromArray(res);
          this.totalCandidates = res.length;

          this.setSelected(0);
          this.reloadSwiper();
          console.log('candidates: ', this.candidates);
        }
      })
    );
  }

  parseParty(party: string) {
    if ('ALL' === party) {
      return 'Toate';
    }
    return party;
  }

  setSelected(idx: number) {
    if (idx > -1 && this.candidates && idx < this.candidates.length) {
      this.selected = this.candidates[idx];
      // console.log('selected candidate: ', this.selected);
    }
  }
}
