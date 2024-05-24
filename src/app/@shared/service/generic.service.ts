import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CredentialsService } from "./credentials.service";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root',
})
export class GenericService {
    constructor(
        public http: HttpClient, 
        private credentials: CredentialsService, 
        private router: Router,
    ) { }

    get headers(): HttpHeaders {
        const token = this.credentials.credentials?.token;
        const username = this.credentials.credentials?.username ? this.credentials.credentials.username : '';
        // const role = this.credentials.credentials?.role ? this.credentials.credentials.role.toString() : '';

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
            this.router.navigate(['/login'], { replaceUrl: true });
        }
    }
}