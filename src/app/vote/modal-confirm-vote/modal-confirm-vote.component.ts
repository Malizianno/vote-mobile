import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Candidate } from 'src/app/@shared/model/candidate.model';

@Component({
    selector: 'app-modal-confirm-vote',
    templateUrl: 'modal-confirm-vote.component.html',
    styleUrl: 'modal-confirm-vote.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonItem,
        IonTitle,
        IonToolbar,
        TranslateModule,
    ]
})
export class ModalConfirmVoteComponent {
  @HostBinding('class') hostClass = 'modal-vote-confirm-content';

  candidate: Candidate;

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.candidate, 'confirm');
  }
}
