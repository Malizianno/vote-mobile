import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { expandOutline } from 'ionicons/icons';
import { Candidate } from '../../model/candidate.model';

@Component({
  selector: 'app-candidate-element',
  templateUrl: './candidate-element.component.html',
  styleUrls: ['./candidate-element.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonCardContent,
    TranslateModule,
    CommonModule,
  ],
})
export class CandidateElementComponent {
  @Input() candidate: Candidate;

  constructor() {
    addIcons({ expandOutline });
  }

  openDetails(candidate: any) {}
}
