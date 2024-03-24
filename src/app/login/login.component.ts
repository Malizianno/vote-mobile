import { Component } from '@angular/core';
import {
  IonButton, IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent, IonHeader,
  IonIcon,
  IonInput, IonItem,
  IonRow,
  IonTitle, IonToolbar, IonGrid } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { LoginRequestDTO, LoginResponseDTO } from '../@shared/model/login.dto';
import { UserRole } from '../@shared/model/user.model';
import { LoginService } from '../@shared/service/login.service';
import { ElectionActiveComponent } from '../election-active/election-active.component';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CredentialsService } from '../@shared/service/credentials.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonGrid, IonInput, IonButtons, IonCardContent, IonCardHeader, IonRow, IonCard, IonCol,
    IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent,
    ElectionActiveComponent, IonButton, IonItem, IonIcon, FormsModule, IonGrid
  ],
})
export class LoginComponent {
  appVersion: string;
  dto = new LoginRequestDTO();

  constructor(private service: LoginService, private router: Router, private credentials: CredentialsService, ) {
    addIcons({ arrowForward });

    this.appVersion = environment.version;
    this.dto.role = UserRole.ADMIN; // WIP: this should be VOTANT while you differentiate 'em
  }

  login() {
    this.service.login(this.dto).subscribe((res: LoginResponseDTO) => {
      if (res?.token && res.username) {
        console.log('res: ', res);
        this.credentials.setCredentials(res, true);
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

  onUsernameChange($event: any) {
    this.dto.username = $event;
  }

  onPasswordChange($event: any) {
    this.dto.password = $event;
  }

  canLogin(): boolean {
    return !!this.dto && !!this.dto.username && !!this.dto.password;
  }
}
