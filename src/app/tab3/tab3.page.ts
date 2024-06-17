import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonButton, IonCardSubtitle, IonCardTitle, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonRow, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { Candidate } from '../@shared/model/candidate.model';
import { Paging } from '../@shared/model/paging.model';
import { CandidateService } from '../@shared/service/candidate.service';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { ElectionService } from '../@shared/service/election.service';
import { CredentialsService } from '../@shared/service/credentials.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonGrid, IonHeader, IonToolbar, IonTitle, IonCardTitle, IonCardSubtitle, IonCardContent, IonContent, ExploreContainerComponent, CommonModule, IonIcon, IonButton, IonRow, IonCol],
})
export class Tab3Page {
  candidates: Candidate[] = [];

  filter: Candidate = new Candidate();
  paging = new Paging();
  totalCandidates = 0;

  selected = 0;

  hasVoted = false;

  constructor(private candidatesService: CandidateService, private election: ElectionService, private credentials: CredentialsService,) {
    addIcons({ checkmarkCircleOutline });
    this.reloadPage();
  }

  reloadPage() {
    this.hasVoted = this.credentials.hasVoted;

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
      }
    }));
  }

  setCandidateSelection(idToSelect: number) {
    this.selected = idToSelect;
  }

  vote(candidate: Candidate) {
    this.election.vote(candidate).subscribe((res: boolean) => {
      this.hasVoted = true;
      this.selected = 0;
      this.credentials.setHasVoted(true);
    });
  }
}
