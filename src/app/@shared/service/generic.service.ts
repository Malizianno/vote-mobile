import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CredentialsService } from './credentials.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  constructor(
    public http: HttpClient,
    private credentials: CredentialsService,
    private router: Router
  ) {}

  get headers(): HttpHeaders {
    const token = this.credentials.credentials?.token;
    let username = this.credentials.credentials?.username
      ? this.credentials.credentials.username
      : '';
    // const role = this.credentials.credentials?.role ? this.credentials.credentials.role.toString() : '';

    // WIP: there should only be id in credentials because username doesn't make sense in the voting app
    if (username == '') {
      username = this.credentials.credentials!.id.toString();
    }

    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .set('principal', username)
      .set('role', 'VOTANT')
      .set('apikey', 'mobileapikey');
  }

  handleHTTPErrors(err: HttpErrorResponse) {
    if (err && err.status === 401) {
      this.credentials.setCredentials();
      this.router.navigate(['/landing'], { replaceUrl: true });
    }
  }
}
