import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ElectionService } from '../@shared/service/election.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, ElectionActiveComponent, CommonModule],
})
export class Tab1Page {
  electionEnabled = false;

  constructor(private election: ElectionService) {
    this.reloadPage();
  }

  reloadPage() {
    this.getElectionStatus().subscribe({
      next: res => res,
      error: err => this.election.handleHTTPErrors(err)
    });
  }

  getElectionStatus() {
    return this.election.getStatus().pipe(map((res) => {
      this.electionEnabled = res;
      console.log('(tab1) electionEnabled: ', this.electionEnabled);
    }));
  }
}
