import { Injectable } from '@angular/core';
import { AppConstants } from '../util/app-constants.util';
import { HttpOptions, HttpResponse } from '@capacitor-community/http';
import { CapacitorHttp } from '@capacitor/core';
import { LoginRequestDTO } from '../model/login.dto';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiURL = AppConstants.BASE_URL + '/login';

  login(login: LoginRequestDTO): Promise<HttpResponse> {
    console.log('login request: ', login);

    const options: HttpOptions = {
      url: this.apiURL + '/',
      data: {
        username: login.username,
        password: login.password,
        role: login.role,
      },
      headers: {
        'Content-Type': 'application/json',
        apikey: 'mobileapikey'
      }
    };

    return CapacitorHttp.post(options);
  }
}
