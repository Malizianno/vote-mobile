import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponse } from '@capacitor-community/http';
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
  IonInput,
  IonItem,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { LoginRequestDTO } from '../@shared/model/login.dto';
import { UserRole } from '../@shared/model/user.model';
import { CredentialsService } from '../@shared/service/credentials.service';
import { LoginService } from '../@shared/service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    IonButton,
    IonItem,
    IonIcon,
    FormsModule,
    IonGrid,
    TranslateModule,
  ],
})
export class LoginComponent {
  appVersion: string;
  dto = new LoginRequestDTO();

  constructor(
    private service: LoginService,
    private router: Router,
    private credentials: CredentialsService
  ) {
    addIcons({ arrowForward });

    this.appVersion = environment.version;
    this.dto.role = UserRole.VOTANT;
  }

  async login() {
    this.service.login(this.dto).then(
      (res: HttpResponse) => {
        this.handleLoginResponse(res);
      },
      (err) => {
        this.handleLoginError(err);
      }
    );
  }

  handleLoginResponse(response: HttpResponse) {
    console.log('got data: ', response);

    if (response.status === 200) {
      const responseData = response.data;

      if (responseData?.username && responseData?.token && responseData?.role) {
        this.credentials.setCredentials(responseData);
      }

      this.router.navigate(['/tabs/home']);
    }
  }

  handleLoginError(err: string) {
    console.log('got err: ', err);
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
