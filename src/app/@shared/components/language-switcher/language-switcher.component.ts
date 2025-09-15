import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  standalone: true,
  imports: [IonIcon, 
    IonCard,
    IonCardContent,
    TranslateModule,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    FormsModule,
  ],
})
export class LanguageSwitcherComponent {
  selectedLang = 'ro';

  constructor(private translate: TranslateService) {
    addIcons({ arrowForward });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
