import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NewsfeedPost,
  NewsfeedPostResponse,
} from '../model/newsfeed-post.model';
import { Paging } from '../model/paging.model';
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

  getNewsfeedFiltered(
    post: NewsfeedPost,
    paging: Paging
  ): Observable<NewsfeedPostResponse> {
    const filter = {
      post,
      paging: { page: paging.page - 1, size: paging.size },
    };

    return this.http.post<NewsfeedPostResponse>(
      this.apiURL + '/filtered',
      filter,
      {
        headers: this.headers,
      }
    );
  }
}
