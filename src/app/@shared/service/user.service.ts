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

  save(user: User): Observable<User> {
    return this.http.post<User>(this.apiURL + '/save', user, { headers: this.headers });
  }
}
