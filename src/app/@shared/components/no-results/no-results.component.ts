import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-no-results',
  templateUrl: './no-results.component.html',
  styleUrls: ['./no-results.component.scss'],
  standalone: true,
  imports: [ IonCard, IonCardContent ]
})
export class NoResultsComponent {
}
