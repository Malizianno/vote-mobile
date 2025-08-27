import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/users';
  private profileURL = this.apiURL + '/profile/';

  save(user: User, updateType: string): Observable<User> {
    return this.http.post<User>(this.apiURL + '/save', user, {
      headers: this.headers,
      params: {
        updateType
      }
    });
  }

  // profile //

  get(id: number): Observable<User> {
    return this.http.get<User>(this.profileURL + id, { headers: this.headers });
  }
}
