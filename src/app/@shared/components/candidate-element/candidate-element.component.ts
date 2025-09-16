import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonIcon, IonRow, IonCol } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Candidate } from '../../model/candidate.model';
import { addIcons } from 'ionicons';
import { expandOutline } from 'ionicons/icons';

@Component({
  selector: 'app-candidate-element',
  templateUrl: './candidate-element.component.html',
  styleUrls: ['./candidate-element.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, 
    IonCard,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonCardContent,
    IonIcon,
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
