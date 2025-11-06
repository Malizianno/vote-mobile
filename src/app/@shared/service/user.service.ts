import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../model/user.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/users';
  private profileURL = this.apiURL + '/profile';

  saveProfile(user: UserProfile): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.profileURL + '/save', user, {
      headers: this.headers,
    });
  }

  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileURL + '/' + id, {
      headers: this.headers,
    });
  }

  registerProfile(user: UserProfile): Observable<UserProfile> {
    return this.http.post<UserProfile>(AppConstants.BASE_URL + '/register/', user, {
      headers: this.headers,
    });
  }
}
