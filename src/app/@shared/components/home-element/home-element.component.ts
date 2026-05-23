import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { NewsfeedPost } from '../../model/newsfeed-post.model';

@Component({
  selector: 'app-home-element',
  templateUrl: './home-element.component.html',
  styleUrls: ['./home-element.component.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonItem,
    IonCardContent,
    IonLabel,
    TranslateModule,
    CommonModule,
  ],
})
export class HomeElementComponent implements OnInit {
  @Input() news: NewsfeedPost;

  constructor() {
    addIcons({ chevronDownCircleOutline });
  }

  ngOnInit() {}

  openDetails(news: any) {}
}
