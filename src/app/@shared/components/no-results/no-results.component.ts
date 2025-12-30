import { Component } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-no-results',
    templateUrl: './no-results.component.html',
    styleUrls: ['./no-results.component.scss'],
    imports: [IonCard, IonCardContent, TranslateModule]
})
export class NoResultsComponent {}
