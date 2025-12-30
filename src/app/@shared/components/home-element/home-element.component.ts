import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { NewsElement } from '../../model/news.model';

@Component({
    selector: 'app-home-element',
    templateUrl: './home-element.component.html',
    styleUrls: ['./home-element.component.scss'],
    imports: [
        IonIcon,
        IonCol,
        IonRow,
        IonCard,
        IonItem,
        IonThumbnail,
        IonLabel,
        IonButton,
        IonCardContent,
        IonGrid,
        TranslateModule,
        CommonModule,
    ]
})
export class HomeElementComponent implements OnInit {
  @Input() news: NewsElement;

  constructor() {
    addIcons({ chevronDownCircleOutline });
  }

  ngOnInit() {}

  openDetails(news: any) {}
}
