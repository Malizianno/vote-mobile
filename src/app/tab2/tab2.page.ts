import { Component } from '@angular/core';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonItem, IonLabel, IonList,
  IonThumbnail, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonCard, IonHeader, IonToolbar, IonTitle, IonContent,
    ExploreContainerComponent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonThumbnail, IonLabel,
  ]
})
export class Tab2Page {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  constructor(private candidatesService: CandidateService) {
    this.reloadPage();
  }

  reloadPage() {
    this.getFiltered().subscribe();
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

}
