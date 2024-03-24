import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem, IonLabel, IonList,
  IonNote,
  IonRow,
  IonThumbnail, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PartyTypeEnum } from '../@shared/util/party-type.enum';
import { NoResultsComponent } from '../@shared/components/no-results/no-results.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonInput, IonCol, IonRow, IonGrid, IonButton, IonCard, IonHeader, IonToolbar, IonTitle, IonContent,
    ExploreContainerComponent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonThumbnail, IonLabel, CommonModule, IonButton, IonNote, FormsModule, NoResultsComponent
  ]
})
export class Tab2Page {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  parties = Object.keys(PartyTypeEnum).filter(v => isNaN(Number(v)));

  filterFirstNameBehavior = new BehaviorSubject('');
  filterLastNameBehavior = new BehaviorSubject('');
  filterPartyBehavior = new BehaviorSubject('');

  @ViewChild(IonContent) content: IonContent;

  constructor(private candidatesService: CandidateService) {
    this.reloadPage();
    this.debounceSubscription();
  }

  reloadPage() {
    this.getFiltered().subscribe({
      next: res => res,
      error: err => this.candidatesService.handleHTTPErrors(err)
    });
  }

  getFiltered() {
    return this.candidatesService.getFiltered(this.filter, this.paging).pipe(map((res) => {
      if (res) {
        this.candidates = Candidate.fromArray(res.candidates);
        this.totalCandidates = res.total;
        console.log('candidates: ', this.candidates);
      }
    }));
  }

  openMoreAbout() {
    console.log('clicked on more...');
  }

  scrollToTop() {
    // Passing a duration to the method makes it so the scroll slowly
    // goes to the top instead of instantly
    this.content.scrollToTop(500);
  }

  private debounceSubscription() {
    this.filterFirstNameBehavior.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((res: string) => {
      if (res) { this.reloadPage(); }
    });

    this.filterLastNameBehavior.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((res: string) => {
      if (res) { this.reloadPage(); }
    });

    this.filterPartyBehavior.subscribe((res: string) => {
      if (res) {
        const idx = this.parties.indexOf(res);
        this.filter.party = idx;

        this.reloadPage();
       }
    });
  }
}
