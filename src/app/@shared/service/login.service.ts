import { Injectable } from '@angular/core';
import { AppConstants } from '../util/app-constants.util';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequestDTO, LoginResponseDTO } from '../model/login.dto';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiURL = AppConstants.BASE_URL + '/login';

  constructor(private http: HttpClient) { }

  login(dto: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL + '/', dto, {});
}
}
