import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsfeedPost } from '../model/newsfeed-post.model';
import { AppConstants } from '../util/app-constants.util';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class NewsfeedService extends GenericService {
  private apiURL = AppConstants.BASE_URL + '/newsfeed';

  getNewsfeedAll(): Observable<NewsfeedPost[]> {
    return this.http.get<NewsfeedPost[]>(this.apiURL + '/all', {
      headers: this.headers,
    });
  }
}
