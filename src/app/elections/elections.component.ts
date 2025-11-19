import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  add,
  arrowForward,
  arrowForwardCircle,
  checkmarkCircleOutline,
  close,
  exit,
  refresh,
} from 'ionicons/icons';
import { map } from 'rxjs';
import { Election } from '../@shared/model/election.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { ElectionService } from '../@shared/service/election.service';
import { SharedService } from '../@shared/service/shared.service';
import { ToastService } from '../@shared/service/toast.service';
import { UserService } from '../@shared/service/user.service';

@Component({
  selector: 'app-elections',
  templateUrl: './elections.component.html',
  styleUrls: ['./elections.component.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonInput,
    IonButtons,
    IonCardContent,
    IonCardHeader,
    IonRow,
    IonCard,
    IonCol,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    IonImg,
    CommonModule,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ElectionsComponent {
  elections: Election[] = [];
  lastActive: Election;

  loadedData: boolean = false;

  selected: Election;

  constructor(
    private platform: Platform,
    private router: Router,
    private credentials: CredentialsService,
    private users: UserService,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private translate: TranslateService,
    private shared: SharedService,
    private electionService: ElectionService
  ) {
    addIcons({
      close,
      exit,
      arrowForward,
      arrowForwardCircle,
      refresh,
      add,
      checkmarkCircleOutline,
    });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // console.log('Hardware back button pressed');

        this.close();
      });
    });

    this.reloadPage();
  }

  saveAndClose() {
    // update shared service
    this.shared.setSelectedElection(this.selected);
    // close :)))
    this.close();
  }

  close() {
    // go to home tab when back button/close is pressed
    this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }

  reloadPage() {
    this.loadedData = false;

    this.getAllElections().subscribe({
      next: (res) => res,
      error: (err) => this.electionService.handleHTTPErrors(err),
    });

    this.getLastElectionActive().subscribe({
      next: (res) => res,
      error: (err) => this.electionService.handleHTTPErrors(err),
    });

    this.loadedData = true;
  }

  getAllElections() {
    return this.electionService.getAll().pipe(
      map((res) => {
        console.log('all elections: ', res);

        if (res) {
          this.elections = Election.fromArray(res);
        }
      })
    );
  }

  getLastElectionActive() {
    return this.electionService.getLast().pipe(
      map((res) => {
        console.log('last active election: ', res);

        if (res) {
          this.lastActive = res;
          // update the selected field
          this.selected = res;
          // update shared service as well with last active default
          this.shared.setSelectedElection(res);
        }
      })
    );
  }
}
