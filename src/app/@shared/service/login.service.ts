import { Injectable } from '@angular/core';
import { AppConstants } from '../util/app-constants.util';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';
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
        role: 'ADMIN', // WIP: hardcoded for the moment
      },
      headers: {
        'Content-Type': 'application/json',
      }
    };

    return Http.post(options);
  }
}
